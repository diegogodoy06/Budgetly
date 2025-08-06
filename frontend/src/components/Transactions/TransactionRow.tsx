import React from 'react';
import BeneficiaryInlineEdit from './BeneficiaryInlineEdit';

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

interface TransactionRowProps {
  transaction: Transaction;
  isSelectionMode: boolean;
  selectedTransactions: Set<number>;
  hoveredTransaction: number | null;
  editingTransaction: number | null;
  editingField: string | null;
  editValue: string;
  
  // Data for dropdowns
  accounts: Array<{ id: number; nome: string }>;
  creditCards: Array<{ id: number; nome: string }>;
  categories: Array<{ id: number; nome: string }>;
  
  // Functions
  selectTransaction: (id: number) => void;
  startEditing: (id: number, field: string, value: string) => void;
  cancelEditing: () => void;
  handleAutoSave: (id: number) => void;
  handleKeyDown: (e: React.KeyboardEvent, id: number) => void;
  handleValorInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (id: number, field: string, value: string) => void;
  handleBeneficiaryChange: (id: number, beneficiaryId: number | null, beneficiaryName?: string) => void;
  toggleStatus: (transaction: Transaction) => void;
  handleDelete: (id: number) => void;
  setEditValue: (value: string) => void;
  setHoveredTransaction: (id: number | null) => void;
  
  // Utility functions
  formatarData: (data: string) => string;
  getContaDisplay: (transaction: Transaction) => React.ReactElement;
  getEditableFieldClass: (isEditing: boolean) => string;
  formatarMoeda: (valor: string | number) => string;
}

const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  isSelectionMode,
  selectedTransactions,
  hoveredTransaction,
  editingTransaction,
  editingField,
  editValue,
  accounts,
  creditCards,
  categories,
  selectTransaction,
  startEditing,
  cancelEditing,
  handleAutoSave,
  handleKeyDown,
  handleValorInputChange,
  handleSelectChange,
  handleBeneficiaryChange,
  toggleStatus,
  handleDelete,
  setEditValue,
  setHoveredTransaction,
  formatarData,
  getContaDisplay,
  getEditableFieldClass,
  formatarMoeda
}) => {
  return (
    <tr 
      className={`${isSelectionMode ? 'cursor-pointer' : 'hover:bg-gray-50'} ${selectedTransactions.has(transaction.id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''} transition-colors group`}
      onClick={() => isSelectionMode && selectTransaction(transaction.id)}
      onMouseEnter={() => setHoveredTransaction(transaction.id)}
      onMouseLeave={() => setHoveredTransaction(null)}
    >
      {/* Checkbox - sempre presente, mas só visível no hover ou modo seleção */}
      <td className="px-2 py-2 whitespace-nowrap">
        <div className={`transition-all duration-200 ${isSelectionMode || hoveredTransaction === transaction.id ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          <input
            type="checkbox"
            checked={selectedTransactions.has(transaction.id)}
            onChange={(e) => {
              e.stopPropagation();
              selectTransaction(transaction.id);
            }}
            className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded hover:scale-110 transition-transform"
          />
        </div>
      </td>
      
      {/* Data */}
      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
        {editingTransaction === transaction.id && editingField === 'data' ? (
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleAutoSave(transaction.id)}
              onKeyDown={(e) => handleKeyDown(e, transaction.id)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              title="Pressione Enter para salvar ou Escape para cancelar"
            />
          </div>
        ) : (
          <span
            onClick={(e) => {
              if (!isSelectionMode) {
                e.stopPropagation();
                // Ensure date is in YYYY-MM-DD format for the input
                const dateValue = transaction.data.includes('T') 
                  ? transaction.data.split('T')[0] 
                  : transaction.data;
                startEditing(transaction.id, 'data', dateValue);
              }
            }}
            className={`${!isSelectionMode ? 'cursor-pointer' : ''} px-2 py-1 rounded ${getEditableFieldClass(false)}`}
          >
            {formatarData(transaction.data)}
          </span>
        )}
      </td>
      
      {/* Conta/Cartão */}
      <td className="px-4 py-2 whitespace-nowrap text-sm">
        {editingTransaction === transaction.id && editingField === 'account' ? (
          <div className="flex items-center space-x-2 min-w-[200px]">
            <select
              value={editValue}
              onChange={(e) => handleSelectChange(transaction.id, 'account', e.target.value)}
              onBlur={() => handleAutoSave(transaction.id)}
              onKeyDown={(e) => handleKeyDown(e, transaction.id)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
              autoFocus
            >
              <option value="">Selecione uma conta/cartão</option>
              <optgroup label="Contas">
                {accounts.map((account) => (
                  <option key={`account-${account.id}`} value={`account-${account.id}`}>
                    {account.nome}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Cartões de Crédito">
                {creditCards.map((card) => (
                  <option key={`card-${card.id}`} value={`card-${card.id}`}>
                    {card.nome}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        ) : (
          <div 
            className={`${!isSelectionMode ? 'cursor-pointer hover:bg-gray-100' : ''} px-2 py-1 rounded`}
            onClick={(e) => {
              if (!isSelectionMode) {
                e.stopPropagation();
                const currentValue = transaction.account 
                  ? `account-${transaction.account}` 
                  : transaction.credit_card 
                    ? `card-${transaction.credit_card}` 
                    : '';
                startEditing(transaction.id, 'account', currentValue);
              }
            }}
          >
            {getContaDisplay(transaction)}
          </div>
        )}
      </td>
      
      {/* Beneficiário */}
      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
        {editingTransaction === transaction.id && editingField === 'beneficiario' ? (
          <BeneficiaryInlineEdit
            value={editValue}
            onSave={(beneficiaryId, beneficiaryName) => {
              handleBeneficiaryChange(transaction.id, beneficiaryId, beneficiaryName);
            }}
            onCancel={cancelEditing}
            onKeyDown={(e) => handleKeyDown(e, transaction.id)}
          />
        ) : (
          <span
            className={`${!isSelectionMode ? 'cursor-pointer hover:bg-gray-100' : ''} px-2 py-1 rounded transition-colors`}
            onClick={(e) => {
              if (!isSelectionMode) {
                e.stopPropagation();
                startEditing(transaction.id, 'beneficiario', transaction.beneficiario_name || '');
              }
            }}
          >
            {transaction.beneficiario_name || '-'}
          </span>
        )}
      </td>
      
      {/* Descrição */}
      <td className="px-4 py-2 text-sm text-gray-900">
        {editingTransaction === transaction.id && editingField === 'descricao' ? (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleAutoSave(transaction.id)}
              onKeyDown={(e) => handleKeyDown(e, transaction.id)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
              maxLength={200}
              autoFocus
              title="Pressione Enter para salvar ou Escape para cancelar"
            />
          </div>
        ) : (
          <div>
            <div 
              className={`font-medium ${!isSelectionMode ? 'cursor-pointer hover:bg-gray-100' : ''} px-2 py-1 rounded`}
              onClick={(e) => {
                if (!isSelectionMode) {
                  e.stopPropagation();
                  startEditing(transaction.id, 'descricao', transaction.descricao);
                }
              }}
            >
              {transaction.descricao}
            </div>
            {transaction.total_parcelas > 1 && (
              <div className="text-xs text-gray-500">
                Parcela {transaction.numero_parcela}/{transaction.total_parcelas}
              </div>
            )}
          </div>
        )}
      </td>
      
      {/* Categoria */}
      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
        {editingTransaction === transaction.id && editingField === 'category' ? (
          <div className="flex items-center space-x-2 min-w-[200px]">
            <div className="flex-1">
              <select
                value={editValue || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setEditValue(value);
                  // Auto-salvar após seleção
                  if (value) {
                    setTimeout(() => handleAutoSave(transaction.id), 100);
                  }
                }}
                onBlur={() => handleAutoSave(transaction.id)}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                autoFocus
              >
                <option value="">Selecionar categoria...</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nome}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={cancelEditing}
              className="text-red-600 hover:text-red-800 text-xs"
              title="Fechar"
            >
              ✕
            </button>
          </div>
        ) : (
          <span 
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ${!isSelectionMode ? 'cursor-pointer hover:bg-blue-200' : ''} transition-colors`}
            onClick={(e) => {
              if (!isSelectionMode) {
                e.stopPropagation();
                startEditing(transaction.id, 'category', transaction.category?.toString() || '');
              }
            }}
          >
            {transaction.category_name || 'Sem categoria'}
          </span>
        )}
      </td>
      
      {/* Valor */}
      <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
        {editingTransaction === transaction.id && editingField === 'valor' ? (
          <div className="flex items-center justify-end space-x-2">
            <input
              type="text"
              value={editValue}
              onChange={handleValorInputChange}
              onBlur={() => handleAutoSave(transaction.id)}
              onKeyDown={(e) => handleKeyDown(e, transaction.id)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-32 text-right"
              placeholder="0,00"
              autoFocus
              title="Pressione Enter para salvar ou Escape para cancelar"
            />
          </div>
        ) : (
          <span 
            className={`${!isSelectionMode ? 'cursor-pointer hover:bg-gray-100' : ''} px-2 py-1 rounded ${
              transaction.tipo === 'entrada' ? 'text-green-600' : 
              transaction.tipo === 'saida' ? 'text-red-600' : 'text-blue-600'
            }`}
            onClick={(e) => {
              if (!isSelectionMode) {
                e.stopPropagation();
                startEditing(transaction.id, 'valor', transaction.valor.toString().replace('.', ','));
              }
            }}
          >
            {transaction.tipo === 'entrada' ? '+' : transaction.tipo === 'saida' ? '-' : '↔'}
            {formatarMoeda(transaction.valor)}
          </span>
        )}
      </td>
      
      {/* Status como ícone */}
      <td className="px-4 py-2 whitespace-nowrap text-center">
        {/* Para cartão de crédito: sempre confirmado, sem interação */}
        {transaction.credit_card ? (
          <div className="flex justify-center">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        ) : (
          /* Para outras contas: permitir toggle */
          <button
            onClick={(e) => {
              if (!isSelectionMode) {
                e.stopPropagation();
                toggleStatus(transaction);
              }
            }}
            disabled={isSelectionMode}
            className={`flex justify-center items-center w-full ${!isSelectionMode ? 'hover:bg-gray-100' : ''} rounded p-1 transition-colors ${isSelectionMode ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isSelectionMode ? 'Desative o modo de seleção para alterar status' : (transaction.confirmada ? "Clique para marcar como prevista" : "Clique para marcar como confirmada")}
          >
            <svg 
              className={`w-4 h-4 ${transaction.confirmada ? 'text-green-600' : 'text-gray-300'} transition-colors`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </td>
    </tr>
  );
};

export default TransactionRow;