import React, { useState, useEffect } from 'react';
import { TrashIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import type { Transaction } from '@/types';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  selectedMonth: string;
  isInvoiceClosed: boolean;
  onDeleteTransaction: (transactionId: number) => void;
  onAddTransaction: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  isLoading,
  selectedMonth,
  isInvoiceClosed,
  onDeleteTransaction,
  onAddTransaction
}) => {
  const [openActionsMenu, setOpenActionsMenu] = useState<number | null>(null);

  const handleActionsClick = (transactionId: number) => {
    setOpenActionsMenu(openActionsMenu === transactionId ? null : transactionId);
  };

  const handleDeleteClick = (transactionId: number) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      onDeleteTransaction(transactionId);
    }
    setOpenActionsMenu(null);
  };

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (_event: MouseEvent) => {
      setOpenActionsMenu(null);
    };
    
    if (openActionsMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openActionsMenu]);

  if (transactions.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8">
        <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma transação encontrada</h3>
        <p className="text-gray-600 mb-4">Nenhuma movimentação encontrada para este mês</p>
        {!isInvoiceClosed && (
          <button
            onClick={onAddTransaction}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Adicionar Transação
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Data
              </th>
              <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Descrição
              </th>
              <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Categoria
              </th>
              <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                Parcela
              </th>
              <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    <span className="ml-2 text-sm text-gray-500">Carregando transações...</span>
                  </div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-sm text-gray-500">
                  Nenhuma transação encontrada para este período
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-700">
                    {new Date(transaction.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-700">
                    <p className="font-normal">{transaction.descricao}</p>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-600">
                    <span className="text-xs text-blue-600 bg-blue-100 rounded-full px-2 py-1 inline-block">
                      {transaction.category_name || 'Sem categoria'}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500 text-center">
                    {transaction.total_parcelas > 1 ? `${transaction.numero_parcela}/${transaction.total_parcelas}` : '-'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-right">
                    <span className={`${transaction.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.tipo === 'entrada' ? '+' : '-'} R$ {parseFloat(transaction.valor).toFixed(2).replace('.', ',')}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center text-xs font-normal relative">
                    <button 
                      onClick={() => handleActionsClick(transaction.id)}
                      className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    
                    {/* Menu de ações */}
                    {openActionsMenu === transaction.id && (
                      <div className="absolute right-0 top-10 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1" role="menu">
                          <button
                            onClick={() => handleDeleteClick(transaction.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                            role="menuitem"
                          >
                            <TrashIcon className="h-4 w-4 mr-2 inline" />
                            Excluir
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;