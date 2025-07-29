from django.urls import path
from . import views

urlpatterns = [
    # Categories
    path('', views.CategoryListCreateView.as_view(), name='category-list'),
    path('<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
    path('stats/', views.CategoryStatsView.as_view(), name='category-stats'),
    
    # Tags
    path('tags/', views.TagListCreateView.as_view(), name='tag-list'),
    path('tags/<int:pk>/', views.TagDetailView.as_view(), name='tag-detail'),
]
