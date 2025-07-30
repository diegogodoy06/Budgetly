#!/usr/bin/env python
"""
Script para popular categorias hierárquicas de exemplo no Budgetly
Execute: python setup_hierarchical_categories.py
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budgetly.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.categories.models import Category

User = get_user_model()  # Obtém o modelo de usuário correto

def create_hierarchical_categories(user):
    """Cria categorias hierárquicas de exemplo"""
    
    categories_data = {
        '🍽️ Alimentação': {
            'cor': '#ef4444',  # red-500
            'icone': '🍽️',
            'subcategorias': [
                {'nome': '🥖 Padaria', 'cor': '#f97316'},  # orange-500
                {'nome': '☕ Cafeteria', 'cor': '#8b5cf6'},  # violet-500
                {'nome': '🚚 Delivery', 'cor': '#10b981'},  # emerald-500
                {'nome': '🍽️ Restaurante', 'cor': '#f59e0b'},  # amber-500
                {'nome': '🛒 Supermercado', 'cor': '#06b6d4'},  # cyan-500
            ]
        },
        
        '💻 Assinaturas': {
            'cor': '#8b5cf6',  # violet-500
            'icone': '💻',
            'subcategorias': [
                {'nome': '🎮 Jogos', 'cor': '#10b981'},  # emerald-500
                {'nome': '📺 Streaming', 'cor': '#f59e0b'},  # amber-500
                {'nome': '📱 Aplicativos', 'cor': '#06b6d4'},  # cyan-500
                {'nome': '☁️ Cloud/Software', 'cor': '#8b5cf6'},  # violet-500
            ]
        },
        
        '🚗 Transporte': {
            'cor': '#06b6d4',  # cyan-500
            'icone': '🚗',
            'subcategorias': [
                {'nome': '⛽ Combustível', 'cor': '#ef4444'},  # red-500
                {'nome': '🚌 Transporte Público', 'cor': '#10b981'},  # emerald-500
                {'nome': '🚗 Uber/Taxi', 'cor': '#f59e0b'},  # amber-500
                {'nome': '🛠️ Manutenção', 'cor': '#8b5cf6'},  # violet-500
            ]
        },
        
        '📱 Telefonia': {
            'cor': '#10b981',  # emerald-500
            'icone': '📱',
            'subcategorias': [
                {'nome': '📞 Celular', 'cor': '#10b981'},  # emerald-500
                {'nome': '🌐 Internet', 'cor': '#06b6d4'},  # cyan-500
                {'nome': '📺 TV a Cabo', 'cor': '#8b5cf6'},  # violet-500
            ]
        },
        
        '🏠 Casa': {
            'cor': '#f59e0b',  # amber-500
            'icone': '🏠',
            'subcategorias': [
                {'nome': '⚡ Energia Elétrica', 'cor': '#f59e0b'},  # amber-500
                {'nome': '💧 Água', 'cor': '#06b6d4'},  # cyan-500
                {'nome': '🔥 Gás', 'cor': '#ef4444'},  # red-500
                {'nome': '🛠️ Manutenção', 'cor': '#8b5cf6'},  # violet-500
                {'nome': '🧹 Limpeza', 'cor': '#10b981'},  # emerald-500
            ]
        },
        
        '💰 Investimentos': {
            'cor': '#22c55e',  # green-500
            'icone': '💰',
            'subcategorias': [
                {'nome': '📈 Ações', 'cor': '#22c55e'},  # green-500
                {'nome': '🏦 Renda Fixa', 'cor': '#06b6d4'},  # cyan-500
                {'nome': '🪙 Criptomoedas', 'cor': '#f59e0b'},  # amber-500
                {'nome': '🏡 Imóveis', 'cor': '#8b5cf6'},  # violet-500
            ]
        },
        
        '🎓 Educação': {
            'cor': '#3b82f6',  # blue-500
            'icone': '🎓',
            'subcategorias': [
                {'nome': '📚 Cursos', 'cor': '#3b82f6'},  # blue-500
                {'nome': '📖 Livros', 'cor': '#8b5cf6'},  # violet-500
                {'nome': '🎯 Certificações', 'cor': '#10b981'},  # emerald-500
            ]
        },
        
        '🏥 Saúde': {
            'cor': '#ef4444',  # red-500
            'icone': '🏥',
            'subcategorias': [
                {'nome': '💊 Medicamentos', 'cor': '#ef4444'},  # red-500
                {'nome': '👨‍⚕️ Consultas', 'cor': '#06b6d4'},  # cyan-500
                {'nome': '🦷 Dentista', 'cor': '#f59e0b'},  # amber-500
                {'nome': '👓 Ótica', 'cor': '#8b5cf6'},  # violet-500
            ]
        }
    }
    
    print(f"Criando categorias hierárquicas para o usuário: {user.username}")
    
    created_count = 0
    
    for categoria_nome, categoria_data in categories_data.items():
        # Verifica se a categoria principal já existe
        categoria_principal, created = Category.objects.get_or_create(
            user=user,
            nome=categoria_nome,
            defaults={
                'descricao': f'Categoria principal: {categoria_nome}',
                'cor': categoria_data['cor'],
                'icone': categoria_data['icone'],
                'nivel_importancia': 'necessario',
                'considerar_dashboard': True,
                'is_active': True,
                'parent': None
            }
        )
        
        if created:
            print(f"✅ Criada categoria principal: {categoria_nome}")
            created_count += 1
        else:
            print(f"⚠️  Categoria principal já existe: {categoria_nome}")
        
        # Cria as subcategorias
        for sub_data in categoria_data['subcategorias']:
            subcategoria, sub_created = Category.objects.get_or_create(
                user=user,
                nome=sub_data['nome'],
                parent=categoria_principal,
                defaults={
                    'descricao': f'Subcategoria de {categoria_nome}',
                    'cor': sub_data['cor'],
                    'icone': sub_data['nome'][:2],  # Primeiros 2 caracteres como ícone
                    'nivel_importancia': 'necessario',
                    'considerar_dashboard': True,
                    'is_active': True,
                }
            )
            
            if sub_created:
                print(f"  ✅ Criada subcategoria: {sub_data['nome']}")
                created_count += 1
            else:
                print(f"  ⚠️  Subcategoria já existe: {sub_data['nome']}")
    
    print(f"\n🎉 Processo concluído! {created_count} categorias criadas.")
    return created_count


def main():
    """Função principal"""
    print("=== Setup de Categorias Hierárquicas - Budgetly ===\n")
    
    # Lista usuários disponíveis
    users = User.objects.all()
    if not users.exists():
        print("❌ Nenhum usuário encontrado! Crie um usuário primeiro.")
        print("Execute: python manage.py createsuperuser")
        return
    
    print("Usuários disponíveis:")
    for i, user in enumerate(users, 1):
        print(f"{i}. {user.username} ({user.email})")
    
    # Pergunta qual usuário usar
    try:
        choice = input(f"\nEscolha um usuário (1-{len(users)}) ou Enter para usar o primeiro: ").strip()
        if not choice:
            selected_user = users.first()
        else:
            selected_user = users[int(choice) - 1]
    except (ValueError, IndexError):
        print("❌ Opção inválida! Usando o primeiro usuário.")
        selected_user = users.first()
    
    # Confirma ação
    confirm = input(f"\nConfirma a criação de categorias para '{selected_user.username}'? (s/N): ").strip().lower()
    if confirm not in ['s', 'sim', 'y', 'yes']:
        print("❌ Operação cancelada.")
        return
    
    # Executa criação
    try:
        created_count = create_hierarchical_categories(selected_user)
        print(f"\n✅ Setup concluído com sucesso! {created_count} categorias foram criadas.")
    except Exception as e:
        print(f"❌ Erro durante o setup: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == '__main__':
    main()
