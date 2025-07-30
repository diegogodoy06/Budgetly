from django.urls import path
from . import views

urlpatterns = [
    # Categories - Lista básica e CRUD
    path('', views.CategoryListCreateView.as_view(), name='category-list'),
    path('<int:pk>/', views.CategoryDetailView.as_view(), name='category-detail'),
    path('stats/', views.CategoryStatsView.as_view(), name='category-stats'),
    
    # Categories - Endpoints hierárquicos
    path('hierarchy/', views.category_hierarchy_view, name='category-hierarchy'),
    path('flat-list/', views.category_flat_list_view, name='category-flat-list'),
    
    # Tags
    path('tags/', views.TagListCreateView.as_view(), name='tag-list'),
    path('tags/<int:pk>/', views.TagDetailView.as_view(), name='tag-detail'),
]
