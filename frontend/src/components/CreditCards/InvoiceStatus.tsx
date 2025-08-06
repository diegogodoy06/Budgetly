import React from 'react';
import type { CreditCard } from '@/types';
import { calculateBestPurchaseDate, getInvoiceStatus } from '@/utils/creditCardCalculations';

interface InvoiceStatusProps {
  card: CreditCard;
  currentInvoice?: any;
}

const InvoiceStatus: React.FC<InvoiceStatusProps> = ({ card, currentInvoice }) => {
  const status = getInvoiceStatus(card, currentInvoice);
  const bestPurchaseDate = calculateBestPurchaseDate(card);

  return (
    <div className="flex items-center gap-6">
      {/* Fechamento */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Fechamento:</span>
        <span className="text-xs font-medium text-gray-900">
          Dia {card.dia_fechamento}
        </span>
      </div>
      
      {/* Vencimento */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Vencimento:</span>
        <span className="text-xs font-medium text-gray-900">
          Dia {card.dia_vencimento}
        </span>
      </div>
      
      {/* Melhor Data */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Melhor Data:</span>
        <span className="text-xs font-medium text-blue-700">
          {bestPurchaseDate}
        </span>
      </div>
      
      {/* Status Fatura */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Status:</span>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          status.isOpen 
            ? 'bg-green-100 text-green-700'
            : 'bg-orange-100 text-orange-700'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
            status.isOpen ? 'bg-green-500' : 'bg-orange-500'
          }`}></div>
          {status.isOpen 
            ? `Aberta • ${status.daysToClosing}d`
            : 'Fechada'
          }
        </span>
      </div>
    </div>
  );
};

export default InvoiceStatus;