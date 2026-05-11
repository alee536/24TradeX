from django.urls import path
from . import views

urlpatterns = [
    path('admin/users', views.admin_list_users, name='admin-users'),
    path('admin/users/<int:pk>', views.admin_update_user, name='admin-update-user'),
    path('admin/purchases', views.admin_list_purchases, name='admin-purchases'),
    path('admin/purchases/<int:pk>/approve', views.admin_approve_purchase, name='admin-approve-purchase'),
    path('admin/purchases/<int:pk>/reject', views.admin_reject_purchase, name='admin-reject-purchase'),
    path('admin/withdrawals', views.admin_list_withdrawals, name='admin-withdrawals'),
    path('admin/withdrawals/<int:pk>/approve', views.admin_approve_withdrawal, name='admin-approve-withdrawal'),
    path('admin/withdrawals/<int:pk>/reject', views.admin_reject_withdrawal, name='admin-reject-withdrawal'),
    path('admin/settings', views.admin_settings, name='admin-settings'),
    path('admin/sponsor', views.admin_sponsor_list, name='admin-sponsor'),
    path('admin/stats', views.admin_stats, name='admin-stats'),
]
