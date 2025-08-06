import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budgetly.settings')
django.setup()

from apps.accounts.models import User, Workspace, WorkspaceMember

# Criar workspace para usuarios sem workspace
users = User.objects.filter(workspace_memberships__isnull=True).distinct()
print(f"Usuarios sem workspace: {users.count()}")

for user in users:
    workspace = Workspace.objects.create(
        name=f"Workspace de {user.username}",
        description="Workspace automatico",
        owner=user
    )
    WorkspaceMember.objects.create(
        workspace=workspace,
        user=user,
        role='admin'
    )
    print(f"Criado workspace para {user.username}")

print("Migração concluída!")
