import React from 'react';
import { 
  XMarkIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  WalletIcon,
  TagIcon
} from '@heroicons/react/24/outline';

interface Filtros {
  descricao: string;
  periodo: {
    inicio: string;
    fim: string;
  };
  carteiras: number[];
  categorias: number[];
}

interface TransactionFiltersProps {
  mostrarFiltros: boolean;
  setMostrarFiltros: (value: boolean) => void;
  filtros: Filtros;
  setFiltros: React.Dispatch<React.SetStateAction<Filtros>>;
  accounts: Array<{ id: number; nome: string }>;
  creditCards: Array<{ id: number; nome: string }>;
  categories: Array<{ id: number; nome: string }>;
  aplicarFiltros: () => void;
  limparFiltros: () => void;
  toggleItemFiltro: (lista: number[], item: number) => number[];
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  mostrarFiltros,
  setMostrarFiltros,
  filtros,
  setFiltros,
  accounts,
  creditCards,
  categories,
  aplicarFiltros,
  limparFiltros,
  toggleItemFiltro
}) => {
  if (!mostrarFiltros) return null;

  return (
    <>
      {/* Barra Lateral de Filtros */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-40 overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
            <button
              onClick={() => setMostrarFiltros(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MagnifyingGlassIcon className="h-4 w-4 inline mr-2" />
              Descrição
            </label>
            <input
              type="text"
              value={filtros.descricao}
              onChange={(e) => setFiltros(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Buscar por descrição..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Período */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarIcon className="h-4 w-4 inline mr-2" />
              Período
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">De</label>
                <input
                  type="date"
                  value={filtros.periodo.inicio}
                  onChange={(e) => setFiltros(prev => ({ 
                    ...prev, 
                    periodo: { ...prev.periodo, inicio: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Até</label>
                <input
                  type="date"
                  value={filtros.periodo.fim}
                  onChange={(e) => setFiltros(prev => ({ 
                    ...prev, 
                    periodo: { ...prev.periodo, fim: e.target.value }
                  }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Carteiras */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <WalletIcon className="h-4 w-4 inline mr-2" />
              Contas e Cartões
            </label>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {/* Contas */}
              {accounts.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">CONTAS</p>
                  <div className="space-y-2">
                    {accounts.map((account) => (
                      <label key={`account-${account.id}`} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filtros.carteiras.includes(account.id)}
                          onChange={() => setFiltros(prev => ({
                            ...prev,
                            carteiras: toggleItemFiltro(prev.carteiras, account.id)
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{account.nome}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Cartões */}
              {creditCards.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">CARTÕES</p>
                  <div className="space-y-2">
                    {creditCards.map((card) => (
                      <label key={`card-${card.id}`} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filtros.carteiras.includes(card.id)}
                          onChange={() => setFiltros(prev => ({
                            ...prev,
                            carteiras: toggleItemFiltro(prev.carteiras, card.id)
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{card.nome}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Categorias */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TagIcon className="h-4 w-4 inline mr-2" />
              Categorias
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filtros.categorias.includes(category.id)}
                    onChange={() => setFiltros(prev => ({
                      ...prev,
                      categorias: toggleItemFiltro(prev.categorias, category.id)
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{category.nome}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="pt-6 border-t border-gray-200 space-y-3">
            <button
              onClick={limparFiltros}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Limpar Filtros
            </button>
            <button
              onClick={aplicarFiltros}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 z-30"
        onClick={() => setMostrarFiltros(false)}
      />
    </>
  );
};

export default TransactionFilters;