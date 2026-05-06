from django.contrib import admin
from .models import Course, Category, Section, Enrollment


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ["title", "teacher", "category", "status", "enrolled_count", "created_at"]
    list_filter = ["status", "category"]
    search_fields = ["title", "teacher__email"]
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}


admin.site.register(Section)
admin.site.register(Enrollment)
