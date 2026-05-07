import pytest
from django.urls import reverse
from apps.accounts.models import User


@pytest.mark.django_db
class TestUserRegistration:
    def test_register_student(self, api_client):
        response = api_client.post(reverse("register"), {
            "email": "nouveau@esatic.ci",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "first_name": "Nouveau",
            "last_name": "Etudiant",
        })
        assert response.status_code == 201
        assert User.objects.filter(email="nouveau@esatic.ci").exists()
        assert User.objects.get(email="nouveau@esatic.ci").role == User.Role.STUDENT

    def test_register_duplicate_email(self, api_client, student_user):
        response = api_client.post(reverse("register"), {
            "email": student_user.email,
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "first_name": "Test",
            "last_name": "Dup",
        })
        assert response.status_code == 400

    def test_register_password_mismatch(self, api_client):
        response = api_client.post(reverse("register"), {
            "email": "autre@esatic.ci",
            "password": "SecurePass123!",
            "password_confirm": "DifferentPass456!",
            "first_name": "Test",
            "last_name": "User",
        })
        assert response.status_code == 400


@pytest.mark.django_db
class TestAuthentication:
    def test_login_success(self, api_client, student_user):
        response = api_client.post(reverse("login"), {"email": student_user.email, "password": "StudentPass123!"})
        assert response.status_code == 200
        assert "access" in response.data
        assert "refresh" in response.data

    def test_login_wrong_password(self, api_client, student_user):
        response = api_client.post(reverse("login"), {"email": student_user.email, "password": "WrongPassword"})
        assert response.status_code == 401

    def test_login_unknown_email(self, api_client):
        response = api_client.post(reverse("login"), {"email": "inconnu@esatic.ci", "password": "SomePass"})
        assert response.status_code == 401

    def test_token_refresh(self, api_client, student_user):
        tokens = api_client.post(reverse("login"), {"email": student_user.email, "password": "StudentPass123!"}).data
        response = api_client.post(reverse("token-refresh"), {"refresh": tokens["refresh"]})
        assert response.status_code == 200
        assert "access" in response.data


@pytest.mark.django_db
class TestUserProfile:
    def test_get_own_profile(self, auth_client, student_user):
        response = auth_client.get(reverse("profile"))
        assert response.status_code == 200
        assert response.data["email"] == student_user.email

    def test_update_own_profile(self, auth_client):
        response = auth_client.patch(reverse("profile"), {"bio": "Étudiant en informatique"})
        assert response.status_code == 200
        assert response.data["bio"] == "Étudiant en informatique"

    def test_profile_requires_auth(self, api_client):
        response = api_client.get(reverse("profile"))
        assert response.status_code == 401

    def test_admin_can_list_users(self, admin_client):
        response = admin_client.get(reverse("user-list"))
        assert response.status_code == 200

    def test_student_cannot_list_users(self, auth_client):
        response = auth_client.get(reverse("user-list"))
        assert response.status_code == 403
