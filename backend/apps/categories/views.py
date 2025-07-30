from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from .models import Category, Tag
from .serializers import CategorySerializer, TagSerializer, CategoryWithTransactionCountSerializer, CategoryHierarchySerializer


class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Category.objects.filter(user=self.request.user, is_active=True)
        
        # Filtro por nível (categorias principais ou subcategorias)
        level = self.request.query_params.get('level', None)
        if level == 'main':
            queryset = queryset.filter(parent__isnull=True)
        elif level == 'sub':
            queryset = queryset.filter(parent__isnull=False)
        
        # Filtro por categoria pai
        parent_id = self.request.query_params.get('parent', None)
        if parent_id:
            queryset = queryset.filter(parent_id=parent_id)
            
        return queryset.select_related('parent').order_by('nome')


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user).select_related('parent')

    def perform_destroy(self, instance):
        # Verifica se tem subcategorias
        if instance.get_children().exists():
            # Move subcategorias para sem pai (torna em categorias principais)
            instance.get_children().update(parent=None)
        
        # Soft delete
        instance.is_active = False
        instance.save()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def category_hierarchy_view(request):
    """Endpoint para retornar categorias em estrutura hierárquica"""
    # Busca apenas categorias principais (sem pai)
    main_categories = Category.objects.filter(
        user=request.user, 
        is_active=True, 
        parent__isnull=True
    ).order_by('nome')
    
    serializer = CategoryHierarchySerializer(main_categories, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def category_flat_list_view(request):
    """Endpoint para retornar todas as categorias em lista plana para dropdowns"""
    categories = Category.objects.filter(
        user=request.user, 
        is_active=True
    ).select_related('parent').order_by('parent__nome', 'nome')
    
    # Organiza as categorias com indentação visual
    organized_data = []
    for category in categories:
        if category.parent:
            # Subcategoria com indentação
            organized_data.append({
                'id': category.id,
                'nome': f"  └─ {category.nome}",
                'nome_completo': f"{category.parent.nome} > {category.nome}",
                'parent_id': category.parent.id,
                'is_subcategory': True,
                'cor': category.cor,
            })
        else:
            # Categoria principal
            organized_data.append({
                'id': category.id,
                'nome': category.nome,
                'nome_completo': category.nome,
                'parent_id': None,
                'is_subcategory': False,
                'cor': category.cor,
            })
    
    return Response(organized_data)


class CategoryStatsView(generics.ListAPIView):
    serializer_class = CategoryWithTransactionCountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user, is_active=True)


class TagListCreateView(generics.ListCreateAPIView):
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user)


class TagDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user)
