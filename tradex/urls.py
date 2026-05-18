from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.accounts.views import health_check
from django.views.generic import TemplateView
from django.urls import re_path
from django.views.generic import RedirectView
from django.views.static import serve

urlpatterns = [
    path('django-admin/', RedirectView.as_view(url='/admin/', permanent=False)),
    path('admin', RedirectView.as_view(url='/admin/', permanent=False)),
    # Serve frontend build assets and root public files.
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': settings.FRONTEND_DIST_DIR / 'assets'}),
    re_path(r'^(?P<path>favicon\.svg|opengraph\.jpg|robots\.txt)$', serve, {'document_root': settings.FRONTEND_DIST_DIR}),
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
    # Admin dashboard (Django templates, not SPA)
    path('admin/', include('apps.admin_dashboard.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Serve built frontend (Vite) index.html for SPA routes that are not API or admin
urlpatterns += [
    # User dashboard path explicitly
    path('user/dashboard/', TemplateView.as_view(template_name='index.html')),
    # Catch-all for other frontend routes (exclude api/ and admin/)
    re_path(r'^(?!api/|admin/|admin$).*$', TemplateView.as_view(template_name='index.html')),
]
