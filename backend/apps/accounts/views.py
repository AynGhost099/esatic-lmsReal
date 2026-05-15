from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import (
    CustomTokenObtainPairSerializer,
    UserRegisterSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    CohortSerializer,
)
from .models import Cohort
from .permissions import IsAdminUser, IsAdminOrTeacher

User = get_user_model()


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        user.is_active = True  # ← AJOUTÉ
        user.save()
        return user


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save()
        return Response({"detail": "Mot de passe mis à jour avec succès."})


class UserListView(generics.ListAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdminUser]
    queryset = User.objects.all()
    search_fields = ["email", "first_name", "last_name"]
    filterset_fields = ["role", "is_active", "is_verified"]


class CohortViewSet(generics.ListCreateAPIView):
    serializer_class = CohortSerializer
    permission_classes = [IsAdminOrTeacher]
    queryset = Cohort.objects.all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
