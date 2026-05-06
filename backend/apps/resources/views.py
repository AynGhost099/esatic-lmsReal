from rest_framework import generics, permissions
from .models import Resource, ResourceVersion
from .serializers import ResourceSerializer, ResourceVersionSerializer
from apps.accounts.permissions import IsAdminOrTeacher


class ResourceListView(generics.ListCreateAPIView):
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ["resource_type", "section"]

    def get_queryset(self):
        return Resource.objects.filter(is_visible=True)

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminOrTeacher()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class ResourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticated]


class ResourceVersionView(generics.ListCreateAPIView):
    serializer_class = ResourceVersionSerializer
    permission_classes = [IsAdminOrTeacher]

    def get_queryset(self):
        return ResourceVersion.objects.filter(resource_id=self.kwargs["resource_id"])

    def perform_create(self, serializer):
        resource = Resource.objects.get(pk=self.kwargs["resource_id"])
        last_version = resource.versions.first()
        next_version = (last_version.version_number + 1) if last_version else 1
        serializer.save(resource=resource, version_number=next_version, created_by=self.request.user)
