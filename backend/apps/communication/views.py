from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Forum, Thread, Post, Notification, Announcement
from .serializers import ForumSerializer, ThreadSerializer, PostSerializer, NotificationSerializer, AnnouncementSerializer
from apps.accounts.permissions import IsAdminOrTeacher


class ForumListView(generics.ListCreateAPIView):
    serializer_class = ForumSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Forum.objects.filter(is_active=True)


class ThreadListView(generics.ListCreateAPIView):
    serializer_class = ThreadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Thread.objects.filter(forum_id=self.kwargs["forum_id"])

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, forum_id=self.kwargs["forum_id"])


class PostListView(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Post.objects.filter(thread_id=self.kwargs["thread_id"])

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, thread_id=self.kwargs["thread_id"])


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)


class MarkReadView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, pk):
        notification = generics.get_object_or_404(Notification, pk=pk, recipient=request.user)
        notification.is_read = True
        notification.save()
        return Response({"detail": "Notification marquée comme lue."})


class AnnouncementListView(generics.ListCreateAPIView):
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Announcement.objects.filter(is_published=True)

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminOrTeacher()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
