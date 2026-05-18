from django.urls import path
from . import views

urlpatterns = [
    path('withdrawals', views.withdrawals_list, name='withdrawals-list'),
    path('withdrawals/unlocked', views.unlocked_amount, name='unlocked-amount'),
]
