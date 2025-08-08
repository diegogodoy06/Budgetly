"""
Views for automation rules
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction as db_transaction
from apps.accounts.mixins import WorkspaceViewMixin
from .models import AutomationRule, RuleCondition, RuleAction, RuleApplicationLog, AutomationSettings
from .serializers import (
    AutomationRuleSerializer, AutomationRuleCreateSerializer,
    RuleConditionSerializer, RuleActionSerializer, RuleApplicationLogSerializer,
    RuleTestRequestSerializer, RuleTestResultSerializer, AutomationSettingsSerializer
)
from .services import RuleEngineService, AutoLearningService


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

    @action(detail=False, methods=['post'])
    def reorder_rules(self, request):
        """Reorder rules by priority"""
        rule_ids = request.data.get('rule_ids', [])
        if not rule_ids:
            return Response({'error': 'rule_ids é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update priorities based on order
        for index, rule_id in enumerate(rule_ids):
            try:
                rule = self.get_queryset().get(id=rule_id)
                rule.priority = (index + 1) * 10  # 10, 20, 30, etc.
                rule.save(update_fields=['priority'])
            except AutomationRule.DoesNotExist:
                continue
        
        return Response({
            'success': True,
            'message': 'Ordem das regras atualizada com sucesso'
        })

    @action(detail=False, methods=['get'])
    def by_stage(self, request):
        """Get rules grouped by stage"""
        from .models import RuleStage
        
        rules_by_stage = {}
        for stage_choice in RuleStage.choices:
            stage_code = stage_choice[0]
            stage_rules = self.get_queryset().filter(stage=stage_code)
            serializer = AutomationRuleSerializer(stage_rules, many=True)
            rules_by_stage[stage_code] = {
                'display_name': stage_choice[1],
                'rules': serializer.data
            }
        
        return Response(rules_by_stage)

    @action(detail=False, methods=['post'])
    def bulk_toggle(self, request):
        """Bulk toggle active status for multiple rules"""
        rule_ids = request.data.get('rule_ids', [])
        is_active = request.data.get('is_active', True)
        
        if not rule_ids:
            return Response({'error': 'rule_ids é obrigatório'}, status=status.HTTP_400_BAD_REQUEST)
        
        updated_count = self.get_queryset().filter(id__in=rule_ids).update(is_active=is_active)
        
        return Response({
            'success': True,
            'updated_count': updated_count,
            'message': f'{updated_count} regras {"ativadas" if is_active else "desativadas"}'
        })

    @action(detail=False, methods=['post'])
    def suggest_from_manual_change(self, request):
        """Suggest rule creation based on manual transaction changes"""
        transaction_id = request.data.get('transaction_id')
        field_name = request.data.get('field_name')  # 'category' or 'beneficiario'
        old_value_id = request.data.get('old_value_id')
        new_value_id = request.data.get('new_value_id')
        
        if not all([transaction_id, field_name, new_value_id]):
            return Response({
                'error': 'transaction_id, field_name e new_value_id são obrigatórios'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from apps.transactions.models import Transaction
            transaction = Transaction.objects.get(
                id=transaction_id, 
                workspace=self.get_user_workspace()
            )
            
            # Get old and new values
            old_value = None
            new_value = None
            
            if field_name == 'category':
                from apps.categories.models import Category
                if old_value_id:
                    old_value = Category.objects.get(id=old_value_id)
                new_value = Category.objects.get(id=new_value_id)
            elif field_name == 'beneficiario':
                from apps.beneficiaries.models import Beneficiary
                if old_value_id:
                    old_value = Beneficiary.objects.get(id=old_value_id)
                new_value = Beneficiary.objects.get(id=new_value_id)
            
            # Use auto-learning service to suggest rule
            from .services import suggest_rule_from_manual_changes
            suggested_rule = suggest_rule_from_manual_changes(
                transaction, field_name, old_value, new_value, self.request.user
            )
            
            if suggested_rule:
                serializer = AutomationRuleSerializer(suggested_rule)
                return Response({
                    'success': True,
                    'suggested_rule': serializer.data,
                    'message': 'Regra sugerida criada automaticamente'
                })
            else:
                return Response({
                    'success': False,
                    'message': 'Nenhuma regra foi sugerida para esta mudança'
                })
                
        except Exception as e:
            return Response({
                'error': f'Erro ao processar sugestão: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def application_logs(self, request, pk=None):
        """Get application logs for this rule"""
        rule = self.get_object()
        logs = rule.application_logs.all()[:50]  # Last 50 applications
        serializer = RuleApplicationLogSerializer(logs, many=True)
        return Response(serializer.data)


class AutomationSettingsViewSet(WorkspaceViewMixin, viewsets.ModelViewSet):
    """ViewSet for managing automation settings"""
    serializer_class = AutomationSettingsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return settings for the current workspace"""
        return AutomationSettings.objects.filter(workspace=self.get_user_workspace())
    
    def get_object(self):
        """Get or create settings for the current workspace"""
        workspace = self.get_user_workspace()
        settings, created = AutomationSettings.objects.get_or_create(
            workspace=workspace,
            defaults={
                'auto_learning_enabled': True,
                'auto_create_category_rules': True,
                'auto_create_beneficiary_rules': True
            }
        )
        return settings
    
    def list(self, request, *args, **kwargs):
        """Return the settings object for the workspace"""
        settings = self.get_object()
        serializer = self.get_serializer(settings)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """Update existing settings instead of creating new ones"""
        return self.update(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        """Update settings for the workspace"""
        settings = self.get_object()
        serializer = self.get_serializer(settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch', 'put'])
    def update_workspace_settings(self, request):
        """Update settings for the current workspace without requiring ID"""
        settings = self.get_object()
        serializer = self.get_serializer(settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def toggle_learning_for_beneficiary(self, request):
        """Toggle auto-learning for a specific beneficiary"""
        beneficiary_id = request.data.get('beneficiary_id')
        enable = request.data.get('enable', True)
        
        if not beneficiary_id:
            return Response({
                'error': 'beneficiary_id é obrigatório'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from apps.beneficiaries.models import Beneficiary
            beneficiary = Beneficiary.objects.get(
                id=beneficiary_id, 
                workspace=self.get_user_workspace()
            )
            
            settings = self.get_object()
            auto_learning = AutoLearningService(self.get_user_workspace())
            
            if enable:
                auto_learning.enable_learning_for_beneficiary(beneficiary)
                message = f'Aprendizado habilitado para {beneficiary.nome}'
            else:
                auto_learning.disable_learning_for_beneficiary(beneficiary)
                message = f'Aprendizado desabilitado para {beneficiary.nome}'
            
            return Response({
                'success': True,
                'message': message
            })
            
        except Exception as e:
            return Response({
                'error': f'Erro ao alterar configuração: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


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
