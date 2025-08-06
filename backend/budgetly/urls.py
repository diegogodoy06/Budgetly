"""
URL configuration for budgetly project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView


def home_view(request):
    """View para a página inicial - redireciona para API docs ou retorna informações da API"""
    if request.META.get('HTTP_ACCEPT', '').startswith('application/json'):
        return JsonResponse({
            'message': 'Budgetly API',
            'version': '1.0',
            'docs': request.build_absolute_uri('/api/docs/'),
            'admin': request.build_absolute_uri('/admin/'),
            'endpoints': {
                'auth': request.build_absolute_uri('/api/auth/'),
                'accounts': request.build_absolute_uri('/api/accounts/'),
                'transactions': request.build_absolute_uri('/api/transactions/'),
                'categories': request.build_absolute_uri('/api/categories/'),
                'beneficiaries': request.build_absolute_uri('/api/beneficiaries/'),
                'budgets': request.build_absolute_uri('/api/budgets/'),
                'reports': request.build_absolute_uri('/api/reports/'),
            }
        })
    return redirect('/api/docs/')

urlpatterns = [
    # Página inicial
    path('', home_view, name='home'),
    
    path('admin/', admin.site.urls),
    
    # API URLs
    path('api/auth/', include('apps.accounts.urls')),
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/transactions/', include('apps.transactions.urls')),
    path('api/categories/', include('apps.categories.urls')),
    path('api/beneficiaries/', include('apps.beneficiaries.urls')),
    path('api/budgets/', include('apps.budgets.urls')),
    path('api/reports/', include('apps.reports.urls')),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
