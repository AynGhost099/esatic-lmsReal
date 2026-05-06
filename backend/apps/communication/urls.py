from django.urls import path
from . import views

urlpatterns = [
    path("forums/", views.ForumListView.as_view(), name="forum-list"),
    path("forums/<int:forum_id>/threads/", views.ThreadListView.as_view(), name="thread-list"),
    path("threads/<int:thread_id>/posts/", views.PostListView.as_view(), name="post-list"),
    path("notifications/", views.NotificationListView.as_view(), name="notification-list"),
    path("notifications/<int:pk>/read/", views.MarkReadView.as_view(), name="mark-read"),
    path("announcements/", views.AnnouncementListView.as_view(), name="announcement-list"),
]
