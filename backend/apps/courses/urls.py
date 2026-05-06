from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register("", views.CourseViewSet, basename="course")
router.register("categories", views.CategoryViewSet, basename="category")

urlpatterns = [
    path("", include(router.urls)),
    path("<int:course_id>/enroll/", views.EnrollView.as_view(), name="enroll"),
    path("<int:course_id>/unenroll/", views.UnenrollView.as_view(), name="unenroll"),
    path("<int:course_id>/sections/", views.SectionListView.as_view(), name="section-list"),
]
