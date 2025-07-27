from django.urls import path
from . import views

urlpatterns = [
    # Categories
    path('categories/', views.CategoryListCreateView.as_view(), name='category-list'),
    path('categories/<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
    path('categories/stats/', views.CategoryStatsView.as_view(), name='category-stats'),
    
    # Tags
    path('tags/', views.TagListCreateView.as_view(), name='tag-list'),
    path('tags/<int:pk>/', views.TagDetailView.as_view(), name='tag-detail'),
]
