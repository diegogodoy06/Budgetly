import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { XMarkIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { transactionsAPI, accountsAPI, creditCardsAPI, categoriesAPI } from '@/services/api';
import { beneficiaryService } from '@/services/beneficiaryService';
import type { Account, CreditCard, Category, Beneficiary } from '@/types';
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
}

const TransactionForm: React.FC<TransactionFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<TransactionFormData>({
    defaultValues: {
      tipo: 'saida',
      tipoPagamento: 'conta',
      valor: 0,
      descricao: '',
      data: new Date().toISOString().split('T')[0],
      total_parcelas: 1,
      tipo_recorrencia: 'nenhuma'
    }
  });

  const tipo = watch('tipo');
  const tipoPagamento = watch('tipoPagamento');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [accountsRes, creditCardsRes, categoriesRes, beneficiariesRes] = await Promise.all([
        accountsAPI.getAll(),
        creditCardsAPI.getAll(),
        categoriesAPI.getAll(),
        beneficiaryService.list()
      ]);

      setAccounts(accountsRes || []);
      setCreditCards(creditCardsRes || []);
      setCategories(categoriesRes || []);
      setBeneficiaries(beneficiariesRes || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do formulário');
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    setLoading(true);
    try {
      const payload: any = {
        tipo: data.tipo,
        valor: data.valor,
        descricao: data.descricao,
        data: data.data,
        category: data.category,
        beneficiario: data.beneficiario,
        total_parcelas: data.tipoPagamento === 'cartao' ? data.total_parcelas : 1,
        tipo_recorrencia: data.tipo_recorrencia,
        data_fim_recorrencia: data.data_fim_recorrencia
      };

      // Configurar conta ou cartão baseado no tipo de pagamento
      if (data.tipo === 'transferencia') {
        payload.account = data.account;
        payload.to_account = data.to_account;
      } else if (data.tipoPagamento === 'conta') {
        payload.account = data.account;
      } else if (data.tipoPagamento === 'cartao') {
        payload.credit_card = data.credit_card;
      }

      await transactionsAPI.create(payload);
      
      toast.success('Transação criada com sucesso!');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erro ao criar transação:', error);
      toast.error(error.response?.data?.detail || 'Erro ao criar transação');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Nova Transação</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Tipo de Transação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Transação
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
                        // Reset tipo de pagamento quando mudar para transferência
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
                  {tipo === 'transferencia' ? 'Conta de Origem' : 'Conta'}
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
                  Conta de Destino
                </label>
                <Controller
                  name="to_account"
                  control={control}
                  rules={{ required: 'Conta de destino é obrigatória' }}
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
                {errors.to_account && (
                  <p className="mt-1 text-sm text-red-600">{errors.to_account.message}</p>
                )}
              </div>
            )}

            {/* Cartão de Crédito */}
            {tipoPagamento === 'cartao' && tipo !== 'transferencia' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cartão de Crédito
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
              </div>
            )}
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor
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
                      {...field}
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0,00"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              />
              {errors.valor && (
                <p className="mt-1 text-sm text-red-600">{errors.valor.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data
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
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              />
              {errors.data && (
                <p className="mt-1 text-sm text-red-600">{errors.data.message}</p>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <Controller
              name="descricao"
              control={control}
              rules={{ required: 'Descrição é obrigatória' }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Descrição da transação"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            />
            {errors.descricao && (
              <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>
            )}
          </div>

          {/* Categoria e Beneficiário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nome}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beneficiário
              </label>
              <Controller
                name="beneficiario"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione um beneficiário</option>
                    {beneficiaries.map((beneficiary) => (
                      <option key={beneficiary.id} value={beneficiary.id}>
                        {beneficiary.nome}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
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
                        {num}x {num > 1 && `- R$ ${(watch('valor') / num).toFixed(2)} por parcela`}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Transação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
