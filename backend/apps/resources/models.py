from django.db import models
from django.conf import settings
from apps.courses.models import Section


class Resource(models.Model):
    class Type(models.TextChoices):
        FILE = "file", "Fichier"
        VIDEO = "video", "Vidéo"
        LINK = "link", "Lien externe"
        TEXT = "text", "Contenu texte"

    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name="resources")
    title = models.CharField(max_length=255)
    resource_type = models.CharField(max_length=20, choices=Type.choices)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to="resources/%Y/%m/", null=True, blank=True)
    url = models.URLField(blank=True)
    content = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order"]
        verbose_name = "Ressource"

    def __str__(self):
        return self.title

    @property
    def file_size(self):
        if self.file:
            try:
                return self.file.size
            except FileNotFoundError:
                return None
        return None


class ResourceVersion(models.Model):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name="versions")
    version_number = models.PositiveIntegerField()
    file = models.FileField(upload_to="resource_versions/")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    change_notes = models.TextField(blank=True)

    class Meta:
        unique_together = ["resource", "version_number"]
        ordering = ["-version_number"]
