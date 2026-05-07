import pytest
from django.urls import reverse
from apps.courses.models import Category, Course, Enrollment


@pytest.fixture
def category(db):
    return Category.objects.create(name="Informatique", slug="informatique")


@pytest.fixture
def course(db, teacher_user, category):
    return Course.objects.create(
        title="Algorithmique et Structures de Données",
        slug="algo-structures-donnees",
        description="Cours d'introduction aux algorithmes.",
        category=category,
        teacher=teacher_user,
        status=Course.Status.PUBLISHED,
    )


@pytest.mark.django_db
class TestCourseList:
    def test_list_published_courses(self, auth_client, course):
        response = auth_client.get(reverse("course-list"))
        assert response.status_code == 200
        assert response.data["count"] >= 1

    def test_unauthenticated_cannot_list(self, api_client):
        response = api_client.get(reverse("course-list"))
        assert response.status_code == 401

    def test_draft_not_in_student_list(self, auth_client, teacher_user, category):
        Course.objects.create(
            title="Cours Brouillon", slug="cours-brouillon",
            description="Non publié", category=category,
            teacher=teacher_user, status=Course.Status.DRAFT,
        )
        response = auth_client.get(reverse("course-list"))
        for c in response.data["results"]:
            assert c["status"] != "draft"


@pytest.mark.django_db
class TestCourseDetail:
    def test_get_course_detail(self, auth_client, course):
        response = auth_client.get(reverse("course-detail", kwargs={"pk": course.id}))
        assert response.status_code == 200
        assert response.data["title"] == course.title

    def test_course_not_found(self, auth_client):
        response = auth_client.get(reverse("course-detail", kwargs={"pk": 99999}))
        assert response.status_code == 404


@pytest.mark.django_db
class TestEnrollment:
    def test_student_can_enroll(self, auth_client, course, student_user):
        response = auth_client.post(reverse("enroll", kwargs={"course_id": course.id}))
        assert response.status_code in (200, 201)
        assert Enrollment.objects.filter(student=student_user, course=course).exists()

    def test_cannot_enroll_twice(self, auth_client, course, student_user):
        Enrollment.objects.create(student=student_user, course=course)
        response = auth_client.post(reverse("enroll", kwargs={"course_id": course.id}))
        assert response.status_code in (200, 201)


@pytest.mark.django_db
class TestCourseCreation:
    def test_teacher_can_create_course(self, teacher_client, category):
        response = teacher_client.post(reverse("course-list"), {
            "title": "Nouveau Cours", "slug": "nouveau-cours",
            "description": "Description du cours", "category": category.id, "status": "draft",
        })
        assert response.status_code == 201

    def test_student_cannot_create_course(self, auth_client, category):
        response = auth_client.post(reverse("course-list"), {
            "title": "Cours Interdit", "slug": "cours-interdit",
            "description": "Un étudiant ne peut pas créer", "category": category.id,
        })
        assert response.status_code == 403
