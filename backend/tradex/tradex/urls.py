from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.accounts.views import health_check

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/healthz', health_check),
    path('api/', include('apps.accounts.urls')),
    path('api/', include('apps.purchases.urls')),
    path('api/', include('apps.withdrawals.urls')),
    path('api/', include('apps.sponsor.urls')),
    path('api/', include('apps.notifications.urls')),
    path('api/', include('apps.settings_app.urls')),
    path('api/', include('apps.dashboard.urls')),
    path('api/', include('apps.admin_api.urls')),
    path('api/', include('apps.transactions.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
