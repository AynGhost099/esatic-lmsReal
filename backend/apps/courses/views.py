from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from django.utils import timezone
from .models import Course, Category, Section, Enrollment
from .serializers import CourseSerializer, CategorySerializer, SectionSerializer, EnrollmentSerializer
from apps.accounts.permissions import IsAdminOrTeacher


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminOrTeacher()]
        return [permissions.IsAuthenticated()]


class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    filterset_fields = ["status", "category", "teacher"]
    search_fields = ["title", "description"]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Course.objects.all()
        if user.is_teacher:
            return Course.objects.filter(teacher=user)
        return Course.objects.filter(
            status=Course.Status.PUBLISHED,
            enrollments__student=user,
            enrollments__is_active=True,
        )

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdminOrTeacher()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)


class EnrollView(generics.CreateAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, course_id):
        course = generics.get_object_or_404(Course, pk=course_id, status=Course.Status.PUBLISHED)
        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user, course=course,
            defaults={"is_active": True}
        )
        if not created:
            enrollment.is_active = True
            enrollment.status = Enrollment.Status.ACTIVE
            enrollment.save()
        return Response(EnrollmentSerializer(enrollment).data, status=status.HTTP_201_CREATED)


class UnenrollView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def destroy(self, request, course_id):
        enrollment = generics.get_object_or_404(
            Enrollment, student=request.user, course_id=course_id
        )
        enrollment.is_active = False
        enrollment.status = Enrollment.Status.DROPPED
        enrollment.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SectionListView(generics.ListCreateAPIView):
    serializer_class = SectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Section.objects.filter(course_id=self.kwargs["course_id"])

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminOrTeacher()]
        return [permissions.IsAuthenticated()]
