from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views
from .workspace_views import WorkspaceViewSet

# Router para ViewSets
router = DefaultRouter()
router.register(r'accounts', views.AccountViewSet, basename='account')
router.register(r'credit-cards', views.CreditCardViewSet, basename='creditcard')
router.register(r'workspaces', WorkspaceViewSet, basename='workspace')

urlpatterns = [
    # Authentication
    path('register/', views.RegisterView.as_view(), name='register'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change_password'),
    path('login/', views.CustomJWTLoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # ViewSets via router
    path('', include(router.urls)),
]
