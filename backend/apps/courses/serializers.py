from rest_framework import serializers
from .models import Course, Category, Section, Enrollment


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description"]


class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ["id", "title", "order", "description", "course"]
        read_only_fields = ["course"]


class CourseSerializer(serializers.ModelSerializer):
    enrolled_count = serializers.ReadOnlyField()
    teacher_name = serializers.SerializerMethodField()
    sections = SectionSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = [
            "id", "title", "slug", "description", "short_description",
            "thumbnail", "category", "teacher", "teacher_name", "status",
            "start_date", "end_date", "max_students", "enrolled_count",
            "sections", "created_at",
        ]
        read_only_fields = ["teacher", "created_at"]

    def get_teacher_name(self, obj):
        return obj.teacher.get_full_name()


class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ["id", "student", "course", "status", "enrolled_at", "progress", "is_active"]
        read_only_fields = ["student", "enrolled_at", "progress"]
