import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budgetly.settings')
django.setup()

from apps.accounts.models import User, Workspace, WorkspaceMember, Account, CreditCard
from apps.categories.models import Category, CostCenter, Tag
from apps.transactions.models import Transaction
from apps.budgets.models import Budget

def assign_workspace_to_data():
    print("=== Atribuindo workspaces aos dados existentes ===")
    
    # Para cada usuário, pegar seu primeiro workspace e atribuir aos dados
    for user in User.objects.all():
        membership = WorkspaceMember.objects.filter(user=user).first()
        if not membership:
            print(f"Usuário {user.username} não tem workspace!")
            continue
            
        workspace = membership.workspace
        print(f"\nUsuário: {user.username} -> Workspace: {workspace.nome}")
        
        # Atualizar categorias
        categories_sem_workspace = Category.objects.filter(user=user, workspace__isnull=True)
        count = categories_sem_workspace.count()
        if count > 0:
            categories_sem_workspace.update(workspace=workspace)
            print(f"  - {count} categorias atualizadas")
        
        # Atualizar centros de custo
        cost_centers_sem_workspace = CostCenter.objects.filter(user=user, workspace__isnull=True)
        count = cost_centers_sem_workspace.count()
        if count > 0:
            cost_centers_sem_workspace.update(workspace=workspace)
            print(f"  - {count} centros de custo atualizados")
        
        # Atualizar tags
        tags_sem_workspace = Tag.objects.filter(user=user, workspace__isnull=True)
        count = tags_sem_workspace.count()
        if count > 0:
            tags_sem_workspace.update(workspace=workspace)
            print(f"  - {count} tags atualizadas")
        
        # Atualizar transações
        transactions_sem_workspace = Transaction.objects.filter(user=user, workspace__isnull=True)
        count = transactions_sem_workspace.count()
        if count > 0:
            transactions_sem_workspace.update(workspace=workspace)
            print(f"  - {count} transações atualizadas")
        
        # Atualizar budgets (se o modelo tiver workspace)
        try:
            budgets_sem_workspace = Budget.objects.filter(user=user)
            # Como acabamos de adicionar workspace ao Budget, todos estarão sem workspace
            count = budgets_sem_workspace.count()
            if count > 0:
                budgets_sem_workspace.update(workspace=workspace)
                print(f"  - {count} orçamentos atualizados")
        except Exception as e:
            print(f"  - Erro ao atualizar orçamentos: {e}")

    print("\n=== Dados atualizados com workspaces ===")

if __name__ == "__main__":
    assign_workspace_to_data()
