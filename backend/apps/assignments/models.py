from django.db import models
from django.conf import settings
from apps.courses.models import Section


class Assignment(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name="assignments")
    title = models.CharField(max_length=255)
    description = models.TextField()
    instructions = models.TextField(blank=True)
    deadline = models.DateTimeField()
    max_score = models.FloatField(default=20.0)
    allow_late_submission = models.BooleanField(default=False)
    late_penalty_percent = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Devoir"
        ordering = ["deadline"]

    def __str__(self):
        return self.title


class Submission(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Brouillon"
        SUBMITTED = "submitted", "Soumis"
        GRADED = "graded", "Noté"
        RETURNED = "returned", "Retourné"

    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name="submissions")
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="submissions"
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    content = models.TextField(blank=True)
    file = models.FileField(upload_to="submissions/", null=True, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    is_late = models.BooleanField(default=False)

    class Meta:
        unique_together = ["assignment", "student"]
        verbose_name = "Soumission"

    def __str__(self):
        return f"{self.student} → {self.assignment}"


class Grade(models.Model):
    submission = models.OneToOneField(Submission, on_delete=models.CASCADE, related_name="grade")
    grader = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="grades_given"
    )
    score = models.FloatField()
    feedback = models.TextField(blank=True)
    graded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Note: {self.score} pour {self.submission}"
