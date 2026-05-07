import pytest
from django.urls import reverse
from apps.courses.models import Category, Course, Section
from apps.quizzes.models import Question, Choice, Quiz, QuizQuestion, QuizAttempt


@pytest.fixture
def category(db):
    return Category.objects.create(name="Mathématiques", slug="maths")


@pytest.fixture
def course(db, teacher_user, category):
    return Course.objects.create(
        title="Mathématiques Discrètes", slug="maths-discretes",
        description="Cours de maths", category=category,
        teacher=teacher_user, status=Course.Status.PUBLISHED,
    )


@pytest.fixture
def section(db, course):
    return Section.objects.create(course=course, title="Chapitre 1", order=1)


@pytest.fixture
def question_tf(db, teacher_user):
    q = Question.objects.create(text="Python est un langage de programmation.",
        question_type=Question.Type.TRUE_FALSE, points=1, created_by=teacher_user)
    Choice.objects.create(question=q, text="Vrai", is_correct=True)
    Choice.objects.create(question=q, text="Faux", is_correct=False)
    return q


@pytest.fixture
def question_mcq(db, teacher_user):
    q = Question.objects.create(text="Quels sont des langages compilés ?",
        question_type=Question.Type.MCQ, points=2, created_by=teacher_user)
    Choice.objects.create(question=q, text="C", is_correct=True)
    Choice.objects.create(question=q, text="C++", is_correct=True)
    Choice.objects.create(question=q, text="Python", is_correct=False)
    Choice.objects.create(question=q, text="JavaScript", is_correct=False)
    return q


@pytest.fixture
def quiz(db, section, question_tf, question_mcq):
    q = Quiz.objects.create(section=section, title="Quiz Python", time_limit_minutes=30, pass_score=60.0)
    QuizQuestion.objects.create(quiz=q, question=question_tf, order=1)
    QuizQuestion.objects.create(quiz=q, question=question_mcq, order=2)
    return q


@pytest.mark.django_db
class TestQuizList:
    def test_list_quizzes(self, auth_client, quiz):
        response = auth_client.get(reverse("quiz-list"))
        assert response.status_code == 200
        assert response.data["count"] >= 1

    def test_quiz_detail_has_questions(self, auth_client, quiz):
        response = auth_client.get(reverse("quiz-detail", kwargs={"pk": quiz.id}))
        assert response.status_code == 200
        assert response.data["title"] == quiz.title
        assert "questions" in response.data
        assert len(response.data["questions"]) == 2


@pytest.mark.django_db
class TestQuizAttempt:
    def test_start_attempt(self, auth_client, student_user, quiz):
        response = auth_client.post(reverse("quiz-attempt", kwargs={"quiz_id": quiz.id}))
        assert response.status_code in (200, 201)
        assert QuizAttempt.objects.filter(student=student_user, quiz=quiz).exists()

    def test_cannot_start_twice(self, auth_client, student_user, quiz):
        QuizAttempt.objects.create(student=student_user, quiz=quiz)
        response = auth_client.post(reverse("quiz-attempt", kwargs={"quiz_id": quiz.id}))
        assert response.status_code == 400


@pytest.mark.django_db
class TestQuizSubmit:
    def test_submit_correct_answers(self, auth_client, student_user, quiz, question_tf, question_mcq):
        QuizAttempt.objects.create(student=student_user, quiz=quiz)
        correct_tf = question_tf.choices.get(is_correct=True)
        correct_mcq = list(question_mcq.choices.filter(is_correct=True).values_list("id", flat=True))
        response = auth_client.put(reverse("quiz-submit", kwargs={"quiz_id": quiz.id}), {
            "answers": [
                {"question_id": question_tf.id, "selected_choices": [correct_tf.id]},
                {"question_id": question_mcq.id, "selected_choices": correct_mcq},
            ]
        }, format="json")
        assert response.status_code == 200
        assert "score" in response.data
        assert response.data["score"] == 100.0

    def test_submit_all_wrong(self, auth_client, student_user, quiz, question_tf, question_mcq):
        QuizAttempt.objects.create(student=student_user, quiz=quiz)
        wrong_tf = question_tf.choices.get(is_correct=False)
        wrong_mcq = list(question_mcq.choices.filter(is_correct=False).values_list("id", flat=True))
        response = auth_client.put(reverse("quiz-submit", kwargs={"quiz_id": quiz.id}), {
            "answers": [
                {"question_id": question_tf.id, "selected_choices": [wrong_tf.id]},
                {"question_id": question_mcq.id, "selected_choices": wrong_mcq},
            ]
        }, format="json")
        assert response.status_code == 200
        assert response.data["score"] == 0.0
        assert response.data["passed"] is False
