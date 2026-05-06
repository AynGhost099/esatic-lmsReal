from django.urls import path
from . import views

urlpatterns = [
    path("dashboard/", views.DashboardView.as_view(), name="dashboard"),
    path("course/<int:course_id>/", views.CourseReportView.as_view(), name="course-report"),
    path("student/<int:student_id>/", views.StudentReportView.as_view(), name="student-report"),
]
