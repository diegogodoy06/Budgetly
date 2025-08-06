import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { CreditCard, CreditCardFormData, CreditCardBrand } from '@/types';
import { CREDIT_CARD_BRANDS, getBrandColor } from '@/utils/creditCardBrands';
import { formatCurrencyInput, parseCurrencyInput } from '@/utils/currencyUtils';

interface CreditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CreditCardFormData) => Promise<void>;
  editingCard?: CreditCard | null;
}

const CreditCardModal: React.FC<CreditCardModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingCard
}) => {
  const [formData, setFormData] = useState<CreditCardFormData>({
    nome: '',
    bandeira: 'Visa',
    ultimos_4_digitos: '',
    dia_vencimento: 1,
    dia_fechamento: 1,
    limite: 0,
    cor: 'bg-blue-600'
  });

  useEffect(() => {
    if (editingCard) {
      setFormData({
        nome: editingCard.nome,
        bandeira: editingCard.bandeira,
        ultimos_4_digitos: editingCard.ultimos_4_digitos,
        dia_vencimento: editingCard.dia_vencimento,
        dia_fechamento: editingCard.dia_fechamento,
        limite: parseFloat(editingCard.limite),
        cor: getBrandColor(editingCard.bandeira)
      });
    } else {
      setFormData({
        nome: '',
        bandeira: 'Visa',
        ultimos_4_digitos: '',
        dia_vencimento: 1,
        dia_fechamento: 1,
        limite: 0,
        cor: 'bg-blue-600'
      });
    }
  }, [editingCard, isOpen]);

  // Atualizar cor automaticamente quando bandeira mudar
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      cor: getBrandColor(prev.bandeira)
    }));
  }, [formData.bandeira]);

  const handleLimiteChange = (value: string) => {
    const parsedValue = parseCurrencyInput(value);
    setFormData({ ...formData, limite: parsedValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dadosParaEnviar = {
      ...formData,
      cor: getBrandColor(formData.bandeira)
    };
    
    await onSubmit(dadosParaEnviar);
  };

  // Bloquear scroll quando modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop com blur */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingCard ? 'Editar Cartão' : 'Novo Cartão'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Formulário - Container com scroll */}
          <div className="flex-1 overflow-y-auto">
            <form id="credit-card-form" onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
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
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">R$</span>
                    <input
                      type="text"
                      value={formatCurrencyInput(formData.limite)}
                      onChange={(e) => handleLimiteChange(e.target.value)}
                      placeholder="0,00"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Botões - Fixos na parte inferior */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="credit-card-form"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              {editingCard ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreditCardModal;