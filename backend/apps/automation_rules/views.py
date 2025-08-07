"""
Views for automation rules
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction as db_transaction
from apps.accounts.mixins import WorkspaceViewMixin
from .models import AutomationRule, RuleCondition, RuleAction, RuleApplicationLog
from .serializers import (
    AutomationRuleSerializer, AutomationRuleCreateSerializer,
    RuleConditionSerializer, RuleActionSerializer, RuleApplicationLogSerializer,
    RuleTestRequestSerializer, RuleTestResultSerializer
)
from .services import RuleEngineService


class AutomationRuleViewSet(WorkspaceViewMixin, viewsets.ModelViewSet):
    """ViewSet for managing automation rules"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AutomationRuleCreateSerializer
        return AutomationRuleSerializer
    
    def get_queryset(self):
        """Return rules filtered by workspace"""
        queryset = AutomationRule.objects.prefetch_related('conditions', 'actions')
        return self.get_workspace_queryset(queryset)
    
    def perform_create(self, serializer):
        """Save rule with workspace and user"""
        workspace = self.get_user_workspace()
        serializer.save(workspace=workspace, user=self.request.user)

    @action(detail=True, methods=['post'])
    def test_rule(self, request, pk=None):
        """Test a single rule against transactions"""
        rule = self.get_object()
        serializer = RuleTestRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        service = RuleEngineService(self.get_user_workspace())
        results = service.test_rules(
            rule_ids=[rule.id],
            transaction_ids=serializer.validated_data.get('transaction_ids'),
            apply_rules=serializer.validated_data.get('apply_rules', False)
        )
        
        return Response(results)

    @action(detail=False, methods=['post'])
    def test_all_rules(self, request):
        """Test all active rules against transactions"""
        serializer = RuleTestRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        service = RuleEngineService(self.get_user_workspace())
        results = service.test_rules(
            rule_ids=serializer.validated_data.get('rule_ids'),
            transaction_ids=serializer.validated_data.get('transaction_ids'),
            apply_rules=serializer.validated_data.get('apply_rules', False)
        )
        
        return Response(results)

    @action(detail=False, methods=['post'])
    def apply_to_transactions(self, request):
        """Apply all active rules to specified transactions"""
        serializer = RuleTestRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        service = RuleEngineService(self.get_user_workspace())
        results = service.apply_rules_to_transactions(
            transaction_ids=serializer.validated_data.get('transaction_ids'),
            rule_ids=serializer.validated_data.get('rule_ids')
        )
        
        return Response({
            'success': True,
            'transactions_processed': len(results),
            'results': results
        })

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle rule active status"""
        rule = self.get_object()
        rule.is_active = not rule.is_active
        rule.save(update_fields=['is_active'])
        
        return Response({
            'success': True,
            'is_active': rule.is_active,
            'message': f"Regra {'ativada' if rule.is_active else 'desativada'} com sucesso"
        })

    @action(detail=True, methods=['get'])
    def application_logs(self, request, pk=None):
        """Get application logs for this rule"""
        rule = self.get_object()
        logs = rule.application_logs.all()[:50]  # Last 50 applications
        serializer = RuleApplicationLogSerializer(logs, many=True)
        return Response(serializer.data)


class RuleConditionViewSet(WorkspaceViewMixin, viewsets.ModelViewSet):
    """ViewSet for managing rule conditions"""
    serializer_class = RuleConditionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return conditions for rules in the current workspace"""
        return RuleCondition.objects.filter(rule__workspace=self.get_user_workspace())


class RuleActionViewSet(WorkspaceViewMixin, viewsets.ModelViewSet):
    """ViewSet for managing rule actions"""
    serializer_class = RuleActionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return actions for rules in the current workspace"""
        return RuleAction.objects.filter(rule__workspace=self.get_user_workspace())


class RuleApplicationLogViewSet(WorkspaceViewMixin, viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing rule application logs"""
    serializer_class = RuleApplicationLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return logs for rules in the current workspace"""
        return RuleApplicationLog.objects.filter(
            rule__workspace=self.get_user_workspace()
        ).select_related('rule', 'transaction')
