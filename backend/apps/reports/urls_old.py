from django.urls import path
from . import views

urlpatterns = [
    # Dashboard
    path('dashboard/', views.dashboard_data, name='dashboard-data'),
    path('charts/account-balance/', views.account_balance_chart, name='account-balance-chart'),
    path('charts/category-expense/', views.category_expense_chart, name='category-expense-chart'),
    path('charts/monthly-trend/', views.monthly_trend, name='monthly-trend'),
    
    # Import
    path('import/upload/', views.upload_file, name='upload-file'),
    path('import/history/', views.ImportHistoryListView.as_view(), name='import-history'),
    
    # Report Templates
    path('templates/', views.ReportTemplateListCreateView.as_view(), name='report-template-list'),
    path('templates/<int:pk>/', views.ReportTemplateDetailView.as_view(), name='report-template-detail'),
]
