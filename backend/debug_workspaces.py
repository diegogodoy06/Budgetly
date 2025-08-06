#!/usr/bin/env python3
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budgetly.settings')
django.setup()

from apps.accounts.models import Workspace, WorkspaceMember
from django.contrib.auth import get_user_model

User = get_user_model()

def debug_workspaces():
    """Debug dos workspaces existentes"""
    
    print('=== DEBUG WORKSPACES ===\n')
    
    # Verificar usuários
    users = User.objects.all()
    print(f'👥 Total de usuários: {users.count()}')
    
    # Verificar workspaces
    workspaces = Workspace.objects.all()
    print(f'🏢 Total de workspaces: {workspaces.count()}')
    
    if workspaces.count() == 0:
        print('❌ Nenhum workspace encontrado!')
        return
    
    print('\n📋 Lista de workspaces:')
    for workspace in workspaces:
        print(f'  - {workspace.id}: {workspace.nome}')
        print(f'    Criado por: {workspace.criado_por.email}')
        print(f'    Ativo: {workspace.is_active}')
        
        # Verificar membros
        members = WorkspaceMember.objects.filter(workspace=workspace, is_active=True)
        print(f'    Membros: {members.count()}')
        for member in members:
            print(f'      * {member.user.email} ({member.role})')
        print()
    
    # Verificar para cada usuário
    print('👤 Workspaces por usuário:')
    for user in users:
        user_workspaces = Workspace.objects.filter(
            workspacemember__user=user,
            workspacemember__is_active=True,
            is_active=True
        ).distinct()
        print(f'  {user.email}: {user_workspaces.count()} workspaces')
        for ws in user_workspaces:
            print(f'    - {ws.nome}')

if __name__ == '__main__':
    debug_workspaces()
