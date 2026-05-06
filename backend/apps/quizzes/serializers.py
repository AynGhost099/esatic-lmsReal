from rest_framework import serializers
from .models import Quiz, Question, Choice, QuizAttempt, Answer


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["id", "text", "is_correct"]
        extra_kwargs = {"is_correct": {"write_only": True}}


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ["id", "text", "question_type", "explanation", "points", "choices", "created_by"]
        read_only_fields = ["created_by"]

    def create(self, validated_data):
        validated_data["created_by"] = self.context["request"].user
        return super().create(validated_data)


class QuizSerializer(serializers.ModelSerializer):
    questions_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = [
            "id", "section", "title", "description", "time_limit_minutes",
            "max_attempts", "pass_score", "randomize_questions",
            "show_results_immediately", "start_date", "end_date",
            "questions_count", "created_at",
        ]

    def get_questions_count(self, obj):
        return obj.questions.count()


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ["id", "quiz", "student", "status", "score", "started_at", "submitted_at", "passed"]
        read_only_fields = ["student", "status", "score", "started_at", "submitted_at"]
