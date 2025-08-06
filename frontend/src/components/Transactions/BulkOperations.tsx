import React from 'react';

interface BulkOperationsProps {
  isSelectionMode: boolean;
  selectedTransactions: Set<number>;
  transactions: Array<{ id: number; valor: string; confirmada: boolean }>;
  transacoesFiltradas: Array<any>;
  totalCount: number;
  formatarMoeda: (valor: string | number) => string;
  selectAll: () => void;
  clearSelection: () => void;
  confirmSelectedTransactions: () => void;
  deleteSelectedTransactions: () => void;
  duplicateSelectedTransactions: () => void;
  showBulkEditDropdown: boolean;
  setShowBulkEditDropdown: (value: boolean) => void;
  openBulkEdit: (field: string) => void;
}

const BulkOperations: React.FC<BulkOperationsProps> = ({
  isSelectionMode,
  selectedTransactions,
  transactions,
  transacoesFiltradas,
  totalCount,
  formatarMoeda,
  selectAll,
  clearSelection,
  confirmSelectedTransactions,
  deleteSelectedTransactions,
  duplicateSelectedTransactions,
  showBulkEditDropdown,
  setShowBulkEditDropdown,
  openBulkEdit
}) => {
  if (!isSelectionMode) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-blue-900">
            {selectedTransactions.size} selecionada(s)
          </span>
          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {transacoesFiltradas.length}/{totalCount}
          </span>
          {selectedTransactions.size > 0 && (
            <>
              <span className="text-sm text-blue-700">
                {formatarMoeda(
                  transactions
                    .filter(t => selectedTransactions.has(t.id))
                    .reduce((sum, t) => sum + parseFloat(t.valor), 0)
                )}
              </span>
              {transactions.filter(t => selectedTransactions.has(t.id) && !t.confirmada).length > 0 && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  {transactions.filter(t => selectedTransactions.has(t.id) && !t.confirmada).length} pendente(s)
                </span>
              )}
            </>
          )}
          <button
            onClick={selectAll}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            {selectedTransactions.size === transacoesFiltradas.length ? 'Desmarcar' : 'Selecionar'} todas
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedTransactions.size > 0 && (
            <>
              <button
                onClick={confirmSelectedTransactions}
                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
              >
                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirmar
              </button>
              
              <button
                onClick={deleteSelectedTransactions}
                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
              >
                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Excluir
              </button>
              
              <button
                onClick={duplicateSelectedTransactions}
                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Duplicar
              </button>
              
              <div className="relative bulk-edit-dropdown">
                <button
                  onClick={() => setShowBulkEditDropdown(!showBulkEditDropdown)}
                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700"
                >
                  <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Editar
                  <svg className="h-3 w-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showBulkEditDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <button
                        onClick={() => { openBulkEdit('descricao'); setShowBulkEditDropdown(false); }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Descrição
                      </button>
                      <button
                        onClick={() => { openBulkEdit('valor'); setShowBulkEditDropdown(false); }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Valor
                      </button>
                      <button
                        onClick={() => { openBulkEdit('data'); setShowBulkEditDropdown(false); }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Data
                      </button>
                      <button
                        onClick={() => { openBulkEdit('category'); setShowBulkEditDropdown(false); }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Categoria
                      </button>
                      <button
                        onClick={() => { openBulkEdit('account'); setShowBulkEditDropdown(false); }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Conta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          
          <button
            onClick={clearSelection}
            className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            title="Pressione Escape para sair do modo de seleção"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkOperations;