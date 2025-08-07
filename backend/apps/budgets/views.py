from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Q, F
from .models import Budget, BudgetAlert
from .serializers import BudgetSerializer, BudgetAlertSerializer, BudgetSummarySerializer
from apps.accounts.mixins import WorkspaceViewMixin


class BudgetListCreateView(WorkspaceViewMixin, generics.ListCreateAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Budget.objects.filter(is_active=True)
        queryset = self.get_workspace_queryset(queryset)
        
        # Filtros opcionais
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        category = self.request.query_params.get('category')
        
        if month:
            queryset = queryset.filter(month=month)
        if year:
            queryset = queryset.filter(year=year)
        if category:
            queryset = queryset.filter(category_id=category)
        
        return queryset


class BudgetDetailView(WorkspaceViewMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        try:
            workspace = self.get_user_workspace()
            return Budget.objects.filter(workspace=workspace)
        except:
            return Budget.objects.none()

    def perform_destroy(self, instance):
        # Soft delete
        instance.is_active = False
        instance.save()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def budget_summary(request):
    """Retorna resumo dos orçamentos"""
    user = request.user
    
    # Filtros opcionais
    month = request.GET.get('month')
    year = request.GET.get('year')
    
    queryset = Budget.objects.filter(user=user, is_active=True)
    
    if month:
        queryset = queryset.filter(month=month)
    if year:
        queryset = queryset.filter(year=year)
    
    # Calcular totais
    totals = queryset.aggregate(
        total_planned=Sum('planned_amount'),
        total_spent=Sum('spent_amount')
    )
    
    total_planned = totals['total_planned'] or 0
    total_spent = totals['total_spent'] or 0
    total_remaining = total_planned - total_spent
    
    over_budget_count = queryset.filter(spent_amount__gt=F('planned_amount')).count()
    
    data = {
        'total_planned': total_planned,
        'total_spent': total_spent,
        'total_remaining': total_remaining,
        'budgets_count': queryset.count(),
        'over_budget_count': over_budget_count
    }
    
    serializer = BudgetSummarySerializer(data)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_budget_spent_amounts(request):
    """Atualiza os valores gastos de todos os orçamentos do usuário"""
    user = request.user
    budgets = Budget.objects.filter(user=user, is_active=True)
    
    updated_count = 0
    for budget in budgets:
        budget.update_spent_amount()
        updated_count += 1
    
    return Response({
        'message': f'{updated_count} orçamentos atualizados com sucesso',
        'updated_count': updated_count
    })


class BudgetAlertListView(generics.ListAPIView):
    serializer_class = BudgetAlertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BudgetAlert.objects.filter(budget__user=self.request.user).order_by('-created_at')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_alert_as_read(request, alert_id):
    """Marca um alerta como lido"""
    try:
        alert = BudgetAlert.objects.get(id=alert_id, budget__user=request.user)
        alert.is_read = True
        alert.save()
        return Response({'message': 'Alerta marcado como lido'})
    except BudgetAlert.DoesNotExist:
        return Response({'error': 'Alerta não encontrado'}, status=404)
