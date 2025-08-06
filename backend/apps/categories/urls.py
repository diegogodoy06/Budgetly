from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router para ViewSets
router = DefaultRouter()
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'cost-centers', views.CostCenterViewSet, basename='costcenter')

urlpatterns = [
    # ViewSets via router
    path('', include(router.urls)),
]
