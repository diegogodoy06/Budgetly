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
  const formatCurrency = (value: number | string): string => {
    const num = Number(value) || 0;
    if (num === 0) return '0,00';
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Estado local para controlar a entrada de valor
  const [valorString, setValorString] = React.useState('');

  // Atualiza o valorString quando formData.valor muda externamente
  React.useEffect(() => {
    if (formData.valor === 0) {
      setValorString('');
    } else if (formData.valor && valorString === '') {
      // Converte valor numérico para string de centavos para edição
      const centavos = Math.round(formData.valor * 100);
      setValorString(centavos.toString());
    }
  }, [formData.valor, valorString]);

  // Reset do valorString quando o modal abre/fecha
  React.useEffect(() => {
    if (!mostrarPopup) {
      setValorString('');
    }
  }, [mostrarPopup]);

  // Função para lidar com mudanças no campo de valor (máscara de centavos correta)
  const handleValorChangeLocal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Remove tudo que não é número
    const numericValue = inputValue.replace(/\D/g, '');
    
    // Atualiza o string de trabalho
    setValorString(numericValue);
    
    // Se está vazio, define como 0
    if (!numericValue) {
      setFormData(prev => ({ ...prev, valor: 0 }));
      return;
    }
    
    // Converte para centavos (divide por 100 para ter o valor em reais)
    const valorEmCentavos = parseInt(numericValue, 10);
    const valorEmReais = valorEmCentavos / 100;
    
    // Atualiza o estado
    setFormData(prev => ({ ...prev, valor: valorEmReais }));
  };

  // Função para exibir valor formatado no input
  const getDisplayValue = (): string => {
    if (!valorString) return '';
    
    // Se tem apenas 1 dígito: 0,0X
    if (valorString.length === 1) {
      return `0,0${valorString}`;
    }
    // Se tem 2 dígitos: 0,XY
    else if (valorString.length === 2) {
      return `0,${valorString}`;
    }
    // Se tem 3 ou mais dígitos: XX,YZ ou XXX,YZ etc.
    else {
      const reais = valorString.slice(0, -2);
      const centavos = valorString.slice(-2);
      
      // Adiciona pontos nos milhares
      const reaisFormatados = reais.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      
      return `${reaisFormatados},${centavos}`;
    }
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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
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
                <div className="grid grid-cols-2 gap-6">
                  {/* Descrição */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <input
                      type="text"
                      value={formData.descricao}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Supermercado, Salário, etc."
                      required
                    />
                  </div>

                  {/* Tipo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as 'entrada' | 'saida' | 'transferencia' }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      value={getDisplayValue()}
                      onChange={handleValorChangeLocal}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0,00"
                      required
                    />
                  </div>

                  {/* Data */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data
                    </label>
                    <input
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                  {/* Parcelas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Parcelas
                    </label>
                    <select
                      value={formData.total_parcelas}
                      onChange={(e) => setFormData(prev => ({ ...prev, total_parcelas: parseInt(e.target.value) || 1 }))}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1}>À vista (1x)</option>
                      {Array.from({ length: 24 }, (_, i) => i + 2).map(num => (
                        <option key={num} value={num}>
                          {num}x de {formatCurrency(formData.valor / num)}
                        </option>
                      ))}
                    </select>
                    {formData.total_parcelas > 1 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Primeira parcela será lançada na data selecionada, 
                        demais parcelas nos meses seguintes.
                      </p>
                    )}
                  </div>

                  {/* Espaço para manter o grid */}
                  <div></div>

                  {/* Tipo de Transação - Toggle Recorrente */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Tipo de Lançamento
                    </label>
                    <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
                      <span className={`text-sm font-medium ${!isRecorrente ? 'text-gray-900' : 'text-gray-500'}`}>
                        Transação única
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsRecorrente(!isRecorrente);
                          setFormData(prev => ({ 
                            ...prev, 
                            tipo_recorrencia: !isRecorrente ? 'mensal' : 'nenhuma' 
                          }));
                        }}
                        className={`mx-4 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          isRecorrente ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isRecorrente ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className={`text-sm font-medium ${isRecorrente ? 'text-gray-900' : 'text-gray-500'}`}>
                        Recorrente
                      </span>
                    </div>
                    
                    {isRecorrente && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Frequência da Recorrência
                        </label>
                        <select
                          value={formData.tipo_recorrencia}
                          onChange={(e) => setFormData(prev => ({ ...prev, tipo_recorrencia: e.target.value as any }))}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="mensal">Mensal</option>
                          <option value="semanal">Semanal</option>
                          <option value="anual">Anual</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Será criada automaticamente na frequência selecionada, sempre na mesma data.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </form>
              </div>

              {/* Botões - Fixos na parte inferior */}
              <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                <button
                  type="button"
                  onClick={fecharPopup}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="transaction-form"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeBulkEditModal} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  
                  {bulkEditField === 'data' && (
                    <input
                      type="date"
                      value={bulkEditValue}
                      onChange={(e) => setBulkEditValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                  
                  {bulkEditField === 'category' && (
                    <select
                      value={bulkEditValue}
                      onChange={(e) => setBulkEditValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={bulkEditTransactions}
                    disabled={!bulkEditValue}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
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