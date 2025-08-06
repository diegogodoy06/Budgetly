import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { CreditCard } from '@/types';
import { getBrandLogo } from '@/utils/creditCardBrands';
import { formatCurrency, formatCardNumber } from '@/utils/currencyUtils';

interface CreditCardItemProps {
  card: CreditCard;
  isSelected: boolean;
  onSelect: (cardId: number) => void;
  onEdit: (card: CreditCard) => void;
  onDelete: (cardId: number) => void;
}

const CreditCardItem: React.FC<CreditCardItemProps> = ({
  card,
  isSelected,
  onSelect,
  onEdit,
  onDelete
}) => {
  return (
    <div 
      onClick={() => onSelect(card.id)}
      className={`relative cursor-pointer transform transition-all duration-500 ease-out hover:scale-[1.02] ${
        isSelected ? 'scale-105' : ''
      }`}
    >
      {/* Card visual do cartão - altura reduzida */}
      <div className={`relative rounded-xl p-4 text-white shadow-lg min-h-[140px] flex flex-col justify-between overflow-hidden transition-all duration-700 ease-in-out ${
        isSelected 
          ? `${card.cor} shadow-2xl` 
          : 'bg-gradient-to-br from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700'
      }`}>
        {/* Background pattern - só aparece no cartão selecionado */}
        {isSelected && (
          <div className="absolute inset-0 opacity-10 animate-in fade-in duration-700">
            <div className="absolute top-2 right-2 w-12 h-12 rounded-full border-2 border-white animate-pulse"></div>
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full border-2 border-white animate-pulse delay-150"></div>
          </div>
        )}
        
        {/* Conteúdo do cartão */}
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="text-xs opacity-90">Cartão de Crédito</p>
              <p className="text-base font-bold truncate">{card.nome}</p>
            </div>
            <div className="flex items-center space-x-2">
              {/* Logo da bandeira */}
              <div className="flex items-center">{getBrandLogo(card.bandeira)}</div>
              <div className="flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(card);
                  }}
                  className="p-1 text-white hover:text-gray-200 transition-colors opacity-75 hover:opacity-100"
                >
                  <PencilIcon className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(card.id);
                  }}
                  className="p-1 text-white hover:text-gray-200 transition-colors opacity-75 hover:opacity-100"
                >
                  <TrashIcon className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-lg font-mono tracking-wider">
              {formatCardNumber(card.ultimos_4_digitos)}
            </p>
          </div>
        </div>
        
        <div className="relative z-10 flex justify-between items-end">
          <div className="flex gap-1.5">
            {/* Label de Vencimento */}
            <div className="bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded-md border border-white/30">
              <p className="text-xs font-medium">{card.dia_vencimento} Venc</p>
            </div>
            
            {/* Label de Fechamento */}
            <div className="bg-white/20 backdrop-blur-sm px-1.5 py-0.5 rounded-md border border-white/30">
              <p className="text-xs font-medium">{card.dia_fechamento} Fech</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-75">Usado / Limite</p>
            <p className="text-xs font-bold">
              {formatCurrency(card.saldo_atual)} / {formatCurrency(card.limite)}
            </p>
          </div>
        </div>
        
        {/* Indicador de seleção - agora mais discreto */}
        {isSelected && (
          <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full shadow-md animate-in zoom-in duration-500 animate-pulse"></div>
        )}
        
        {/* Barra de progresso como rodapé do card */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 rounded-b-2xl overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${
              card.percentual_usado > 100
                ? 'bg-gradient-to-r from-red-400 to-red-600'
                : isSelected 
                ? card.percentual_usado > 80
                  ? 'bg-gradient-to-r from-red-400 to-red-600'
                  : card.percentual_usado > 50
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                  : 'bg-gradient-to-r from-green-400 to-blue-500'
                : card.percentual_usado > 80
                ? 'bg-red-400'
                : card.percentual_usado > 50
                ? 'bg-yellow-400'
                : 'bg-green-400'
            }`}
            style={{ width: `${Math.min(card.percentual_usado, 100)}%` }}
          ></div>
        </div>
      </div>
      
      {/* Informações extras abaixo do card */}
      <div className="mt-2 px-2">
      </div>
    </div>
  );
};

export default CreditCardItem;