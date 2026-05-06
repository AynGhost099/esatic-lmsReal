from rest_framework import serializers
from .models import CourseProgress, ActivityLog


class CourseProgressSerializer(serializers.ModelSerializer):
    completion_percentage = serializers.ReadOnlyField()

    class Meta:
        model = CourseProgress
        fields = [
            "id", "enrollment", "total_resources", "completed_resources",
            "total_quizzes", "passed_quizzes", "total_assignments",
            "submitted_assignments", "completion_percentage", "last_activity",
        ]


class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = ["id", "action", "course", "metadata", "timestamp"]
