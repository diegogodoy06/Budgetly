import React from 'react';
import { 
  PlusIcon, 
  ArrowDownTrayIcon, 
  AdjustmentsHorizontalIcon,
  WalletIcon
} from '@heroicons/react/24/outline';

interface TransactionHeaderProps {
  // Filter states
  filtroContaAtiva: 'todas' | 'bancos' | 'cartoes' | number;
  setFiltroContaAtiva: (value: 'todas' | 'bancos' | 'cartoes' | number) => void;
  mostrarFiltros: boolean;
  setMostrarFiltros: (value: boolean) => void;
  
  // Data
  accounts: Array<{ id: number; nome: string }>;
  creditCards: Array<{ id: number; nome: string }>;
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
  return (
    <div className="mb-6">
      {/* Título Principal */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
          Transações
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Visualize e gerencie suas transações financeiras
        </p>
      </div>

      {/* Filtros de Conta e Informações */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Filtros de Conta */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Visualizar:</span>
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
                className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todas">Todas as Contas</option>
                <option value="bancos">Somente Contas Bancárias</option>
                <option value="cartoes">Somente Cartões</option>
                
                {accounts.length > 0 && <optgroup label="Contas Específicas">
                  {accounts.map(account => (
                    <option key={`acc-${account.id}`} value={account.id}>
                      {account.nome}
                    </option>
                  ))}
                </optgroup>}
                
                {creditCards.length > 0 && <optgroup label="Cartões Específicos">
                  {creditCards.map(card => (
                    <option key={`card-${card.id}`} value={card.id}>
                      {card.nome}
                    </option>
                  ))}
                </optgroup>}
              </select>
            </div>
          </div>

          {/* Indicadores de Resumo */}
          <div className="flex flex-col sm:flex-row gap-4 text-sm">
            <div className="bg-blue-50 px-3 py-2 rounded-md">
              <span className="text-blue-700 font-medium">
                {transacoesFiltradas.length} transação(ões)
              </span>
            </div>
            <div className={`px-3 py-2 rounded-md ${calcularSaldoFiltrado() >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <span className={`font-medium ${calcularSaldoFiltrado() >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                Saldo: {formatarMoeda(calcularSaldoFiltrado())}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2 text-sm">
          <WalletIcon className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">Visualizando:</span>
          <span className="font-medium text-gray-900">{obterNomeFiltroAtivo()}</span>
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
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionHeader;