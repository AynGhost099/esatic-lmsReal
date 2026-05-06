import pytest
from rest_framework.test import APIClient
from apps.accounts.models import User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(
        email="admin@esatic.ci",
        password="AdminPass123!",
        first_name="Admin",
        last_name="ESATIC",
    )


@pytest.fixture
def teacher_user(db):
    return User.objects.create_user(
        email="teacher@esatic.ci",
        password="TeacherPass123!",
        first_name="Jean",
        last_name="Koné",
        role=User.Role.TEACHER,
        is_verified=True,
    )


@pytest.fixture
def student_user(db):
    return User.objects.create_user(
        email="student@esatic.ci",
        password="StudentPass123!",
        first_name="Marie",
        last_name="Touré",
        role=User.Role.STUDENT,
        is_verified=True,
    )


@pytest.fixture
def auth_client(api_client, student_user):
    api_client.force_authenticate(user=student_user)
    return api_client


@pytest.fixture
def teacher_client(api_client, teacher_user):
    api_client.force_authenticate(user=teacher_user)
    return api_client


@pytest.fixture
def admin_client(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    return api_client
