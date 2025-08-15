import React from 'react';
import TransactionRow from './TransactionRow';

interface Transaction {
  id: number;
  data: string;
  account_name?: string;
  credit_card?: number;
  beneficiario_name?: string;
  descricao: string;
  category?: number;
  category_name?: string;
  valor: string;
  tipo: string;
  confirmada: boolean;
  total_parcelas: number;
  numero_parcela?: number;
  account?: number;
}

interface TransactionTableProps {
  loading: boolean;
  transacoesFiltradas: Transaction[];
  isSelectionMode: boolean;
  selectedTransactions: Set<number>;
  hoveredTransaction: number | null;
  setHoveredTransaction: (id: number | null) => void;
  editingTransaction: number | null;
  editingField: string | null;
  editValue: string;
  
  // Data for dropdowns
  accounts: Array<{ id: number; nome: string }>;
  creditCards: Array<{ id: number; nome: string }>;
  categories: Array<{ id: number; nome: string }>;
  
  // Selection functions
  selectAll: () => void;
  selectTransaction: (id: number) => void;
  
  // Editing functions
  startEditing: (id: number, field: string, value: string) => void;
  cancelEditing: () => void;
  handleAutoSave: (id: number) => void;
  handleKeyDown: (e: React.KeyboardEvent, id: number) => void;
  handleValorInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (id: number, field: string, value: string) => void;
  handleBeneficiaryChange: (id: number, beneficiaryId: number | null, beneficiaryName?: string) => void;
  setEditValue: (value: string) => void;
  
  // Action functions
  toggleStatus: (transaction: Transaction) => void;
  handleDelete: (id: number) => void;
  
  // Utility functions
  formatarData: (data: string) => string;
  getContaDisplay: (transaction: Transaction) => React.ReactElement;
  getEditableFieldClass: (isEditing: boolean) => string;
  formatarMoeda: (valor: string | number) => string;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  carregarDados: (page?: number) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  loading,
  transacoesFiltradas,
  isSelectionMode,
  selectedTransactions,
  hoveredTransaction,
  setHoveredTransaction,
  editingTransaction,
  editingField,
  editValue,
  accounts,
  creditCards,
  categories,
  selectAll,
  selectTransaction,
  startEditing,
  cancelEditing,
  handleAutoSave,
  handleKeyDown,
  handleValorInputChange,
  handleSelectChange,
  handleBeneficiaryChange,
  setEditValue,
  toggleStatus,
  handleDelete,
  formatarData,
  getContaDisplay,
  getEditableFieldClass,
  formatarMoeda,
  currentPage,
  totalPages,
  totalCount,
  hasNextPage,
  carregarDados
}) => {
  return (
    <div className="glass-card overflow-hidden float-card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200/50 dark:divide-gray-700/50">
          <thead className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <tr>
              {/* Coluna sempre presente para checkbox */}
              <th className="px-2 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-8">
                {isSelectionMode && (
                  <input
                    type="checkbox"
                    checked={selectedTransactions.size === transacoesFiltradas.length && transacoesFiltradas.length > 0}
                    onChange={selectAll}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                  />
                )}
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Data
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Conta/Cartão
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Beneficiário
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-8">
                ✓
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm divide-y divide-gray-200/50 dark:divide-gray-700/50">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 dark:border-primary-400"></div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 font-medium">Carregando transações...</span>
                  </div>
                </td>
              </tr>
            ) : transacoesFiltradas.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Nenhuma transação encontrada
                </td>
              </tr>
            ) : (
              transacoesFiltradas.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  isSelectionMode={isSelectionMode}
                  selectedTransactions={selectedTransactions}
                  hoveredTransaction={hoveredTransaction}
                  editingTransaction={editingTransaction}
                  editingField={editingField}
                  editValue={editValue}
                  accounts={accounts}
                  creditCards={creditCards}
                  categories={categories}
                  selectTransaction={selectTransaction}
                  startEditing={startEditing}
                  cancelEditing={cancelEditing}
                  handleAutoSave={handleAutoSave}
                  handleKeyDown={handleKeyDown}
                  handleValorInputChange={handleValorInputChange}
                  handleSelectChange={handleSelectChange}
                  handleBeneficiaryChange={handleBeneficiaryChange}
                  toggleStatus={toggleStatus}
                  handleDelete={handleDelete}
                  setEditValue={setEditValue}
                  setHoveredTransaction={setHoveredTransaction}
                  formatarData={formatarData}
                  getContaDisplay={getContaDisplay}
                  getEditableFieldClass={getEditableFieldClass}
                  formatarMoeda={formatarMoeda}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Paginação - só aparece se houver mais de uma página */}
      {totalPages > 1 && (
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-4 py-3 border-t border-gray-200/50 dark:border-gray-700/50 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              {/* Mobile: botões simples */}
              <button
                onClick={() => carregarDados(currentPage - 1)}
                disabled={currentPage <= 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => carregarDados(currentPage + 1)}
                disabled={!hasNextPage}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
            
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  Mostrando <span className="font-bold">{(currentPage - 1) * 1000 + 1}</span> a{' '}
                  <span className="font-bold">
                    {Math.min(currentPage * 1000, totalCount)}
                  </span> de{' '}
                  <span className="font-bold">{totalCount}</span> transações
                </p>
              </div>
              
              <div>
                <nav className="relative z-0 inline-flex rounded-button shadow-sm -space-x-px" aria-label="Pagination">
                  {/* Botão Anterior */}
                  <button
                    onClick={() => carregarDados(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-button border border-gray-300/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-600/70 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Números das páginas */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => carregarDados(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium backdrop-blur-sm ${
                          pageNum === currentPage
                            ? 'z-10 bg-primary-50 dark:bg-primary-900/30 border-primary-500 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                            : 'bg-white/50 dark:bg-gray-700/50 border-gray-300/50 dark:border-gray-600/50 text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-600/70'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {/* Botão Próxima */}
                  <button
                    onClick={() => carregarDados(currentPage + 1)}
                    disabled={!hasNextPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-button border border-gray-300/50 dark:border-gray-600/50 bg-white/50 dark:bg-gray-700/50 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-gray-600/70 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;