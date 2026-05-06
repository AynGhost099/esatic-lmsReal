from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Avg, Count
from apps.courses.models import Course, Enrollment
from apps.quizzes.models import QuizAttempt
from apps.assignments.models import Submission
from apps.accounts.permissions import IsAdminOrTeacher
from .models import CourseProgress, ActivityLog
from .serializers import CourseProgressSerializer, ActivityLogSerializer


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.is_student:
            enrollments = Enrollment.objects.filter(student=user, is_active=True)
            return Response({
                "enrolled_courses": enrollments.count(),
                "completed_courses": enrollments.filter(status=Enrollment.Status.COMPLETED).count(),
                "pending_assignments": Submission.objects.filter(
                    student=user, status=Submission.Status.DRAFT
                ).count(),
                "recent_activity": ActivityLogSerializer(
                    ActivityLog.objects.filter(user=user)[:5], many=True
                ).data,
            })
        if user.is_teacher:
            courses = Course.objects.filter(teacher=user)
            return Response({
                "total_courses": courses.count(),
                "total_students": Enrollment.objects.filter(
                    course__in=courses, is_active=True
                ).values("student").distinct().count(),
                "pending_grading": Submission.objects.filter(
                    assignment__section__course__in=courses,
                    status=Submission.Status.SUBMITTED,
                ).count(),
            })
        return Response({
            "total_users": user.__class__.objects.count(),
            "total_courses": Course.objects.count(),
            "total_enrollments": Enrollment.objects.count(),
        })


class CourseReportView(APIView):
    permission_classes = [IsAdminOrTeacher]

    def get(self, request, course_id):
        course = generics.get_object_or_404(Course, pk=course_id)
        enrollments = Enrollment.objects.filter(course=course)
        attempts = QuizAttempt.objects.filter(quiz__section__course=course)
        return Response({
            "course": course.title,
            "total_enrolled": enrollments.count(),
            "active_students": enrollments.filter(is_active=True).count(),
            "avg_progress": enrollments.aggregate(avg=Avg("progress"))["avg"] or 0,
            "avg_quiz_score": attempts.aggregate(avg=Avg("score"))["avg"] or 0,
            "completion_rate": enrollments.filter(status=Enrollment.Status.COMPLETED).count(),
        })


class StudentReportView(APIView):
    permission_classes = [IsAdminOrTeacher]

    def get(self, request, student_id):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        student = generics.get_object_or_404(User, pk=student_id)
        enrollments = Enrollment.objects.filter(student=student)
        return Response({
            "student": student.get_full_name(),
            "courses": enrollments.count(),
            "avg_score": QuizAttempt.objects.filter(student=student).aggregate(avg=Avg("score"))["avg"] or 0,
            "submissions": Submission.objects.filter(student=student).count(),
        })
