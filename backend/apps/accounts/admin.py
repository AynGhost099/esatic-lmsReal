from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Cohort


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ["-date_joined"]
    list_display = ["email", "first_name", "last_name", "role", "is_active", "is_verified"]
    list_filter = ["role", "is_active", "is_verified"]
    search_fields = ["email", "first_name", "last_name"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Informations personnelles", {"fields": ("first_name", "last_name", "avatar", "bio", "phone", "date_of_birth")}),
        ("Rôle & Permissions", {"fields": ("role", "is_verified", "is_active", "is_staff", "is_superuser")}),
    )
    add_fieldsets = (
        (None, {"classes": ("wide",), "fields": ("email", "first_name", "last_name", "role", "password1", "password2")}),
    )


@admin.register(Cohort)
class CohortAdmin(admin.ModelAdmin):
    list_display = ["name", "created_by", "created_at"]
    filter_horizontal = ["members"]
