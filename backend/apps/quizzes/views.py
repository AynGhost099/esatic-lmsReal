from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.utils import timezone
from .models import Quiz, Question, QuizAttempt, Answer
from .serializers import QuizSerializer, QuestionSerializer, QuizAttemptSerializer
from apps.accounts.permissions import IsAdminOrTeacher


class QuizListView(generics.ListCreateAPIView):
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Quiz.objects.filter(section__course__status="published")

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminOrTeacher()]
        return [permissions.IsAuthenticated()]


class QuizDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [permissions.IsAuthenticated]


class StartAttemptView(generics.CreateAPIView):
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, quiz_id):
        quiz = generics.get_object_or_404(Quiz, pk=quiz_id)
        attempts = QuizAttempt.objects.filter(student=request.user, quiz=quiz)
        if attempts.count() >= quiz.max_attempts:
            return Response({"detail": "Nombre maximum de tentatives atteint."}, status=status.HTTP_400_BAD_REQUEST)
        attempt = QuizAttempt.objects.create(student=request.user, quiz=quiz)
        return Response(QuizAttemptSerializer(attempt).data, status=status.HTTP_201_CREATED)


class SubmitAttemptView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, quiz_id):
        attempt = generics.get_object_or_404(
            QuizAttempt, quiz_id=quiz_id, student=request.user, status=QuizAttempt.Status.IN_PROGRESS
        )
        attempt.status = QuizAttempt.Status.SUBMITTED
        attempt.submitted_at = timezone.now()

        total_points = 0
        earned_points = 0
        for answer_data in request.data.get("answers", []):
            question = generics.get_object_or_404(Question, pk=answer_data["question_id"])
            answer = Answer.objects.create(attempt=attempt, question=question)
            correct_ids = set(question.choices.filter(is_correct=True).values_list("id", flat=True))
            selected_ids = set(answer_data.get("selected_choices", []))
            answer.selected_choices.set(selected_ids)
            if correct_ids == selected_ids:
                answer.is_correct = True
                answer.points_earned = question.points
                earned_points += question.points
            else:
                answer.is_correct = False
            answer.save()
            total_points += question.points

        attempt.score = (earned_points / total_points * 100) if total_points > 0 else 0
        attempt.status = QuizAttempt.Status.GRADED
        attempt.save()
        return Response({"score": attempt.score, "passed": attempt.passed})


class QuestionListView(generics.ListCreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [IsAdminOrTeacher]
    queryset = Question.objects.all()
    search_fields = ["text"]
    filterset_fields = ["question_type"]
