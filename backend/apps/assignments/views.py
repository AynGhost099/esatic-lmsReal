from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.utils import timezone
from .models import Assignment, Submission, Grade
from .serializers import AssignmentSerializer, SubmissionSerializer, GradeSerializer
from apps.accounts.permissions import IsAdminOrTeacher


class AssignmentListView(generics.ListCreateAPIView):
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Assignment.objects.filter(
            section__course__enrollments__student=self.request.user,
            section__course__enrollments__is_active=True,
        )

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminOrTeacher()]
        return [permissions.IsAuthenticated()]


class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]


class SubmissionView(generics.CreateAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, assignment_id):
        assignment = generics.get_object_or_404(Assignment, pk=assignment_id)
        submission, created = Submission.objects.get_or_create(
            assignment=assignment, student=request.user
        )
        is_late = timezone.now() > assignment.deadline
        submission.content = request.data.get("content", submission.content)
        if "file" in request.FILES:
            submission.file = request.FILES["file"]
        submission.status = Submission.Status.SUBMITTED
        submission.submitted_at = timezone.now()
        submission.is_late = is_late
        submission.save()
        return Response(SubmissionSerializer(submission).data, status=status.HTTP_201_CREATED)


class MySubmissionView(generics.RetrieveAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return generics.get_object_or_404(
            Submission,
            assignment_id=self.kwargs["assignment_id"],
            student=self.request.user,
        )


class SubmissionListView(generics.ListAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [IsAdminOrTeacher]

    def get_queryset(self):
        return Submission.objects.filter(assignment_id=self.kwargs["assignment_id"])


class GradeView(generics.CreateAPIView):
    serializer_class = GradeSerializer
    permission_classes = [IsAdminOrTeacher]

    def create(self, request, submission_id):
        submission = generics.get_object_or_404(Submission, pk=submission_id)
        grade, _ = Grade.objects.update_or_create(
            submission=submission,
            defaults={"grader": request.user, **request.data}
        )
        submission.status = Submission.Status.GRADED
        submission.save()
        return Response(GradeSerializer(grade).data, status=status.HTTP_201_CREATED)
