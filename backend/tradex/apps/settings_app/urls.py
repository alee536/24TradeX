from django.urls import path
from . import views

urlpatterns = [
    path('admin/settings', views.get_settings, name='get-settings'),
]
