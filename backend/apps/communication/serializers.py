from rest_framework import serializers
from .models import Forum, Thread, Post, Notification, Announcement


class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ["id", "thread", "author", "author_name", "content", "parent", "created_at"]
        read_only_fields = ["author", "thread"]

    def get_author_name(self, obj):
        return obj.author.get_full_name()


class ThreadSerializer(serializers.ModelSerializer):
    posts_count = serializers.SerializerMethodField()

    class Meta:
        model = Thread
        fields = ["id", "forum", "author", "title", "content", "is_pinned", "is_locked", "posts_count", "created_at"]
        read_only_fields = ["author", "forum"]

    def get_posts_count(self, obj):
        return obj.posts.count()


class ForumSerializer(serializers.ModelSerializer):
    threads_count = serializers.SerializerMethodField()

    class Meta:
        model = Forum
        fields = ["id", "course", "title", "description", "threads_count", "created_at"]

    def get_threads_count(self, obj):
        return obj.threads.count()


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "notification_type", "title", "message", "is_read", "link", "created_at"]


class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = ["id", "course", "author", "author_name", "title", "content", "is_published", "created_at"]
        read_only_fields = ["author"]

    def get_author_name(self, obj):
        return obj.author.get_full_name()
