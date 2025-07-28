import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Categoria {
  id: number;
  nome: string;
  ativa: boolean;
  considerarDashboard: boolean;
  importancia: 'essencial' | 'necessario' | 'superfluo';
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

// Dados iniciais
const categoriasIniciais: Categoria[] = [
  { id: 1, nome: 'Alimentação', ativa: true, considerarDashboard: true, importancia: 'essencial' },
  { id: 2, nome: 'Transporte', ativa: true, considerarDashboard: true, importancia: 'necessario' },
  { id: 3, nome: 'Moradia', ativa: true, considerarDashboard: true, importancia: 'essencial' },
  { id: 4, nome: 'Saúde', ativa: true, considerarDashboard: true, importancia: 'essencial' },
  { id: 5, nome: 'Entretenimento', ativa: true, considerarDashboard: false, importancia: 'superfluo' },
  { id: 6, nome: 'Compras Online', ativa: true, considerarDashboard: true, importancia: 'necessario' },
  { id: 7, nome: 'Combustível', ativa: true, considerarDashboard: true, importancia: 'necessario' },
  { id: 8, nome: 'Outros', ativa: true, considerarDashboard: false, importancia: 'superfluo' }
];

const centrosCustoIniciais: CentroCusto[] = [
  { id: 1, nome: 'Pessoal', ativo: true },
  { id: 2, nome: 'Trabalho', ativo: true },
  { id: 3, nome: 'Família', ativo: true },
  { id: 4, nome: 'Geral', ativo: true }
];

interface ConfiguracoesProviderProps {
  children: ReactNode;
}

export const ConfiguracoesProvider: React.FC<ConfiguracoesProviderProps> = ({ children }) => {
  const [categorias, setCategorias] = useState<Categoria[]>(categoriasIniciais);
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>(centrosCustoIniciais);

  // Funções para Categorias
  const adicionarCategoria = (novaCategoria: Omit<Categoria, 'id'>) => {
    const categoria: Categoria = {
      ...novaCategoria,
      id: Date.now()
    };
    setCategorias(prev => [...prev, categoria]);
  };

  const editarCategoria = (id: number, dadosCategoria: Partial<Categoria>) => {
    setCategorias(prev => prev.map(cat => 
      cat.id === id ? { ...cat, ...dadosCategoria } : cat
    ));
  };

  const excluirCategoria = (id: number) => {
    setCategorias(prev => prev.filter(cat => cat.id !== id));
  };

  const toggleCategoriaAtiva = (id: number) => {
    setCategorias(prev => prev.map(cat => 
      cat.id === id ? { ...cat, ativa: !cat.ativa } : cat
    ));
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
