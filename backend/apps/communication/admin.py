from django.contrib import admin
from .models import Forum, Thread, Post, Notification, Announcement

admin.site.register(Forum)
admin.site.register(Thread)
admin.site.register(Post)
admin.site.register(Notification)
admin.site.register(Announcement)
