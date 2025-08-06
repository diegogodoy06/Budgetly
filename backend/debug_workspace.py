#!/usr/bin/env python3
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budgetly.settings')
django.setup()

from apps.accounts.workspace_serializers import WorkspaceSerializer
from apps.accounts.models import Workspace, WorkspaceMember, WorkspaceMemberRole
from django.contrib.auth import get_user_model

User = get_user_model()

def debug_workspace_creation():
    """Debug da criação de workspace"""
    
    print('=== Debug Workspace Creation ===')
    
    # Verificar se há usuários
    users = User.objects.all()
    print(f'👥 Usuários no sistema: {users.count()}')
    
    if users.count() == 0:
        print('❌ Nenhum usuário encontrado!')
        return
    
    user = users.first()
    print(f'👤 Testando com usuário: {user.email}')
    
    # Simular dados do serializer
    data = {
        'nome': 'Workspace Teste',
        'descricao': 'Teste de criação'
    }
    
    # Simular contexto de request
    class MockRequest:
        def __init__(self, user):
            self.user = user
    
    context = {'request': MockRequest(user)}
    
    try:
        # Testar serializer
        serializer = WorkspaceSerializer(data=data, context=context)
        
        if serializer.is_valid():
            print('✅ Dados válidos no serializer')
            
            # Tentar criar
            workspace = serializer.save()
            print(f'✅ Workspace criado: {workspace.id} - {workspace.nome}')
            
            # Verificar se membro foi criado
            members = WorkspaceMember.objects.filter(workspace=workspace)
            print(f'👥 Membros criados: {members.count()}')
            
            for member in members:
                print(f'   - {member.user.email} ({member.role})')
            
        else:
            print(f'❌ Dados inválidos: {serializer.errors}')
            
    except Exception as e:
        print(f'❌ Erro ao criar workspace: {e}')
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    debug_workspace_creation()
