from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

API_PREFIX = "api/v1/"

urlpatterns = [
    # API Schema & Docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),

    # App routes
    path(API_PREFIX + "auth/", include("apps.accounts.urls")),
    path(API_PREFIX + "courses/", include("apps.courses.urls")),
    path(API_PREFIX + "resources/", include("apps.resources.urls")),
    path(API_PREFIX + "quizzes/", include("apps.quizzes.urls")),
    path(API_PREFIX + "assignments/", include("apps.assignments.urls")),
    path(API_PREFIX + "reporting/", include("apps.reporting.urls")),
    path(API_PREFIX + "communication/", include("apps.communication.urls")),

    # Admin
    path("admin/", admin.site.urls),

    # Catch-all pour le frontend React (DOIT ÊTRE EN DERNIER)
    # Exclut api/, admin/, static/, et media/
    re_path(r'^(?!api/|admin/|static/|media/).*$', TemplateView.as_view(template_name='index.html')),
]

# Servir les fichiers statiques et médias en production
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    try:
        import debug_toolbar
        urlpatterns += [path("__debug__/", include(debug_toolbar.urls))]
    except ImportError:
        pass
else:
    # En production, servir aussi les fichiers statiques
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
