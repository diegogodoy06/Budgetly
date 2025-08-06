#!/usr/bin/env python
import os
import sys
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budgetly.settings')
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import get_user_model
from apps.accounts.models import Workspace, WorkspaceMember

User = get_user_model()

def setup_admin_workspace():
    """Configura workspace para o usuário admin"""
    print("=== Configurando Workspace para Admin ===")
    
    try:
        # Buscar usuário admin
        admin_user = User.objects.get(email="admin@budgetly.com")
        print(f"✅ Usuário admin encontrado: {admin_user.email}")
        
        # Verificar se já tem workspaces
        workspaces = WorkspaceMember.objects.filter(user=admin_user)
        
        if workspaces.exists():
            print(f"✅ Admin já tem {workspaces.count()} workspace(s):")
            for membership in workspaces:
                print(f"  - {membership.workspace.nome} (ID: {membership.workspace.id})")
                
                # Definir como workspace padrão se não tiver
                if not admin_user.current_workspace_id:
                    admin_user.current_workspace_id = membership.workspace.id
                    admin_user.save()
                    print(f"✅ Workspace padrão definido: {membership.workspace.id}")
        else:
            print("⚠️ Admin não tem workspaces. Criando workspace padrão...")
            
            # Criar workspace padrão
            workspace = Workspace.objects.create(
                nome="Workspace Pessoal",
                descricao="Workspace padrão do administrador",
                criado_por=admin_user
            )
            
            # Adicionar admin como membro
            membership = WorkspaceMember.objects.create(
                user=admin_user,
                workspace=workspace,
                role=WorkspaceMember.ROLE_ADMIN,
                is_active=True
            )
            
            # Definir como workspace padrão
            admin_user.current_workspace_id = workspace.id
            admin_user.save()
            
            print(f"✅ Workspace criado: {workspace.nome} (ID: {workspace.id})")
            print(f"✅ Admin adicionado como membro com role {membership.role}")
            print(f"✅ Workspace padrão definido: {workspace.id}")
        
        # Verificar estado final
        admin_user.refresh_from_db()
        print(f"\n=== Estado Final ===")
        print(f"Usuário: {admin_user.email}")
        print(f"Workspace padrão: {admin_user.current_workspace_id}")
        
        # Listar todos os workspaces do admin
        workspaces = WorkspaceMember.objects.filter(user=admin_user).select_related('workspace')
        print(f"Workspaces disponíveis:")
        for membership in workspaces:
            is_default = membership.workspace.id == admin_user.current_workspace_id
            default_marker = " (PADRÃO)" if is_default else ""
            print(f"  - {membership.workspace.nome} (ID: {membership.workspace.id}){default_marker}")
            
    except User.DoesNotExist:
        print("❌ Usuário admin@budgetly.com não encontrado")
    except Exception as e:
        print(f"❌ Erro: {str(e)}")

if __name__ == "__main__":
    setup_admin_workspace()
