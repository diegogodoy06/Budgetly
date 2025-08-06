from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Beneficiary
from .serializers import BeneficiarySerializer, BeneficiaryCreateSerializer
from apps.accounts.workspace_mixins import WorkspaceRequiredMixin


class BeneficiaryViewSet(WorkspaceRequiredMixin, viewsets.ModelViewSet):
    """ViewSet para gerenciar beneficiários"""
    serializer_class = BeneficiarySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Retorna beneficiários filtrados por workspace"""
        queryset = Beneficiary.objects.all()
        return self.get_workspace_queryset(queryset)
    
    def get_serializer_class(self):
        """Usar serializer específico para criação"""
        if self.action == 'create':
            return BeneficiaryCreateSerializer
        return BeneficiarySerializer
    
    def perform_create(self, serializer):
        """Salva o beneficiário com workspace e user"""
        # Verificar se já existe beneficiário com mesmo nome
        nome = serializer.validated_data['nome']
        existing = Beneficiary.objects.filter(
            nome__iexact=nome,
            workspace=self.request.workspace,
            is_active=True
        ).exists()
        
        if existing:
            raise serializers.ValidationError({
                'nome': 'Já existe um beneficiário com esse nome neste workspace.'
            })
        
        serializer.save(
            workspace=self.request.workspace,
            user=self.request.user
        )

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Buscar beneficiários por nome"""
        query = request.query_params.get('q', '').strip()
        
        if not query:
            return Response([])
        
        beneficiaries = self.get_queryset().filter(
            nome__icontains=query,
            is_active=True
        )[:10]  # Limitar a 10 resultados
        
        serializer = self.get_serializer(beneficiaries, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Criar múltiplos beneficiários de uma vez (para imports)"""
        nomes = request.data.get('nomes', [])
        
        if not isinstance(nomes, list):
            return Response(
                {'error': 'Campo "nomes" deve ser uma lista.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created = []
        errors = []
        
        for nome in nomes:
            if not nome or not nome.strip():
                continue
                
            nome_normalizado = ' '.join(nome.strip().split())
            
            # Verificar se já existe
            existing = Beneficiary.objects.filter(
                nome__iexact=nome_normalizado,
                workspace=request.workspace,
                is_active=True
            ).exists()
            
            if not existing:
                try:
                    beneficiary = Beneficiary.objects.create(
                        nome=nome_normalizado,
                        workspace=request.workspace,
                        user=request.user
                    )
                    created.append(BeneficiarySerializer(beneficiary).data)
                except Exception as e:
                    errors.append({'nome': nome_normalizado, 'error': str(e)})
        
        return Response({
            'created': created,
            'errors': errors,
            'total_created': len(created),
            'total_errors': len(errors)
        })

    def destroy(self, request, *args, **kwargs):
        """Soft delete - marcar como inativo em vez de deletar"""
        beneficiary = self.get_object()
        
        # Verificar se é beneficiário do sistema
        if beneficiary.is_system:
            return Response(
                {'error': 'Não é possível deletar beneficiários do sistema.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        beneficiary.is_active = False
        beneficiary.save()
        
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'], url_path='search-or-create')
    def search_or_create(self, request):
        """
        Busca beneficiário por nome. Se não encontrar, cria automaticamente.
        Para uso no dropdown com auto-criação.
        """
        nome = request.data.get('nome', '').strip()
        
        if not nome:
            return Response(
                {'error': 'Nome é obrigatório'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Normalizar nome
        nome_normalizado = ' '.join(nome.split())
        
        # Tentar encontrar beneficiário existente
        try:
            beneficiary = Beneficiary.objects.get(
                nome__iexact=nome_normalizado,
                workspace=request.workspace,
                is_active=True
            )
            return Response({
                'created': False,
                'beneficiary': BeneficiarySerializer(beneficiary).data
            })
        except Beneficiary.DoesNotExist:
            # Criar novo beneficiário
            try:
                beneficiary = Beneficiary.objects.create(
                    nome=nome_normalizado,
                    workspace=request.workspace,
                    user=request.user,
                    tipo='OUTRO',  # Tipo padrão para criação automática
                    descricao=f'Criado automaticamente via transação'
                )
                return Response({
                    'created': True,
                    'beneficiary': BeneficiarySerializer(beneficiary).data
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {'error': f'Erro ao criar beneficiário: {str(e)}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
