import React from 'react';
import { 
  PlusIcon, 
  ArrowDownTrayIcon, 
  AdjustmentsHorizontalIcon,
  WalletIcon,
  CreditCardIcon,
  BuildingLibraryIcon
} from '@heroicons/react/24/outline';

interface TransactionHeaderProps {
  // Filter states
  filtroContaAtiva: 'todas' | 'bancos' | 'cartoes' | number;
  setFiltroContaAtiva: (value: 'todas' | 'bancos' | 'cartoes' | number) => void;
  mostrarFiltros: boolean;
  setMostrarFiltros: (value: boolean) => void;
  
  // Data
  accounts: Array<{ id: number; nome: string; tipo: string; banco?: string }>;
  creditCards: Array<{ id: number; nome: string; bandeira?: string }>;
  transacoesFiltradas: Array<any>;
  
  // Computed values
  contarFiltrosAtivos: () => number;
  obterNomeFiltroAtivo: () => string;
  calcularSaldoFiltrado: () => number;
  formatarMoeda: (valor: string | number) => string;
  
  // Actions
  abrirPopupAdicionar: () => void;
}

const TransactionHeader: React.FC<TransactionHeaderProps> = ({
  filtroContaAtiva,
  setFiltroContaAtiva,
  mostrarFiltros,
  setMostrarFiltros,
  accounts,
  creditCards,
  transacoesFiltradas,
  contarFiltrosAtivos,
  obterNomeFiltroAtivo,
  calcularSaldoFiltrado,
  formatarMoeda,
  abrirPopupAdicionar
}) => {
  
  // Helper function to get icon based on filter type
  const getFilterIcon = () => {
    if (filtroContaAtiva === 'bancos') {
      return <BuildingLibraryIcon className="h-6 w-6" />;
    } else if (filtroContaAtiva === 'cartoes') {
      return <CreditCardIcon className="h-6 w-6" />;
    } else if (typeof filtroContaAtiva === 'number') {
      // Check if it's a specific account or credit card
      const account = accounts.find(acc => acc.id === filtroContaAtiva);
      const creditCard = creditCards.find(card => card.id === filtroContaAtiva);
      
      if (creditCard) {
        return <CreditCardIcon className="h-6 w-6" />;
      } else {
        return <BuildingLibraryIcon className="h-6 w-6" />;
      }
    } else {
      return <WalletIcon className="h-6 w-6" />;
    }
  };

  // Helper function to get account type description
  const getAccountTypeDescription = () => {
    if (filtroContaAtiva === 'todas') {
      return 'Visualizando todas as contas e cartões';
    } else if (filtroContaAtiva === 'bancos') {
      return 'Visualizando apenas contas bancárias';
    } else if (filtroContaAtiva === 'cartoes') {
      return 'Visualizando apenas cartões de crédito';
    } else if (typeof filtroContaAtiva === 'number') {
      const account = accounts.find(acc => acc.id === filtroContaAtiva);
      const creditCard = creditCards.find(card => card.id === filtroContaAtiva);
      
      if (account) {
        return `Conta: ${account.tipo}${account.banco ? ` - ${account.banco}` : ''}`;
      } else if (creditCard) {
        return `Cartão de crédito${creditCard.bandeira ? ` ${creditCard.bandeira}` : ''}`;
      }
    }
    return 'Filtro personalizado';
  };

  // Helper function to get color theme based on filter
  const getFilterTheme = () => {
    if (filtroContaAtiva === 'bancos') {
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        icon: 'text-blue-600'
      };
    } else if (filtroContaAtiva === 'cartoes') {
      return {
        bg: 'bg-purple-50',
        border: 'border-purple-200', 
        text: 'text-purple-700',
        icon: 'text-purple-600'
      };
    } else if (typeof filtroContaAtiva === 'number') {
      const creditCard = creditCards.find(card => card.id === filtroContaAtiva);
      if (creditCard) {
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          text: 'text-purple-700',
          icon: 'text-purple-600'
        };
      } else {
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-700',
          icon: 'text-blue-600'
        };
      }
    } else {
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700', 
        icon: 'text-gray-600'
      };
    }
  };

  const theme = getFilterTheme();

  return (
    <div className="mb-6">
      {/* Main Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
          Transações
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Visualize e gerencie suas transações financeiras
        </p>
      </div>

      {/* Account Context Card - New prominent design */}
      <div className={`${theme.bg} ${theme.border} border-2 rounded-xl p-6 mb-6 shadow-sm`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          
          {/* Account Information Section */}
          <div className="flex items-center space-x-4">
            <div className={`${theme.icon} p-3 bg-white rounded-lg shadow-sm`}>
              {getFilterIcon()}
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${theme.text}`}>
                {obterNomeFiltroAtivo()}
              </h3>
              <p className="text-sm text-gray-600">
                {getAccountTypeDescription()}
              </p>
            </div>
          </div>

          {/* Account Filter Selector */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center space-x-3">
              <label className="text-sm font-medium text-gray-700">
                Alterar visualização:
              </label>
              <select
                value={filtroContaAtiva}
                onChange={(e) => {
                  const valor = e.target.value;
                  if (valor === 'todas' || valor === 'bancos' || valor === 'cartoes') {
                    setFiltroContaAtiva(valor);
                  } else {
                    setFiltroContaAtiva(parseInt(valor));
                  }
                }}
                className="text-sm border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-48"
              >
                <option value="todas">📊 Todas as Contas</option>
                <option value="bancos">🏦 Todas as Contas Bancárias</option>
                <option value="cartoes">💳 Todos os Cartões</option>
                
                {accounts.length > 0 && (
                  <optgroup label="🏦 Contas Específicas">
                    {accounts.map(account => (
                      <option key={`acc-${account.id}`} value={account.id}>
                        {account.nome}
                      </option>
                    ))}
                  </optgroup>
                )}
                
                {creditCards.length > 0 && (
                  <optgroup label="💳 Cartões Específicos">
                    {creditCards.map(card => (
                      <option key={`card-${card.id}`} value={card.id}>
                        {card.nome}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Summary Stats Row */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-600">Total de Transações</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {transacoesFiltradas.length}
            </span>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${calcularSaldoFiltrado() >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium text-gray-600">Saldo do Período</span>
            </div>
            <span className={`text-lg font-semibold ${calcularSaldoFiltrado() >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatarMoeda(calcularSaldoFiltrado())}
            </span>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-600">Contexto Atual</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {filtroContaAtiva === 'todas' ? 'Global' : 
               filtroContaAtiva === 'bancos' ? 'Bancos' :
               filtroContaAtiva === 'cartoes' ? 'Cartões' : 'Específico'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-600">Ações rápidas:</span>
        </div>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              mostrarFiltros ? 'bg-blue-50 text-blue-700 border-blue-300' : 'text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
            Filtros Avançados
            {contarFiltrosAtivos() > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {contarFiltrosAtivos()}
              </span>
            )}
          </button>
          
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Exportar
          </button>
          
          <button
            type="button"
            onClick={abrirPopupAdicionar}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nova Transação
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionHeader;