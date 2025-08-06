import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budgetly.settings')
django.setup()

from apps.accounts.models import User, Workspace, WorkspaceMember

print("=== Verificando usuários e workspaces ===")

# Verificar se todos os usuários têm workspace
users = User.objects.all()
print(f"Total de usuários: {users.count()}")

for user in users:
    memberships = WorkspaceMember.objects.filter(user=user)
    print(f"Usuário {user.username}: {memberships.count()} workspaces")
    
    if memberships.count() == 0:
        # Criar workspace para usuário sem workspace
        workspace = Workspace.objects.create(
            nome=f"Workspace de {user.username}",
            descricao="Workspace criado automaticamente",
            criado_por=user
        )
        WorkspaceMember.objects.create(
            workspace=workspace,
            user=user,
            role='admin'
        )
        print(f"  -> Criado workspace '{workspace.nome}' para {user.username}")

print("\n=== Usuários e workspaces verificados ===")
