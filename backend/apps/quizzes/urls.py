from django.urls import path
from . import views

urlpatterns = [
    path("", views.QuizListView.as_view(), name="quiz-list"),
    path("<int:pk>/", views.QuizDetailView.as_view(), name="quiz-detail"),
    path("<int:quiz_id>/attempt/", views.StartAttemptView.as_view(), name="quiz-attempt"),
    path("<int:quiz_id>/submit/", views.SubmitAttemptView.as_view(), name="quiz-submit"),
    path("questions/", views.QuestionListView.as_view(), name="question-list"),
]
