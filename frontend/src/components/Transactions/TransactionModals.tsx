import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import CategorySelector from '../CategorySelector';
import TransactionFormNew from '../TransactionFormNew';

interface TransactionForm {
  account?: number;
  to_account?: number;
  credit_card?: number;
  tipo: 'entrada' | 'saida' | 'transferencia';
  valor: number;
  descricao: string;
  data: string;
  category?: number;
  total_parcelas: number;
  tipo_recorrencia: 'nenhuma' | 'diaria' | 'semanal' | 'mensal' | 'anual';
  data_fim_recorrencia?: string;
  confirmada: boolean;
}

interface Transaction {
  id: number;
  [key: string]: any;
}

interface TransactionModalsProps {
  // Main form modal
  mostrarPopup: boolean;
  setMostrarPopup: (value: boolean) => void;
  transactionEditando: Transaction | null;
  isRecorrente: boolean;
  setIsRecorrente: (value: boolean) => void;
  formData: TransactionForm;
  setFormData: React.Dispatch<React.SetStateAction<TransactionForm>>;
  
  // New transaction modal
  mostrarNovoModal: boolean;
  setMostrarNovoModal: (value: boolean) => void;
  
  // Bulk edit modal
  showBulkEditModal: boolean;
  setShowBulkEditModal: (value: boolean) => void;
  bulkEditField: string;
  bulkEditValue: string;
  setBulkEditValue: (value: string) => void;
  selectedTransactions: Set<number>;
  
  // Data
  accounts: Array<{ id: number; nome: string; saldo_atual: number }>;
  creditCards: Array<{ id: number; nome: string }>;
  categories: Array<{ id: number; nome: string }>;
  
  // Functions
  handleSubmit: (e: React.FormEvent) => void;
  fecharPopup: () => void;
  handleValorChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formatarValorDisplay: (valor: number) => string;
  carregarDados: () => void;
  closeBulkEditModal: () => void;
  bulkEditTransactions: () => void;
}

const TransactionModals: React.FC<TransactionModalsProps> = ({
  mostrarPopup,
  transactionEditando,
  isRecorrente,
  setIsRecorrente,
  formData,
  setFormData,
  mostrarNovoModal,
  setMostrarNovoModal,
  showBulkEditModal,
  bulkEditField,
  bulkEditValue,
  setBulkEditValue,
  selectedTransactions,
  accounts,
  creditCards,
  categories,
  handleSubmit,
  fecharPopup,
  carregarDados,
  closeBulkEditModal,
  bulkEditTransactions
}) => {
  // Funções simplificadas para formatação de valor (baseadas no TransactionFormNew)
  const formatarValorDisplay = (valor: number): string => {
    if (valor === 0) return '';
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const parseValorInput = (value: string): number => {
    if (!value) return 0;
    // Remove todos os caracteres que não são dígitos, vírgula ou ponto
    const cleaned = value.replace(/[^\d.,]/g, '');
    // Substitui vírgula por ponto para conversão
    const normalized = cleaned.replace(',', '.');
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleValorChangeLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = parseValorInput(e.target.value);
    setFormData(prev => ({ ...prev, valor: numericValue }));
  };

  return (
    <>
      {/* Main Transaction Form Modal */}
      {mostrarPopup && (
        <>
          {/* Backdrop com blur */}
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50" onClick={fecharPopup} />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-xl font-semibold text-gray-900">
                  {transactionEditando ? 'Editar Transação' : 'Nova Transação'}
                </h3>
                <button
                  onClick={fecharPopup}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Formulário - Container com scroll */}
              <div className="flex-1 overflow-y-auto">
                <form id="transaction-form" onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <input
                      type="text"
                      value={formData.descricao}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Supermercado, Salário, etc."
                      required
                    />
                  </div>

                  {/* Tipo e Valor na mesma linha */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Tipo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo
                      </label>
                      <select
                        value={formData.tipo}
                        onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as 'entrada' | 'saida' | 'transferencia' }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="saida">Saída</option>
                        <option value="entrada">Entrada</option>
                        <option value="transferencia">Transferência</option>
                      </select>
                    </div>

                    {/* Valor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valor (R$)
                      </label>
                      <input
                        type="text"
                        value={formatarValorDisplay(formData.valor)}
                        onChange={handleValorChangeLocal}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0,00"
                        required
                      />
                    </div>
                  </div>

                  {/* Data e Conta na mesma linha */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Data */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data
                      </label>
                      <input
                        type="date"
                        value={formData.data}
                        onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Conta */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Conta/Cartão
                      </label>
                      <select
                        value={formData.account || formData.credit_card || ''}
                        onChange={(e) => {
                          const selectedId = parseInt(e.target.value);
                          if (!selectedId) {
                            setFormData(prev => ({ ...prev, account: undefined, credit_card: undefined }));
                            return;
                          }
                          const isAccount = accounts.some(acc => acc.id === selectedId);
                          if (isAccount) {
                            setFormData(prev => ({ ...prev, account: selectedId, credit_card: undefined }));
                          } else {
                            setFormData(prev => ({ ...prev, credit_card: selectedId, account: undefined }));
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Selecione uma conta</option>
                        <optgroup label="Contas">
                          {accounts.map((account) => (
                            <option key={`account-${account.id}`} value={account.id}>
                              {account.nome}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Cartões de Crédito">
                          {creditCards.map((card) => (
                            <option key={`card-${card.id}`} value={card.id}>
                              {card.nome}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  {/* Categoria */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <CategorySelector
                      value={formData.category}
                      onChange={(categoryId) => setFormData(prev => ({ ...prev, category: categoryId }))}
                      placeholder="Selecione uma categoria"
                      showHierarchy={true}
                      className="w-full"
                    />
                  </div>

                  {/* Status da Transação */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="status"
                          checked={formData.confirmada === true}
                          onChange={() => setFormData(prev => ({ ...prev, confirmada: true }))}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-green-700">✅ Confirmada</div>
                          <div className="text-xs text-gray-500">Já realizada</div>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="status"
                          checked={formData.confirmada === false}
                          onChange={() => setFormData(prev => ({ ...prev, confirmada: false }))}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-orange-700">⏳ Pendente</div>
                          <div className="text-xs text-gray-500">Planejada</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Parcelas - apenas se necessário */}
                  {formData.total_parcelas > 1 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Parcelas
                      </label>
                      <select
                        value={formData.total_parcelas}
                        onChange={(e) => setFormData(prev => ({ ...prev, total_parcelas: parseInt(e.target.value) || 1 }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={1}>À vista (1x)</option>
                        {Array.from({ length: 24 }, (_, i) => i + 2).map(num => (
                          <option key={num} value={num}>
                            {num}x de {formatarValorDisplay(formData.valor / num)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Configurações Avançadas - colapsível */}
                  <div className="border-t border-gray-200 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsRecorrente(!isRecorrente)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        Configurações Avançadas
                      </span>
                      <span className="text-gray-400">
                        {isRecorrente ? '▼' : '▶'}
                      </span>
                    </button>
                    
                    {isRecorrente && (
                      <div className="mt-4 space-y-4">
                        {/* Recorrência */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Recorrência
                          </label>
                          <select
                            value={formData.tipo_recorrencia}
                            onChange={(e) => setFormData(prev => ({ ...prev, tipo_recorrencia: e.target.value as any }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="nenhuma">Nenhuma</option>
                            <option value="mensal">Mensal</option>
                            <option value="semanal">Semanal</option>
                            <option value="anual">Anual</option>
                          </select>
                        </div>

                        {/* Parcelas */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Parcelamento
                          </label>
                          <select
                            value={formData.total_parcelas}
                            onChange={(e) => setFormData(prev => ({ ...prev, total_parcelas: parseInt(e.target.value) || 1 }))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value={1}>À vista (1x)</option>
                            {Array.from({ length: 24 }, (_, i) => i + 2).map(num => (
                              <option key={num} value={num}>
                                {num}x de {formatarValorDisplay(formData.valor / num)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </form>
              </div>

              {/* Botões - Fixos na parte inferior */}
              <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0 rounded-b-xl">
                <button
                  type="button"
                  onClick={fecharPopup}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="transaction-form"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  {transactionEditando ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bulk Edit Modal */}
      {showBulkEditModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40" onClick={closeBulkEditModal} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Editar {bulkEditField === 'descricao' ? 'Descrição' : 
                          bulkEditField === 'valor' ? 'Valor' :
                          bulkEditField === 'data' ? 'Data' :
                          bulkEditField === 'category' ? 'Categoria' :
                          bulkEditField === 'account' ? 'Conta' : 'Campo'} em Lote
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  Esta ação irá alterar {selectedTransactions.size} transação(ões) selecionada(s).
                </p>

                <div className="mb-4">
                  {bulkEditField === 'descricao' && (
                    <input
                      type="text"
                      value={bulkEditValue}
                      onChange={(e) => setBulkEditValue(e.target.value)}
                      placeholder="Nova descrição"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  
                  {bulkEditField === 'valor' && (
                    <input
                      type="text"
                      value={bulkEditValue}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        // Remove tudo que não é número, vírgula ou ponto
                        const cleanValue = inputValue.replace(/[^\d.,]/g, '');
                        setBulkEditValue(cleanValue);
                      }}
                      placeholder="Novo valor (ex: 150,00)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  
                  {bulkEditField === 'data' && (
                    <input
                      type="date"
                      value={bulkEditValue}
                      onChange={(e) => setBulkEditValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  
                  {bulkEditField === 'category' && (
                    <select
                      value={bulkEditValue}
                      onChange={(e) => setBulkEditValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione uma categoria...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nome}
                        </option>
                      ))}
                    </select>
                  )}
                  
                  {bulkEditField === 'account' && (
                    <select
                      value={bulkEditValue}
                      onChange={(e) => setBulkEditValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione uma conta...</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.nome}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={closeBulkEditModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={bulkEditTransactions}
                    disabled={!bulkEditValue}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* New Transaction Modal */}
      <TransactionFormNew
        isOpen={mostrarNovoModal}
        onClose={() => setMostrarNovoModal(false)}
        onSuccess={() => {
          carregarDados(); // Recarregar dados após sucesso
        }}
      />
    </>
  );
};

export default TransactionModals;