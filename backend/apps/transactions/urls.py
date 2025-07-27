from django.urls import path
from . import views

urlpatterns = [
    # Transactions
    path('', views.TransactionListCreateView.as_view(), name='transaction-list'),
    path('<int:pk>/', views.TransactionDetailView.as_view(), name='transaction-detail'),
    path('summary/', views.transaction_summary, name='transaction-summary'),
    
    # Credit Card Bills
    path('bills/', views.CreditCardBillListView.as_view(), name='bill-list'),
    path('bills/<int:pk>/', views.CreditCardBillDetailView.as_view(), name='bill-detail'),
    path('bills/<int:bill_id>/pay/', views.pay_bill, name='pay-bill'),
    path('bills/<int:bill_id>/close/', views.close_bill, name='close-bill'),
]
