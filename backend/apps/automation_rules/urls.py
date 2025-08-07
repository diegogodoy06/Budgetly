"""
URLs for automation rules
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'rules', views.AutomationRuleViewSet, basename='automation-rule')
router.register(r'settings', views.AutomationSettingsViewSet, basename='automation-settings')
router.register(r'conditions', views.RuleConditionViewSet, basename='rule-condition')
router.register(r'actions', views.RuleActionViewSet, basename='rule-action')
router.register(r'logs', views.RuleApplicationLogViewSet, basename='rule-log')

urlpatterns = [
    path('', include(router.urls)),
]