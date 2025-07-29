from django.urls import path
from . import views

app_name = 'reports'

urlpatterns = [
    path('', views.ReportListCreateView.as_view(), name='report-list'),
    path('<int:pk>/', views.ReportDetailView.as_view(), name='report-detail'),
    path('imports/', views.ImportHistoryListView.as_view(), name='import-history'),
]
