from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category
from .serializers import CategorySerializer
from apps.accounts.mixins import WorkspaceViewMixin


class CategoryViewSet(WorkspaceViewMixin, viewsets.ModelViewSet):
    """ViewSet para gerenciar categorias"""
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Retorna categorias filtradas por workspace"""
        return self.get_workspace_queryset(Category.objects.all())
    
    def perform_create(self, serializer):
        """Salva a categoria com workspace e user"""
        workspace = self.get_user_workspace()
        serializer.save(
            workspace=workspace,
            user=self.request.user
        )

    @action(detail=False, methods=['get'])
    def hierarchy(self, request):
        """
        Retorna categorias organizadas hierarquicamente.
        Categorias principais com suas subcategorias aninhadas.
        """
        # Busca todas as categorias do workspace
        all_categories = self.get_queryset()
        
        # Filtra apenas categorias principais (sem parent)
        main_categories = all_categories.filter(parent__isnull=True).order_by('nome')
        
        # Serializa as categorias principais
        result = []
        for main_category in main_categories:
            # Serializa a categoria principal
            main_data = CategorySerializer(main_category).data
            
            # Busca subcategorias desta categoria principal
            subcategories = all_categories.filter(parent=main_category).order_by('nome')
            
            # Adiciona as subcategorias serializadas
            main_data['children'] = CategorySerializer(subcategories, many=True).data
            
            result.append(main_data)
        
        return Response(result)

    @action(detail=False, methods=['get'], url_path='flat-list')
    def flat_list(self, request):
        """Retorna categorias em lista plana para dropdown"""
        all_categories = self.get_queryset().order_by('parent__nome', 'nome')
        
        result = []
        for category in all_categories:
            has_children = all_categories.filter(parent=category).exists()
            category_data = {
                'id': category.id,
                'nome': category.nome,
                'parent': category.parent_id,
                'isSelectable': not has_children,
                'level': 1 if category.parent else 0,
            }
            result.append(category_data)
        
        return Response(result)
