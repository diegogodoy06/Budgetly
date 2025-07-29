from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    
    # Accounts
    path('', views.AccountListCreateView.as_view(), name='account-list'),
    path('<int:pk>/', views.AccountDetailView.as_view(), name='account-detail'),
    path('balances/', views.AccountBalanceView.as_view(), name='account-balances'),
    
    # Credit Cards
    path('credit-cards/', views.CreditCardListCreateView.as_view(), name='creditcard-list'),
    path('credit-cards/<int:pk>/', views.CreditCardDetailView.as_view(), name='creditcard-detail'),
    path('credit-cards/balances/', views.CreditCardBalanceView.as_view(), name='creditcard-balances'),
]
