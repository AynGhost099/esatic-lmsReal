from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Avg, Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta
from apps.courses.models import Course, Enrollment
from apps.quizzes.models import QuizAttempt
from apps.assignments.models import Submission
from apps.accounts.permissions import IsAdminOrTeacher
from .models import CourseProgress, ActivityLog
from .serializers import CourseProgressSerializer, ActivityLogSerializer

DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]


class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        week_start = today - timedelta(days=6)

        activity_qs = (
            ActivityLog.objects.filter(user=user, timestamp__date__gte=week_start)
            .annotate(date=TruncDate("timestamp"))
            .values("date")
            .annotate(count=Count("id"))
            .order_by("date")
        )
        activity_map = {str(row["date"]): row["count"] for row in activity_qs}
        activity_by_day = [
            {
                "date": DAY_LABELS[(week_start + timedelta(days=i)).weekday()],
                "count": activity_map.get(str(week_start + timedelta(days=i)), 0),
            }
            for i in range(7)
        ]

        if user.is_student:
            enrollments = Enrollment.objects.filter(student=user, is_active=True)
            completed = enrollments.filter(status=Enrollment.Status.COMPLETED).count()
            in_progress = enrollments.filter(status=Enrollment.Status.ACTIVE).count()
            not_started = max(0, enrollments.count() - completed - in_progress)
            return Response({
                "enrolled_courses": enrollments.count(),
                "completed_courses": completed,
                "pending_assignments": Submission.objects.filter(
                    student=user, status=Submission.Status.DRAFT
                ).count(),
                "quiz_attempts": QuizAttempt.objects.filter(student=user).count(),
                "activity_by_day": activity_by_day,
                "progress_distribution": [
                    {"label": "Terminé", "value": completed},
                    {"label": "En cours", "value": in_progress},
                    {"label": "Non commencé", "value": not_started},
                ],
            })

        if user.is_teacher:
            courses = Course.objects.filter(teacher=user)
            enrollments_by_course = [
                {"course": c.title[:20], "count": Enrollment.objects.filter(course=c, is_active=True).count()}
                for c in courses[:8]
            ]
            return Response({
                "total_courses": courses.count(),
                "total_students": Enrollment.objects.filter(
                    course__in=courses, is_active=True
                ).values("student").distinct().count(),
                "pending_grading": Submission.objects.filter(
                    assignment__section__course__in=courses,
                    status=Submission.Status.SUBMITTED,
                ).count(),
                "total_enrollments": Enrollment.objects.filter(course__in=courses).count(),
                "activity_by_day": activity_by_day,
                "enrollments_by_course": enrollments_by_course,
                "progress_distribution": [
                    {"label": "Publiés", "value": courses.filter(status=Course.Status.PUBLISHED).count()},
                    {"label": "Brouillons", "value": courses.filter(status=Course.Status.DRAFT).count()},
                    {"label": "Archivés", "value": courses.filter(status=Course.Status.ARCHIVED).count()},
                ],
            })

        # Admin
        UserModel = user.__class__
        all_courses = Course.objects.all()
        enrollments_by_course = [
            {"course": c.title[:20], "count": Enrollment.objects.filter(course=c, is_active=True).count()}
            for c in all_courses.filter(status=Course.Status.PUBLISHED)[:8]
        ]
        return Response({
            "total_users": UserModel.objects.count(),
            "total_courses": all_courses.count(),
            "total_enrollments": Enrollment.objects.count(),
            "pending_grading": Submission.objects.filter(status=Submission.Status.SUBMITTED).count(),
            "activity_by_day": activity_by_day,
            "enrollments_by_course": enrollments_by_course,
            "progress_distribution": [
                {"label": "Admins", "value": UserModel.objects.filter(role="admin").count()},
                {"label": "Enseignants", "value": UserModel.objects.filter(role="teacher").count()},
                {"label": "Étudiants", "value": UserModel.objects.filter(role="student").count()},
            ],
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
