from rest_framework import serializers
from .models import Assignment, Submission, Grade


class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = [
            "id", "section", "title", "description", "instructions",
            "deadline", "max_score", "allow_late_submission", "late_penalty_percent",
            "created_at",
        ]


class GradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Grade
        fields = ["id", "submission", "grader", "score", "feedback", "graded_at"]
        read_only_fields = ["grader", "graded_at"]


class SubmissionSerializer(serializers.ModelSerializer):
    grade = GradeSerializer(read_only=True)

    class Meta:
        model = Submission
        fields = [
            "id", "assignment", "student", "status", "content", "file",
            "submitted_at", "is_late", "grade",
        ]
        read_only_fields = ["student", "submitted_at", "is_late"]
