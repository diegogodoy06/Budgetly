import React, { useState } from 'react';
import { 
  PlusIcon, 
  ArrowDownTrayIcon, 
  FunnelIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import InvoiceManagementModal from './InvoiceManagementModal';
import AdvancedFilters from './AdvancedFilters';

interface TransactionHeaderProps {
  // Filter states
  filtroContaAtiva: 'todas' | 'bancos' | 'cartoes' | number;
  setFiltroContaAtiva: (value: 'todas' | 'bancos' | 'cartoes' | number) => void;
  mostrarFiltros: boolean;
  setMostrarFiltros: (value: boolean) => void;
  
  // Data
  accounts: Array<{ id: number; nome: string; tipo: string; banco?: string }>;
  creditCards: Array<{ id: number; nome: string; bandeira?: string }>;
  categories: Array<{ id: number; nome: string }>;
  transacoesFiltradas: Array<any>;
  
  // Computed values
  contarFiltrosAtivos: () => number;
  obterNomeFiltroAtivo: () => string;
  calcularSaldoFiltrado: () => number;
  formatarMoeda: (valor: string | number) => string;
  
  // Actions
  abrirPopupAdicionar: () => void;
  abrirImportarCSV?: () => void;
  
  // New props for advanced filtering and search
  searchTerm?: string;
  setSearchTerm?: (value: string) => void;
  selectedTransactions?: Set<number>;
  isSelectionMode?: boolean;
  
  // Advanced filters
  advancedFilters?: Array<{
    id: string;
    field: string;
    fieldLabel: string;
    operation: string;
    operationLabel: string;
    value: string | number | string[];
    valueLabel: string;
  }>;
  setAdvancedFilters?: (filters: Array<{
    id: string;
    field: string;
    fieldLabel: string;
    operation: string;
    operationLabel: string;
    value: string | number | string[];
    valueLabel: string;
  }>) => void;
}

const TransactionHeader: React.FC<TransactionHeaderProps> = ({
  filtroContaAtiva,
  setFiltroContaAtiva,
  mostrarFiltros,
  setMostrarFiltros,
  accounts,
  creditCards,
  categories,
  transacoesFiltradas,
  contarFiltrosAtivos,
  obterNomeFiltroAtivo,
  calcularSaldoFiltrado,
  formatarMoeda,
  abrirPopupAdicionar,
  abrirImportarCSV,
  searchTerm = '',
  setSearchTerm,
  selectedTransactions = new Set(),
  isSelectionMode = false,
  advancedFilters = [],
  setAdvancedFilters
}) => {
  
  // State for invoice modal
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  
  // State for total breakdown
  const [showTotalBreakdown, setShowTotalBreakdown] = useState(false);
  
  // Calculate confirmed and unconfirmed totals
  const calculateTotalBreakdown = () => {
    const confirmed = transacoesFiltradas
      .filter(t => t.confirmada)
      .reduce((sum, t) => sum + (t.tipo === 'entrada' ? t.valor : -t.valor), 0);
    
    const unconfirmed = transacoesFiltradas
      .filter(t => !t.confirmada)
      .reduce((sum, t) => sum + (t.tipo === 'entrada' ? t.valor : -t.valor), 0);
    
    return { confirmed, unconfirmed };
  };

  const { confirmed, unconfirmed } = calculateTotalBreakdown();

  // Check if a specific credit card is selected
  const isSpecificCreditCardSelected = () => {
    if (typeof filtroContaAtiva === 'number') {
      return creditCards.find(card => card.id === filtroContaAtiva);
    }
    return null;
  };

  const selectedCreditCard = isSpecificCreditCardSelected();

  return (
    <div className="mb-6">
      {/* Page Title */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
          Transações
        </h2>
      </div>

      {/* Simplified Summary Display */}
      <div className="mb-6">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            {transacoesFiltradas.length} transações
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowTotalBreakdown(!showTotalBreakdown)}
              className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors duration-200"
            >
              {formatarMoeda(calcularSaldoFiltrado())}
            </button>
            
            {/* Inline Breakdown */}
            {showTotalBreakdown && (
              <div className="flex items-center space-x-3 text-sm">
                <span className="text-green-600 font-medium">
                  Confirmadas: {formatarMoeda(confirmed)}
                </span>
                <span className="text-orange-600 font-medium">
                  Pendentes: {formatarMoeda(unconfirmed)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout: Left side (Add New + Filters) and Right side (Search + Actions) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        
        {/* Left Side - Add New and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 relative">
          <button
            type="button"
            onClick={abrirPopupAdicionar}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nova Transação
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                mostrarFiltros ? 'bg-blue-50 text-blue-700 border-blue-300' : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filtros Avançados
              {contarFiltrosAtivos() > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {contarFiltrosAtivos()}
                </span>
              )}
            </button>

            {/* Advanced Filters Dropdown */}
            {mostrarFiltros && setAdvancedFilters && (
              <div className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                <div className="p-4">
                  <AdvancedFilters
                    accounts={accounts}
                    creditCards={creditCards}
                    categories={categories}
                    onFiltersChange={setAdvancedFilters}
                    activeFilters={advancedFilters}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Search and Row Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Field */}
          {setSearchTerm && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por descrição..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          )}

          {/* Row Selection Actions */}
          {isSelectionMode && selectedTransactions.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedTransactions.size} selecionada(s)
              </span>
              {/* These actions will be handled by BulkOperations component */}
            </div>
          )}

          {/* Invoice button - only show when a specific credit card is selected */}
          {selectedCreditCard && (
            <button
              type="button"
              onClick={() => setShowInvoiceModal(true)}
              className="inline-flex items-center px-4 py-2 border border-purple-300 rounded-md shadow-sm text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Gerenciar Fatura
            </button>
          )}

          {/* CSV Import button */}
          {abrirImportarCSV && (
            <button
              type="button"
              onClick={abrirImportarCSV}
              className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
              Importar CSV
            </button>
          )}

          {/* Export button with three dots menu */}
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Management Modal */}
      {showInvoiceModal && selectedCreditCard && (
        <InvoiceManagementModal
          creditCard={selectedCreditCard}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  );
};

export default TransactionHeader;