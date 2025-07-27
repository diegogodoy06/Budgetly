from django.urls import path
from . import views

urlpatterns = [
    # Budgets
    path('', views.BudgetListCreateView.as_view(), name='budget-list'),
    path('<int:pk>/', views.BudgetDetailView.as_view(), name='budget-detail'),
    path('summary/', views.budget_summary, name='budget-summary'),
    path('update-spent/', views.update_budget_spent_amounts, name='update-budget-spent'),
    
    # Budget Alerts
    path('alerts/', views.BudgetAlertListView.as_view(), name='budget-alerts'),
    path('alerts/<int:alert_id>/read/', views.mark_alert_as_read, name='mark-alert-read'),
]
