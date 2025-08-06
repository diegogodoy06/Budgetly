import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { categoriesAPI, costCentersAPI } from '@/services/api';
import type { Category } from '@/types';
import toast from 'react-hot-toast';
import { debugAPIState } from '@/utils/debugAPI';

export interface Categoria {
  id: number;
  nome: string;
  ativa: boolean;
  considerarDashboard: boolean;
  importancia: 'essencial' | 'necessario' | 'superfluo';
  // Campos hierárquicos
  parent?: number;
  parent_name?: string;
  children?: Categoria[];
  is_parent?: boolean;
  cor?: string;
  icone?: string;
}

export interface CentroCusto {
  id: number;
  nome: string;
  ativo: boolean;
}

interface ConfiguracoesContextType {
  // Estado
  loading: boolean;
  
  // Categorias
  categorias: Categoria[];
  categoriasAtivas: Categoria[];
  adicionarCategoria: (categoria: Omit<Categoria, 'id'>) => void;
  editarCategoria: (id: number, categoria: Partial<Categoria>) => void;
  excluirCategoria: (id: number) => void;
  toggleCategoriaAtiva: (id: number) => void;
  
  // Centros de Custo
  centrosCusto: CentroCusto[];
  centrosCustoAtivos: CentroCusto[];
  adicionarCentroCusto: (centroCusto: Omit<CentroCusto, 'id'>) => void;
  editarCentroCusto: (id: number, centroCusto: Partial<CentroCusto>) => void;
  excluirCentroCusto: (id: number) => void;
  toggleCentroCustoAtivo: (id: number) => void;
}

const ConfiguracoesContext = createContext<ConfiguracoesContextType | undefined>(undefined);

interface ConfiguracoesProviderProps {
  children: ReactNode;
}

export const ConfiguracoesProvider: React.FC<ConfiguracoesProviderProps> = ({ children }) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega dados da API quando o provider é montado
  useEffect(() => {
    carregarDados();
  }, []);

  // Escutar mudanças de workspace
  useEffect(() => {
    const handleWorkspaceChange = (event: CustomEvent) => {
      console.log('🔄 ConfiguracoesContext detectou mudança de workspace:', event.detail);
      const { previousWorkspace, newWorkspace } = event.detail;
      
      if (previousWorkspace?.id !== newWorkspace?.id) {
        console.log('✨ Recarregando dados de configurações para novo workspace');
        carregarDados();
      }
    };

    window.addEventListener('workspaceChanged', handleWorkspaceChange as EventListener);
    
    return () => {
      window.removeEventListener('workspaceChanged', handleWorkspaceChange as EventListener);
    };
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Debug do estado da API
      const debugInfo = debugAPIState();
      console.log('🔄 ConfiguracoesContext - Iniciando carregamento de dados...', debugInfo);
      
      // Carrega categorias da API
      try {
        const categoriasAPI = await categoriesAPI.getAll();
        console.log('✅ ConfiguracoesContext - Resposta da API de categorias:', categoriasAPI);
        
        // Verifica se é um array
        if (!Array.isArray(categoriasAPI)) {
          console.error('❌ API de categorias não retornou um array:', typeof categoriasAPI, categoriasAPI);
          toast.error('Erro: API de categorias retornou dados inválidos');
          
          // Usar dados mock como fallback
          console.log('🔄 Usando dados mock para categorias...');
          setCategorias([
            { id: 1, nome: 'Alimentação', ativa: true, considerarDashboard: true, importancia: 'essencial' },
            { id: 2, nome: 'Transporte', ativa: true, considerarDashboard: true, importancia: 'necessario' },
            { id: 3, nome: 'Lazer', ativa: true, considerarDashboard: true, importancia: 'superfluo' },
          ]);
          return;
        }
        
        const categoriasConvertidas = categoriasAPI.map(convertCategoryToCategoria);
        console.log('✅ ConfiguracoesContext - Categorias convertidas:', categoriasConvertidas);
        setCategorias(categoriasConvertidas);
      } catch (error) {
        console.error('❌ Erro ao carregar categorias da API:', error);
        toast.error('Erro ao carregar categorias da API, usando dados mock');
        
        // Usar dados mock como fallback
        console.log('🔄 Usando dados mock para categorias...');
        setCategorias([
          { id: 1, nome: 'Alimentação', ativa: true, considerarDashboard: true, importancia: 'essencial' },
          { id: 2, nome: 'Transporte', ativa: true, considerarDashboard: true, importancia: 'necessario' },
          { id: 3, nome: 'Lazer', ativa: true, considerarDashboard: true, importancia: 'superfluo' },
        ]);
      }
      
      // Carrega centros de custo da API
      try {
        const centrosCustoAPI = await costCentersAPI.getAll();
        console.log('Resposta da API de centros de custo:', centrosCustoAPI);
        
        if (Array.isArray(centrosCustoAPI)) {
          const centrosCustoConvertidos = centrosCustoAPI.map(convertCostCenterToCentroCusto);
          setCentrosCusto(centrosCustoConvertidos);
        } else {
          console.warn('API de centros de custo não retornou um array, usando dados mock');
          setCentrosCusto([
            { id: 1, nome: 'Pessoal', ativo: true },
            { id: 2, nome: 'Casa', ativo: true },
            { id: 3, nome: 'Trabalho', ativo: true },
          ]);
        }
      } catch (error) {
        console.warn('Erro ao carregar centros de custo, usando dados mock:', error);
        setCentrosCusto([
          { id: 1, nome: 'Pessoal', ativo: true },
          { id: 2, nome: 'Casa', ativo: true },
          { id: 3, nome: 'Trabalho', ativo: true },
        ]);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  // Converte Category (API) para Categoria (contexto)
  const convertCategoryToCategoria = (category: Category): Categoria => ({
    id: category.id,
    nome: category.nome,
    ativa: category.is_active,
    considerarDashboard: category.considerar_dashboard,
    importancia: category.nivel_importancia,
    parent: category.parent,
    parent_name: category.parent_name,
    is_parent: category.is_parent,
    cor: category.cor,
    icone: category.icone
  });

  // Converte CostCenter (API) para CentroCusto (contexto)
  const convertCostCenterToCentroCusto = (costCenter: any): CentroCusto => ({
    id: costCenter.id,
    nome: costCenter.nome,
    ativo: costCenter.is_active || true
  });

  // Converte Categoria (contexto) para Category (API)
  const convertCategoriaToCategory = (categoria: Partial<Categoria>): Partial<Category> => ({
    nome: categoria.nome,
    is_active: categoria.ativa,
    considerar_dashboard: categoria.considerarDashboard,
    nivel_importancia: categoria.importancia,
    parent: categoria.parent,
    cor: categoria.cor || '#3b82f6',
    icone: categoria.icone || '📁',
    descricao: categoria.nome || ''
  });

  // Funções para Categorias
  const adicionarCategoria = async (novaCategoria: Omit<Categoria, 'id'>) => {
    try {
      const categoryData = convertCategoriaToCategory(novaCategoria);
      const createdCategory = await categoriesAPI.create(categoryData);
      const categoria = convertCategoryToCategoria(createdCategory);
      setCategorias(prev => [...prev, categoria]);
      toast.success('Categoria adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      toast.error('Erro ao adicionar categoria');
    }
  };

  const editarCategoria = async (id: number, dadosCategoria: Partial<Categoria>) => {
    try {
      const categoryData = convertCategoriaToCategory(dadosCategoria);
      const updatedCategory = await categoriesAPI.update(id, categoryData);
      const categoria = convertCategoryToCategoria(updatedCategory);
      
      setCategorias(prev => prev.map(cat => 
        cat.id === id ? { ...cat, ...categoria } : cat
      ));
      toast.success('Categoria atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao editar categoria:', error);
      toast.error('Erro ao editar categoria');
    }
  };

  const excluirCategoria = async (id: number) => {
    try {
      await categoriesAPI.delete(id);
      setCategorias(prev => prev.filter(cat => cat.id !== id));
      toast.success('Categoria excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  const toggleCategoriaAtiva = async (id: number) => {
    const categoria = categorias.find(cat => cat.id === id);
    if (!categoria) return;
    
    try {
      const dadosAtualizados = { is_active: !categoria.ativa };
      await categoriesAPI.update(id, dadosAtualizados);
      
      setCategorias(prev => prev.map(cat => 
        cat.id === id ? { ...cat, ativa: !cat.ativa } : cat
      ));
      toast.success(`Categoria ${!categoria.ativa ? 'ativada' : 'desativada'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar status da categoria:', error);
      toast.error('Erro ao alterar status da categoria');
    }
  };

  // Funções para Centros de Custo
  const adicionarCentroCusto = (novoCentroCusto: Omit<CentroCusto, 'id'>) => {
    const centroCusto: CentroCusto = {
      ...novoCentroCusto,
      id: Date.now()
    };
    setCentrosCusto(prev => [...prev, centroCusto]);
  };

  const editarCentroCusto = (id: number, dadosCentroCusto: Partial<CentroCusto>) => {
    setCentrosCusto(prev => prev.map(centro => 
      centro.id === id ? { ...centro, ...dadosCentroCusto } : centro
    ));
  };

  const excluirCentroCusto = (id: number) => {
    setCentrosCusto(prev => prev.filter(centro => centro.id !== id));
  };

  const toggleCentroCustoAtivo = (id: number) => {
    setCentrosCusto(prev => prev.map(centro => 
      centro.id === id ? { ...centro, ativo: !centro.ativo } : centro
    ));
  };

  // Computed values
  const categoriasAtivas = categorias.filter(cat => cat.ativa);
  const centrosCustoAtivos = centrosCusto.filter(centro => centro.ativo);

  const value: ConfiguracoesContextType = {
    // Estado
    loading,
    
    // Categorias
    categorias,
    categoriasAtivas,
    adicionarCategoria,
    editarCategoria,
    excluirCategoria,
    toggleCategoriaAtiva,
    
    // Centros de Custo
    centrosCusto,
    centrosCustoAtivos,
    adicionarCentroCusto,
    editarCentroCusto,
    excluirCentroCusto,
    toggleCentroCustoAtivo,
  };

  return (
    <ConfiguracoesContext.Provider value={value}>
      {children}
    </ConfiguracoesContext.Provider>
  );
};

export const useConfiguracoes = (): ConfiguracoesContextType => {
  const context = useContext(ConfiguracoesContext);
  if (context === undefined) {
    throw new Error('useConfiguracoes deve ser usado dentro de um ConfiguracoesProvider');
  }
  return context;
};
