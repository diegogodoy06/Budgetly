from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router para ViewSets
router = DefaultRouter()
router.register(r'transactions', views.TransactionViewSet, basename='transaction')
router.register(r'invoices', views.CreditCardInvoiceViewSet, basename='invoice')

urlpatterns = [
    # ViewSets via router
    path('', include(router.urls)),
    
    # Invoice utilities
    path('validate-date/', views.validate_transaction_date, name='validate-transaction-date'),
    path('best-purchase-date/', views.get_best_purchase_date, name='best-purchase-date'),
]
