from django.urls import path
from . import views

app_name = 'transactions'

urlpatterns = [
    # Transações
    path('', views.TransactionListCreateView.as_view(), name='transaction-list'),
    path('<int:pk>/', views.TransactionDetailView.as_view(), name='transaction-detail'),
    
    # Faturas de cartão de crédito
    path('invoices/', views.CreditCardInvoiceListView.as_view(), name='invoice-list'),
    path('invoices/<int:pk>/', views.CreditCardInvoiceDetailView.as_view(), name='invoice-detail'),
    path('invoices/<int:invoice_id>/pay/', views.pay_invoice, name='pay-invoice'),
    path('invoices/<int:invoice_id>/close/', views.close_invoice, name='close-invoice'),
    
    # Relatórios e resumos
    path('summary/', views.transaction_summary, name='transaction-summary'),
    path('by-category/', views.transactions_by_category, name='transactions-by-category'),
]
