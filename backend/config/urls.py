from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

API_PREFIX = "api/v1/"

urlpatterns = [
    path("", RedirectView.as_view(url="/api/docs/"), name="root"),
    path("admin/", admin.site.urls),

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
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    try:
        import debug_toolbar
        urlpatterns += [path("__debug__/", include(debug_toolbar.urls))]
    except ImportError:
        pass
