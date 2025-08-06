import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Transaction } from '@/types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transactionData: any) => Promise<void>;
  selectedCardId: number | null;
}

interface TransactionFormData {
  descricao: string;
  valor: number;
  dataCompra: string;
  categoria: string;
  recorrente: boolean;
  tipoRecorrencia: 'mensal' | 'trimestral' | 'semanal' | 'anual';
  confirmada: boolean;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedCardId
}) => {
  const [formData, setFormData] = useState<TransactionFormData>({
    descricao: '',
    valor: 0,
    dataCompra: new Date().toISOString().split('T')[0],
    categoria: '',
    recorrente: false,
    tipoRecorrencia: 'mensal',
    confirmada: true
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        descricao: '',
        valor: 0,
        dataCompra: new Date().toISOString().split('T')[0],
        categoria: '',
        recorrente: false,
        tipoRecorrencia: 'mensal',
        confirmada: true
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const transactionData = {
      credit_card: selectedCardId,
      tipo: 'saida' as const,
      valor: formData.valor,
      descricao: formData.descricao,
      data: formData.dataCompra,
      category: formData.categoria ? parseInt(formData.categoria) : undefined,
      total_parcelas: 1,
      tipo_recorrencia: formData.recorrente ? formData.tipoRecorrencia : 'nenhuma' as const,
      confirmada: formData.confirmada
    };

    await onSubmit(transactionData);
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
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">Nova Transação</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Formulário - Container com scroll */}
          <div className="flex-1 overflow-y-auto">
            <form id="transaction-form" onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Descrição */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Supermercado, Combustível..."
                    required
                  />
                </div>

                {/* Valor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0,00"
                    required
                  />
                </div>

                {/* Data */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data da Compra
                  </label>
                  <input
                    type="date"
                    value={formData.dataCompra}
                    onChange={(e) => setFormData(prev => ({ ...prev, dataCompra: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="1">Alimentação</option>
                    <option value="2">Transporte</option>
                    <option value="3">Moradia</option>
                    <option value="4">Saúde</option>
                    <option value="5">Entretenimento</option>
                    <option value="6">Compras Online</option>
                    <option value="7">Combustível</option>
                    <option value="8">Outros</option>
                  </select>
                </div>

                {/* Recorrente */}
                <div className="col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.recorrente}
                      onChange={(e) => setFormData(prev => ({ ...prev, recorrente: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Transação recorrente</span>
                  </label>
                </div>

                {/* Tipo de Recorrência - só aparece se for recorrente */}
                {formData.recorrente && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Recorrência
                    </label>
                    <select
                      value={formData.tipoRecorrencia}
                      onChange={(e) => setFormData(prev => ({ ...prev, tipoRecorrencia: e.target.value as any }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="semanal">Semanal</option>
                      <option value="mensal">Mensal</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>
                )}

                {/* Status da Transação */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Status da Transação
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="confirmada"
                        checked={formData.confirmada === true}
                        onChange={() => setFormData(prev => ({ ...prev, confirmada: true }))}
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
                        name="confirmada"
                        checked={formData.confirmada === false}
                        onChange={() => setFormData(prev => ({ ...prev, confirmada: false }))}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <span className="ml-3 text-sm text-gray-900">
                        <span className="font-medium text-orange-600">⏳ Lançamento Futuro</span>
                        <span className="block text-xs text-gray-500">
                          Previsto/planejado, não afeta o saldo atual
                        </span>
                      </span>
                    </label>
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
              form="transaction-form"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Adicionar Transação
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TransactionModal;