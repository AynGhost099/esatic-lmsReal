from django.contrib import admin
from .models import CourseProgress, ActivityLog

admin.site.register(CourseProgress)
admin.site.register(ActivityLog)
