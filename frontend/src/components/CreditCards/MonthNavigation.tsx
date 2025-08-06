import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/currencyUtils';
import { formatMonthYear, isInvoiceClosed } from '@/utils/creditCardCalculations';
import type { CreditCard, Transaction } from '@/types';

interface MonthNavigationProps {
  selectedCard: number;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  monthOffset: number;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  cards: CreditCard[];
  transactions: Transaction[];
}

const MONTHS_VISIBLE = 5;

const MonthNavigation: React.FC<MonthNavigationProps> = ({
  selectedCard,
  selectedMonth,
  onMonthChange,
  monthOffset,
  onNavigatePrevious,
  onNavigateNext,
  cards,
  transactions
}) => {
  const getAvailableMonths = () => {
    const months = [];
    const today = new Date();
    
    // Calcular o ponto de início baseado no offset
    // Por padrão, mostramos: 2 passados, atual, 2 futuros
    // Com offset, podemos navegar para mostrar outros períodos
    const startOffset = -2 + monthOffset; // Começar 2 meses atrás + offset
    
    for (let i = 0; i < MONTHS_VISIBLE; i++) {
      const monthsFromStart = startOffset + i;
      const date = new Date(today.getFullYear(), today.getMonth() + monthsFromStart, 1);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.push(yearMonth);
    }
    
    return months;
  };

  const getMonthTransactions = (cardId: number, yearMonth: string) => {
    return transactions.filter(t => {
      if (t.credit_card !== cardId) return false;
      const transactionDate = new Date(t.data);
      const transactionYearMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
      return transactionYearMonth === yearMonth;
    });
  };

  const getInvoiceValue = (cardId: number, yearMonth: string) => {
    return getMonthTransactions(cardId, yearMonth).reduce((total, t) => total + parseFloat(t.valor), 0);
  };

  return (
    <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 relative">
      <div className="flex items-center gap-4">
        {/* Seta para navegação anterior */}
        <button
          onClick={onNavigatePrevious}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Meses anteriores"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
        </button>

        {/* Container dos meses */}
        <div className="flex gap-0 justify-between flex-1" id="meses-container">
          {getAvailableMonths().map((month) => (
            <div 
              key={month} 
              className="flex flex-col cursor-pointer flex-1 text-center" 
              onClick={() => onMonthChange(month)}
            >
              <div className={`text-sm font-medium mb-1 ${
                selectedMonth === month
                  ? 'text-gray-900'
                  : 'text-gray-600 hover:text-gray-800'
              }`}>
                {formatMonthYear(month)}
              </div>
              <div className="flex items-center justify-center space-x-3 text-xs">
                <span className="text-gray-800 font-extralight text-xs">
                  {formatCurrency(getInvoiceValue(selectedCard, month))}
                </span>
                <span className={`px-1.5 py-0.5 rounded-full font-extralight text-xs ${
                  isInvoiceClosed(selectedCard, month, cards)
                    ? 'bg-gray-200 text-gray-600'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {isInvoiceClosed(selectedCard, month, cards) ? 'Fechada' : 'Aberto'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Seta para navegação próxima */}
        <button
          onClick={onNavigateNext}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 transition-colors"
          aria-label="Próximos meses"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      {/* Barra embaixo alinhada com os meses */}
      <div className="absolute bottom-0 left-12 h-0.5 bg-gray-200" style={{ width: 'calc(100% - 6rem)' }}>
        <div 
          className="h-0.5 bg-gray-900 transition-all duration-300 ease-in-out"
          style={{
            width: `calc(${100 / MONTHS_VISIBLE}% - 0px)`, // Largura de cada mês
            left: `${getAvailableMonths().findIndex(month => month === selectedMonth) * (100 / MONTHS_VISIBLE)}%`,
            position: 'absolute'
          }}
        ></div>
      </div>
    </div>
  );
};

export default MonthNavigation;