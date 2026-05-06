from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin


class IsAdminOrTeacher(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_admin or request.user.is_teacher
        )


class IsEnrolledOrTeacher(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin or request.user.is_teacher:
            return True
        return obj.enrollments.filter(student=request.user).exists()
