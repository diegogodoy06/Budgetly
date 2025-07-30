import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { categoriesAPI } from '@/services/api';
import type { Category } from '@/types';
import toast from 'react-hot-toast';

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

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carrega categorias da API
      const categoriasAPI = await categoriesAPI.getAll();
      const categoriasConvertidas = categoriasAPI.map(convertCategoryToCategoria);
      setCategorias(categoriasConvertidas);
      
      // Por enquanto, mantém centros de custo mock
      setCentrosCusto([
        { id: 1, nome: 'Pessoal', ativo: true },
        { id: 2, nome: 'Trabalho', ativo: true },
        { id: 3, nome: 'Família', ativo: true },
        { id: 4, nome: 'Geral', ativo: true }
      ]);
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
