from django.db import models
from django.conf import settings
from apps.courses.models import Course, Enrollment


class CourseProgress(models.Model):
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name="progress_detail")
    total_resources = models.PositiveIntegerField(default=0)
    completed_resources = models.PositiveIntegerField(default=0)
    total_quizzes = models.PositiveIntegerField(default=0)
    passed_quizzes = models.PositiveIntegerField(default=0)
    total_assignments = models.PositiveIntegerField(default=0)
    submitted_assignments = models.PositiveIntegerField(default=0)
    last_activity = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def completion_percentage(self):
        total = self.total_resources + self.total_quizzes + self.total_assignments
        if total == 0:
            return 0
        done = self.completed_resources + self.passed_quizzes + self.submitted_assignments
        return round((done / total) * 100, 2)


class ActivityLog(models.Model):
    class Action(models.TextChoices):
        LOGIN = "login", "Connexion"
        LOGOUT = "logout", "Déconnexion"
        VIEW_COURSE = "view_course", "Vue cours"
        VIEW_RESOURCE = "view_resource", "Vue ressource"
        SUBMIT_QUIZ = "submit_quiz", "Soumission quiz"
        SUBMIT_ASSIGNMENT = "submit_assignment", "Soumission devoir"
        POST_FORUM = "post_forum", "Publication forum"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="activity_logs")
    action = models.CharField(max_length=30, choices=Action.choices)
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True)
    metadata = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["user", "timestamp"]),
            models.Index(fields=["course", "timestamp"]),
        ]
