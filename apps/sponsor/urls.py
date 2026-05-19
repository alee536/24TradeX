from django.urls import path
from . import views

urlpatterns = [
    path('sponsor/stats', views.sponsor_stats, name='sponsor-stats'),
    path('sponsor/users', views.sponsored_users, name='sponsored-users'),
]
