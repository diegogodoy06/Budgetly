import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { XMarkIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { transactionsAPI, accountsAPI, creditCardsAPI, invoicesAPI } from '../services/api';
import CategorySearchSelect from './CategorySearchSelect';
import BeneficiarySearchSelect from './BeneficiarySearchSelect';
import type { Account, CreditCard, CreditCardInvoice } from '../types';
import toast from 'react-hot-toast';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface TransactionFormData {
  tipo: 'entrada' | 'saida' | 'transferencia';
  tipoPagamento: 'conta' | 'cartao';
  account?: number;
  to_account?: number;
  credit_card?: number;
  valor: number;
  descricao: string;
  data: string;
  category?: number;
  beneficiario?: number;
  total_parcelas: number;
  tipo_recorrencia: 'nenhuma' | 'diaria' | 'semanal' | 'mensal' | 'anual';
  data_fim_recorrencia?: string;
  confirmada: boolean;
}

const TransactionFormNew: React.FC<TransactionFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [invoices, setInvoices] = useState<CreditCardInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [bestPurchaseDate, setBestPurchaseDate] = useState<string>('');

  // Funções para formatação de valor
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
  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<TransactionFormData>({
    defaultValues: {
      tipo: 'saida',
      tipoPagamento: 'conta',
      valor: 0,
      descricao: '',
      data: new Date().toISOString().split('T')[0],
      total_parcelas: 1,
      tipo_recorrencia: 'nenhuma',
      confirmada: true
    }
  });

  const tipo = watch('tipo');
  const tipoPagamento = watch('tipoPagamento');
  const selectedCreditCard = watch('credit_card');
  const transactionDate = watch('data');

  // Função para calcular a melhor data de compra baseada no cartão
  const calculateBestPurchaseDate = (card: CreditCard): string => {
    if (!card) return '';
    
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Se hoje é antes do fechamento, a melhor data é hoje
    if (currentDay < card.dia_fechamento) {
      return today.toISOString().split('T')[0];
    }
    
    // Se já passou do fechamento, sugere comprar no próximo período da fatura
    // Para maximizar o tempo até o vencimento
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    
    // Sugerir uma data logo após o fechamento anterior (próxima fatura)
    const nextInvoiceStart = new Date(nextYear, nextMonth, card.dia_fechamento + 1);
    
    return nextInvoiceStart.toISOString().split('T')[0];
  };

  // Função para verificar se uma data está em uma fatura fechada
  const isInvoiceClosed = (date: string, card: CreditCard): boolean => {
    if (!card || !date) return false;
    
    const transactionDate = new Date(date);
    const transactionMonth = transactionDate.getMonth() + 1;
    const transactionYear = transactionDate.getFullYear();
    
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();
    
    // Se a transação é de um mês passado, a fatura certamente está fechada
    if (transactionYear < currentYear || 
       (transactionYear === currentYear && transactionMonth < currentMonth)) {
      return true;
    }
    
    // Se é o mês atual, verifica se já passou do dia de fechamento
    if (transactionYear === currentYear && transactionMonth === currentMonth) {
      return currentDay > card.dia_fechamento;
    }
    
    // Se é mês futuro, ainda não fechou
    return false;
  };

  // Effect para calcular a melhor data quando o cartão é selecionado
  useEffect(() => {
    if (selectedCreditCard && tipoPagamento === 'cartao') {
      const card = creditCards.find(c => c.id === Number(selectedCreditCard));
      if (card) {
        // Usar a nova API para obter a melhor data
        invoicesAPI.getBestPurchaseDate(Number(selectedCreditCard))
          .then((data) => {
            setBestPurchaseDate(data.best_date_formatted);
            
            // Se não tem data selecionada, sugerir a melhor data
            if (!transactionDate) {
              setValue('data', data.best_date);
            }
          })
          .catch((error) => {
            console.error('Erro ao calcular melhor data:', error);
            // Fallback para cálculo local
            const bestDate = calculateBestPurchaseDate(card);
            setBestPurchaseDate(bestDate);
          });
      }
    }
  }, [selectedCreditCard, tipoPagamento, creditCards, setValue]);

  // Effect para validar a data quando ela muda
  useEffect(() => {
    if (selectedCreditCard && tipoPagamento === 'cartao' && transactionDate) {
      // Validar se a data é válida para este cartão
      invoicesAPI.validateDate(Number(selectedCreditCard), transactionDate)
        .then((validation) => {
          if (!validation.valid) {
            toast.error(`❌ ${validation.message}`);
          }
        })
        .catch((error) => {
          console.error('Erro na validação da data:', error);
        });
    }
  }, [selectedCreditCard, tipoPagamento, transactionDate]);

  // Effect para carregar as faturas quando selecionar um cartão
  useEffect(() => {
    if (selectedCreditCard && tipoPagamento === 'cartao') {
      setLoadingInvoices(true);
      invoicesAPI.getByCard(Number(selectedCreditCard))
        .then((data: CreditCardInvoice[]) => {
          setInvoices(data || []);
        })
        .catch((error: any) => {
          console.error('Erro ao carregar faturas:', error);
        })
        .finally(() => {
          setLoadingInvoices(false);
        });
    }
  }, [selectedCreditCard, tipoPagamento]);

  useEffect(() => {
    if (isOpen) {
      loadData();
      
      // Adicionar listeners para teclas de atalho
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          // Submeter o formulário programaticamente
          const form = document.querySelector('form');
          if (form) {
            form.requestSubmit();
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const loadData = async () => {
    try {
      const [accountsRes, creditCardsRes] = await Promise.all([
        accountsAPI.getAll(),
        creditCardsAPI.getAll()
      ]);

      setAccounts(accountsRes || []);
      setCreditCards(creditCardsRes || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do formulário');
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    setLoading(true);
    try {
      // Validação especial para cartões de crédito usando a nova API
      if (data.tipoPagamento === 'cartao' && data.credit_card) {
        try {
          const validation = await invoicesAPI.validateDate(data.credit_card, data.data);
          if (!validation.valid) {
            toast.error(`❌ ${validation.message}`);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Erro na validação da data:', error);
          // Continuar com a validação local como fallback
          const card = creditCards.find(c => c.id === data.credit_card);
          if (card && isInvoiceClosed(data.data, card)) {
            toast.error('❌ Não é possível lançar transações em faturas fechadas! Escolha uma data futura ou use uma conta bancária.');
            setLoading(false);
            return;
          }
        }
      }

      const payload: any = {
        tipo: data.tipo,
        valor: data.valor,
        descricao: data.descricao,
        data: data.data,
        category: data.category,
        total_parcelas: data.tipoPagamento === 'cartao' ? data.total_parcelas : 1,
        tipo_recorrencia: data.tipo_recorrencia,
        data_fim_recorrencia: data.data_fim_recorrencia,
        confirmada: data.confirmada
      };

      // Para entrada/saída, não enviar beneficiário (será auto-criado)
      // Para transferência, também não enviar beneficiário (será auto-criado)
      
      // Configurar conta ou cartão baseado no tipo de pagamento
      if (data.tipo === 'transferencia') {
        payload.account = data.account;
        payload.to_account = data.to_account;
        // Transferência sempre confirmada (não pode estar pendente)
        payload.confirmada = true;
      } else if (data.tipoPagamento === 'conta') {
        payload.account = data.account;
      } else if (data.tipoPagamento === 'cartao') {
        payload.credit_card = data.credit_card;
        // Transações de cartão ficam pendentes até fechamento da fatura
        payload.confirmada = false;
      }

      await transactionsAPI.create(payload);
      
      toast.success('✅ Transação criada com sucesso!');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao criar transação:', error);
      const errorMessage = error.response?.data?.detail || 'Erro ao criar transação';
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | string): string => {
    const num = Number(value) || 0;
    return num.toFixed(2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out scale-100 animate-in fade-in-0 zoom-in-95">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Nova Transação</h2>
              <p className="text-sm text-gray-600">Registre uma nova movimentação financeira</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white hover:bg-opacity-80 rounded-lg transition-colors"
            aria-label="Fechar modal"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Tipo de Transação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Transação <span className="text-red-500">*</span>
            </label>
            <Controller
              name="tipo"
              control={control}
              rules={{ required: 'Tipo é obrigatório' }}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'entrada', label: 'Entrada', color: 'green' },
                    { value: 'saida', label: 'Saída', color: 'red' },
                    { value: 'transferencia', label: 'Transferência', color: 'blue' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        field.onChange(option.value);
                        if (option.value === 'transferencia') {
                          setValue('tipoPagamento', 'conta');
                        }
                      }}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                        field.value === option.value
                          ? `border-${option.color}-500 bg-${option.color}-50 text-${option.color}-700`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            />
            {errors.tipo && (
              <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>
            )}
          </div>

          {/* Tipo de Pagamento (apenas se não for transferência) */}
          {tipo !== 'transferencia' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Método de Pagamento
              </label>
              <Controller
                name="tipoPagamento"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => field.onChange('conta')}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                        field.value === 'conta'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Conta Bancária
                    </button>
                    <button
                      type="button"
                      onClick={() => field.onChange('cartao')}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                        field.value === 'cartao'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      Cartão de Crédito
                    </button>
                  </div>
                )}
              />
            </div>
          )}

          {/* Seleção de Contas/Cartões */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Conta de Origem ou Única */}
            {(tipo === 'transferencia' || tipoPagamento === 'conta') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {tipo === 'transferencia' ? 'Conta de Origem' : 'Conta'} <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="account"
                  control={control}
                  rules={{ required: 'Conta é obrigatória' }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione uma conta</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.nome} - R$ {formatCurrency(account.saldo_atual)}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.account && (
                  <p className="mt-1 text-sm text-red-600">{errors.account.message}</p>
                )}
              </div>
            )}

            {/* Conta de Destino (apenas para transferência) */}
            {tipo === 'transferencia' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conta de Destino <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="to_account"
                  control={control}
                  rules={{ 
                    required: 'Conta de destino é obrigatória',
                    validate: (value) => {
                      const accountOrigemId = watch('account');
                      if (value && accountOrigemId && Number(value) === Number(accountOrigemId)) {
                        return 'Conta de destino deve ser diferente da conta de origem';
                      }
                      return true;
                    }
                  }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione uma conta</option>
                      {accounts.map((account) => {
                        const isOriginAccount = Number(account.id) === Number(watch('account'));
                        return (
                          <option 
                            key={account.id} 
                            value={account.id}
                            disabled={isOriginAccount}
                            style={isOriginAccount ? { color: '#9CA3AF' } : {}}
                          >
                            {account.nome} - R$ {formatCurrency(account.saldo_atual)}
                            {isOriginAccount ? ' (Conta de origem)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  )}
                />
                {errors.to_account && (
                  <p className="mt-1 text-sm text-red-600">{errors.to_account.message}</p>
                )}
              </div>
            )}

            {/* Cartão de Crédito */}
            {tipoPagamento === 'cartao' && tipo !== 'transferencia' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cartão de Crédito <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="credit_card"
                  control={control}
                  rules={{ required: 'Cartão é obrigatório' }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecione um cartão</option>
                      {creditCards.map((card) => (
                        <option key={card.id} value={card.id}>
                          {card.nome} - Disponível: R$ {formatCurrency(card.disponivel)}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.credit_card && (
                  <p className="mt-1 text-sm text-red-600">{errors.credit_card.message}</p>
                )}
                
                {/* Informações da Fatura */}
                {selectedCreditCard && bestPurchaseDate && (
                  <div className="mt-4 p-5 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <CurrencyDollarIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-blue-800">Informações da Fatura</span>
                        <p className="text-xs text-blue-600">Dados do cartão selecionado</p>
                      </div>
                    </div>
                    
                    {(() => {
                      const card = creditCards.find(c => c.id === Number(selectedCreditCard));
                      if (!card) return null;
                      
                      const today = new Date();
                      const currentDay = today.getDate();
                      const selectedDate = new Date(transactionDate || today);
                      const selectedDay = selectedDate.getDate();
                      
                      // Calcular qual fatura a transação vai aparecer
                      const transactionMonth = selectedDate.getMonth() + 1;
                      const transactionYear = selectedDate.getFullYear();
                      
                      let invoiceMonth = transactionMonth;
                      let invoiceYear = transactionYear;
                      
                      // Se a compra é após o fechamento, vai para a fatura do próximo mês
                      if (selectedDay > card.dia_fechamento) {
                        invoiceMonth = transactionMonth === 12 ? 1 : transactionMonth + 1;
                        invoiceYear = transactionMonth === 12 ? transactionYear + 1 : transactionYear;
                      }
                      
                      const isCurrentMonth = today.getMonth() + 1 === transactionMonth && today.getFullYear() === transactionYear;
                      const isBeforeClosing = isCurrentMonth && currentDay < card.dia_fechamento;
                      const invoiceClosed = isInvoiceClosed(transactionDate || today.toISOString().split('T')[0], card);
                      
                      return (
                        <div className="space-y-3">
                          {/* Informações básicas do cartão */}
                          <div className="text-xs text-blue-700 space-y-1">
                            <div className="flex items-center justify-between">
                              <span>Fechamento:</span>
                              <span className="font-medium">dia {card.dia_fechamento}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Vencimento:</span>
                              <span className="font-medium">dia {card.dia_vencimento}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Fatura de destino:</span>
                              <span className="font-medium bg-blue-100 px-2 py-0.5 rounded">
                                {invoiceMonth.toString().padStart(2, '0')}/{invoiceYear}
                              </span>
                            </div>
                          </div>
                          
                          <div className="border-t border-blue-200 pt-2">
                            {/* Status da fatura */}
                            {invoiceClosed ? (
                              <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
                                <span className="text-red-600">⚠️</span>
                                <div className="text-xs text-red-700">
                                  <div className="font-medium">Fatura fechada!</div>
                                  <div>Não é possível lançar transações em faturas fechadas</div>
                                </div>
                              </div>
                            ) : isBeforeClosing ? (
                              <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                                <span className="text-green-600">✅</span>
                                <div className="text-xs text-green-700">
                                  <div className="font-medium">Fatura aberta</div>
                                  <div>Você pode comprar até dia {card.dia_fechamento - 1} para esta fatura</div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded">
                                <span className="text-orange-600">📅</span>
                                <div className="text-xs text-orange-700">
                                  <div className="font-medium">Próxima fatura</div>
                                  <div>Compra será incluída na fatura {invoiceMonth.toString().padStart(2, '0')}/{invoiceYear}</div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Dica da melhor data */}
                          <div className="border-t border-blue-200 pt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-500">💡</span>
                              <div className="text-xs text-blue-600">
                                <span className="font-medium">Melhor data sugerida: </span>
                                <span className="bg-blue-100 px-2 py-0.5 rounded">
                                  {new Date(bestPurchaseDate).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-blue-500 mt-1 ml-6">
                              Maximiza o tempo até o vencimento da fatura
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor <span className="text-red-500">*</span>
              </label>
              <Controller
                name="valor"
                control={control}
                rules={{ 
                  required: 'Valor é obrigatório',
                  min: { value: 0.01, message: 'Valor deve ser maior que zero' }
                }}
                render={({ field }) => (
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formatarValorDisplay(field.value)}
                      onChange={(e) => {
                        const numericValue = parseValorInput(e.target.value);
                        field.onChange(numericValue);
                      }}
                      placeholder="0,00"
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 transition-colors ${
                        errors.valor 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : field.value && field.value > 0
                          ? 'border-green-300 focus:border-blue-500 focus:ring-blue-200' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                    />
                    {field.value && field.value > 0 && !errors.valor && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-green-500 text-sm">✓</span>
                      </div>
                    )}
                  </div>
                )}
              />
              {errors.valor ? (
                <p className="mt-1 text-sm text-red-600">{errors.valor.message}</p>
              ) : watch('valor') && watch('valor') > 0 ? (
                <p className="mt-1 text-sm text-green-600">✓ Valor válido</p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data <span className="text-red-500">*</span>
                {tipoPagamento === 'cartao' && bestPurchaseDate && (
                  <button
                    type="button"
                    onClick={() => setValue('data', bestPurchaseDate)}
                    className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline bg-blue-50 px-2 py-1 rounded"
                    title="Usar melhor data sugerida"
                  >
                    💡 usar melhor data
                  </button>
                )}
              </label>
              <Controller
                name="data"
                control={control}
                rules={{ required: 'Data é obrigatória' }}
                render={({ field }) => (
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...field}
                      type="date"
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 transition-colors ${
                        errors.data 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                          : field.value
                          ? 'border-green-300 focus:border-blue-500 focus:ring-blue-200' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                      }`}
                    />
                    {field.value && !errors.data && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <span className="text-green-500 text-sm">✓</span>
                      </div>
                    )}
                  </div>
                )}
              />
              {errors.data ? (
                <p className="mt-1 text-sm text-red-600">{errors.data.message}</p>
              ) : watch('data') ? (
                <p className="mt-1 text-sm text-green-600">✓ Data válida</p>
              ) : null}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição <span className="text-red-500">*</span>
            </label>
            <Controller
              name="descricao"
              control={control}
              rules={{ 
                required: 'Descrição é obrigatória',
                maxLength: { value: 200, message: 'Descrição deve ter no máximo 200 caracteres' }
              }}
              render={({ field }) => (
                <div>
                  <input
                    {...field}
                    type="text"
                    placeholder="Descrição da transação"
                    maxLength={200}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.descricao 
                        ? 'border-red-300 focus:border-red-500' 
                        : field.value 
                        ? 'border-green-300 focus:border-blue-500' 
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    <div>
                      {errors.descricao && (
                        <p className="text-sm text-red-600">{errors.descricao.message}</p>
                      )}
                      {!errors.descricao && field.value && field.value.length > 0 && (
                        <p className="text-sm text-green-600">✓ Descrição válida</p>
                      )}
                    </div>
                    <div className={`text-xs ${
                      field.value?.length > 180 ? 'text-orange-600' : 
                      field.value?.length > 150 ? 'text-yellow-600' : 'text-gray-500'
                    }`}>
                      {field.value?.length || 0}/200 caracteres
                    </div>
                  </div>
                </div>
              )}
            />
          </div>

          {/* Categoria e Informações Automáticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <CategorySearchSelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Digite para buscar categoria..."
                  />
                )}
              />
            </div>

            {/* Campo de beneficiário para saída */}
            {tipo === 'saida' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beneficiário
                </label>
                <Controller
                  name="beneficiario"
                  control={control}
                  render={({ field }) => (
                    <BeneficiarySearchSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Digite o nome do beneficiário..."
                      allowCreate={true}
                    />
                  )}
                />
              </div>
            )}

            {/* Informação sobre beneficiário automático para outros tipos */}
            {tipo !== 'saida' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beneficiário
                </label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-600">
                  {tipo === 'transferencia' 
                    ? 'Será criado automaticamente para as contas envolvidas'
                    : tipo === 'entrada'
                    ? 'Será definido automaticamente como a conta que recebe'
                    : 'Será definido automaticamente como a conta/cartão usado'
                  }
                </div>
              </div>
            )}
          </div>

          {/* Parcelas (apenas para cartão) */}
          {tipoPagamento === 'cartao' && tipo !== 'transferencia' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Parcelas
              </label>
              <Controller
                name="total_parcelas"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num}x {num > 1 && `- R$ ${(watch('valor') / num).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} por parcela`}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
          )}

          {/* Status da Transação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Status da Transação
            </label>
            <Controller
              name="confirmada"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  {/* Aviso para cartão de crédito e transferência */}
                  {(tipoPagamento === 'cartao' || tipo === 'transferencia') && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">ℹ️</span>
                        <span className="text-sm text-blue-700 font-medium">
                          {tipoPagamento === 'cartao' 
                            ? 'Transações de cartão ficam pendentes até fechamento da fatura'
                            : 'Transferências são sempre confirmadas'
                          }
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        {tipoPagamento === 'cartao'
                          ? 'A transação será confirmada automaticamente quando a fatura for fechada'
                          : 'A transferência movimenta os saldos imediatamente'
                        }
                      </p>
                    </div>
                  )}
                  
                  {/* Opções de status (apenas para contas bancárias) */}
                  {tipoPagamento !== 'cartao' && tipo !== 'transferencia' && (
                    <>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={field.value === true}
                          onChange={() => field.onChange(true)}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <span className="ml-3 text-sm text-gray-900">
                          <span className="font-medium text-green-600">✅ Transação Confirmada</span>
                          <span className="block text-xs text-gray-500">
                            A movimentação já foi realizada e afeta o saldo atual
                          </span>
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          checked={field.value === false}
                          onChange={() => field.onChange(false)}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                        />
                        <span className="ml-3 text-sm text-gray-900">
                          <span className="font-medium text-orange-600">⏳ Lançamento Futuro</span>
                          <span className="block text-xs text-gray-500">
                            Previsto/planejado, não afeta o saldo atual
                          </span>
                        </span>
                      </label>
                    </>
                  )}
                  
                  {/* Status automático para cartão e transferência */}
                  {(tipoPagamento === 'cartao' || tipo === 'transferencia') && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✅</span>
                        <span className="text-sm text-green-700 font-medium">
                          Status: Confirmada
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 bg-gray-50 -m-6 mt-6 p-6 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
              title="Cancelar (Esc)"
            >
              Cancelar
              <span className="ml-2 text-xs text-gray-500">Esc</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
              title="Salvar transação (Ctrl+Enter)"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Salvando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CurrencyDollarIcon className="w-4 h-4" />
                  Salvar Transação
                  <span className="ml-2 text-xs text-blue-200">Ctrl+↵</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionFormNew;
