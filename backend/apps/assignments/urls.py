from django.urls import path
from . import views

urlpatterns = [
    path("", views.AssignmentListView.as_view(), name="assignment-list"),
    path("<int:pk>/", views.AssignmentDetailView.as_view(), name="assignment-detail"),
    path("<int:assignment_id>/submit/", views.SubmissionView.as_view(), name="submit-assignment"),
    path("<int:assignment_id>/my_submission/", views.MySubmissionView.as_view(), name="my-submission"),
    path("<int:assignment_id>/submissions/", views.SubmissionListView.as_view(), name="submission-list"),
    path("submissions/<int:submission_id>/grade/", views.GradeView.as_view(), name="grade-submission"),
]
