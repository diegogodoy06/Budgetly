import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  CreditCardIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { creditCardsAPI } from '@/services/api';
import type { CreditCard, CreditCardFormData, CreditCardBrand } from '@/types';
import toast from 'react-hot-toast';

const CREDIT_CARD_BRANDS: { value: CreditCardBrand; label: string }[] = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'american_express', label: 'American Express' },
  { value: 'elo', label: 'Elo' },
  { value: 'hipercard', label: 'Hipercard' },
  { value: 'diners', label: 'Diners Club' },
  { value: 'discover', label: 'Discover' },
  { value: 'jcb', label: 'JCB' },
  { value: 'aura', label: 'Aura' },
  { value: 'sorocred', label: 'Sorocred' },
  { value: 'cabal', label: 'Cabal' },
  { value: 'outro', label: 'Outro' }
];

const CORES_DISPONIVEIS = [
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
  'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-gray-500',
  'bg-orange-500', 'bg-teal-500', 'bg-cyan-500', 'bg-emerald-500'
];

const CreditCards: React.FC = () => {
  const [cartoes, setCartoes] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCartao, setEditingCartao] = useState<CreditCard | null>(null);
  const [formData, setFormData] = useState<CreditCardFormData>({
    nome: '',
    bandeira: 'visa',
    ultimos_4_digitos: '',
    dia_vencimento: 1,
    dia_fechamento: 1,
    limite: 0,
    cor: 'bg-blue-500'
  });

  useEffect(() => {
    carregarCartoes();
  }, []);

  const carregarCartoes = async () => {
    try {
      setLoading(true);
      const data = await creditCardsAPI.getAll();
      setCartoes(data);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
      toast.error('Erro ao carregar cartões de crédito');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCartao) {
        const cartaoAtualizado = await creditCardsAPI.update(editingCartao.id, formData);
        setCartoes(cartoes.map(c => c.id === editingCartao.id ? cartaoAtualizado : c));
        toast.success('Cartão atualizado com sucesso!');
      } else {
        const novoCartao = await creditCardsAPI.create(formData);
        setCartoes([...cartoes, novoCartao]);
        toast.success('Cartão criado com sucesso!');
      }
      
      handleCloseModal();
    } catch (error: any) {
      console.error('Erro ao salvar cartão:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao salvar cartão';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (cartao: CreditCard) => {
    setEditingCartao(cartao);
    setFormData({
      nome: cartao.nome,
      bandeira: cartao.bandeira,
      ultimos_4_digitos: cartao.ultimos_4_digitos,
      dia_vencimento: cartao.dia_vencimento,
      dia_fechamento: cartao.dia_fechamento,
      limite: parseFloat(cartao.limite),
      cor: cartao.cor
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este cartão?')) {
      return;
    }

    try {
      await creditCardsAPI.delete(id);
      setCartoes(cartoes.filter(c => c.id !== id));
      toast.success('Cartão excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir cartão:', error);
      toast.error('Erro ao excluir cartão');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCartao(null);
    setFormData({
      nome: '',
      bandeira: 'visa',
      ultimos_4_digitos: '',
      dia_vencimento: 1,
      dia_fechamento: 1,
      limite: 0,
      cor: 'bg-blue-500'
    });
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const getPercentualCor = (percentual: number) => {
    if (percentual >= 90) return 'text-red-500';
    if (percentual >= 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cartões de Crédito</h1>
          <p className="text-gray-600">Gerencie seus cartões de crédito</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Novo Cartão
        </button>
      </div>

      {/* Grid de Cartões */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cartoes.map((cartao) => (
          <div key={cartao.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Card Visual */}
            <div className={`${cartao.cor} rounded-lg p-4 mb-4 text-white relative`}>
              <div className="flex justify-between items-start mb-3">
                <CreditCardIcon className="h-8 w-8" />
                <div className="text-right">
                  <div className="text-xs opacity-75">Bandeira</div>
                  <div className="text-sm font-medium">{cartao.bandeira_display}</div>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-xs opacity-75 mb-1">Nome do Portador</div>
                <div className="text-sm font-medium truncate">{cartao.nome}</div>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs opacity-75">Final</div>
                  <div className="text-lg font-mono">**** {cartao.ultimos_4_digitos}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-75">Vencimento</div>
                  <div className="text-sm">{cartao.dia_vencimento.toString().padStart(2, '0')}</div>
                </div>
              </div>
            </div>

            {/* Informações do Cartão */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Limite</span>
                <span className="font-medium">{formatCurrency(cartao.limite)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Usado</span>
                <span className="font-medium">{formatCurrency(cartao.saldo_atual)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Disponível</span>
                <span className="font-medium text-green-600">{formatCurrency(cartao.disponivel)}</span>
              </div>

              {/* Barra de Progresso */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Utilização</span>
                  <span className={getPercentualCor(cartao.percentual_usado)}>
                    {cartao.percentual_usado.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      cartao.percentual_usado >= 90 ? 'bg-red-500' :
                      cartao.percentual_usado >= 70 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(cartao.percentual_usado, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Dias */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Fechamento:</span>
                  <span className="ml-1 font-medium">Dia {cartao.dia_fechamento}</span>
                </div>
                <div>
                  <span className="text-gray-500">Vencimento:</span>
                  <span className="ml-1 font-medium">Dia {cartao.dia_vencimento}</span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  onClick={() => handleEdit(cartao)}
                  className="text-blue-600 hover:text-blue-700 p-1"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(cartao.id)}
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estado Vazio */}
      {cartoes.length === 0 && (
        <div className="text-center py-12">
          <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cartão encontrado</h3>
          <p className="text-gray-600 mb-4">Adicione seu primeiro cartão de crédito para começar</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Adicionar Cartão
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingCartao ? 'Editar Cartão' : 'Novo Cartão'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Cartão
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bandeira
                  </label>
                  <select
                    value={formData.bandeira}
                    onChange={(e) => setFormData({...formData, bandeira: e.target.value as CreditCardBrand})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    {CREDIT_CARD_BRANDS.map(brand => (
                      <option key={brand.value} value={brand.value}>
                        {brand.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Últimos 4 Dígitos
                  </label>
                  <input
                    type="text"
                    value={formData.ultimos_4_digitos}
                    onChange={(e) => setFormData({...formData, ultimos_4_digitos: e.target.value})}
                    maxLength={4}
                    pattern="[0-9]{4}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dia Vencimento
                    </label>
                    <select
                      value={formData.dia_vencimento}
                      onChange={(e) => setFormData({...formData, dia_vencimento: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dia Fechamento
                    </label>
                    <select
                      value={formData.dia_fechamento}
                      onChange={(e) => setFormData({...formData, dia_fechamento: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Limite
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.limite}
                    onChange={(e) => setFormData({...formData, limite: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {CORES_DISPONIVEIS.map((cor) => (
                      <button
                        key={cor}
                        type="button"
                        onClick={() => setFormData({...formData, cor})}
                        className={`w-8 h-8 rounded ${cor} ${
                          formData.cor === cor ? 'ring-2 ring-gray-800' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    {editingCartao ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditCards;
