from django.urls import path
from . import views

urlpatterns = [
    path('purchases', views.purchases_list, name='purchases-list'),
    path('purchases/<int:pk>', views.purchase_detail, name='purchase-detail'),
]
