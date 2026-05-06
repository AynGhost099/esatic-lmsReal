from django.contrib import admin
from .models import Resource, ResourceVersion

admin.site.register(Resource)
admin.site.register(ResourceVersion)
