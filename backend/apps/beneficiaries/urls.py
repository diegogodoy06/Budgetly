from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BeneficiaryViewSet

# Router para ViewSets
router = DefaultRouter()
router.register(r'', BeneficiaryViewSet, basename='beneficiary')

urlpatterns = [
    path('', include(router.urls)),
]
