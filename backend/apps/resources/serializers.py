from rest_framework import serializers
from .models import Resource, ResourceVersion


class ResourceVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResourceVersion
        fields = ["id", "version_number", "file", "created_by", "created_at", "change_notes"]
        read_only_fields = ["version_number", "created_by", "created_at"]


class ResourceSerializer(serializers.ModelSerializer):
    file_size = serializers.ReadOnlyField()
    versions = ResourceVersionSerializer(many=True, read_only=True)

    class Meta:
        model = Resource
        fields = [
            "id", "section", "title", "resource_type", "description",
            "file", "url", "content", "order", "is_visible",
            "uploaded_by", "file_size", "versions", "created_at",
        ]
        read_only_fields = ["uploaded_by", "created_at"]
