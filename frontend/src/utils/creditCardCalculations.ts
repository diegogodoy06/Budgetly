import type { CreditCard } from '@/types';

export interface InvoiceStatus {
  isOpen: boolean;
  daysToClosing: number;
  status: string;
  valor_atual?: number;
}

export const calculateBestPurchaseDate = (card: CreditCard): string => {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // A melhor data é sempre o dia seguinte ao fechamento da fatura atual
  // Isso garante que a compra vai para a próxima fatura (maior prazo para pagamento)
  
  let targetMonth = currentMonth;
  let targetYear = currentYear;
  
  // Se já passou do fechamento deste mês, vai para o próximo mês
  if (currentDay > card.dia_fechamento) {
    targetMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    targetYear = currentMonth === 11 ? currentYear + 1 : currentYear;
  }
  
  // A melhor data é sempre o dia seguinte ao fechamento
  const bestDate = new Date(targetYear, targetMonth, card.dia_fechamento + 1);
  
  return bestDate.toLocaleDateString('pt-BR');
};

export const getInvoiceStatus = (card: CreditCard, currentInvoice?: any): InvoiceStatus => {
  // Se temos dados da API da fatura atual, usar eles
  if (currentInvoice) {
    const fatura = currentInvoice.fatura_atual;
    return {
      isOpen: fatura.status === 'aberta',
      daysToClosing: fatura.dias_para_fechamento || 0,
      status: fatura.status,
      valor_atual: fatura.valor_atual
    };
  }
  
  // Fallback para cálculo local
  const today = new Date();
  const currentDay = today.getDate();
  
  const isBeforeClosing = currentDay < card.dia_fechamento;
  const daysToClosing = isBeforeClosing 
    ? card.dia_fechamento - currentDay 
    : (new Date(today.getFullYear(), today.getMonth() + 1, card.dia_fechamento).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  
  return {
    isOpen: isBeforeClosing,
    daysToClosing: Math.ceil(daysToClosing),
    status: isBeforeClosing ? 'aberta' : 'fechada'
  };
};

export const isInvoiceClosed = (cardId: number, yearMonth: string, cards: CreditCard[]): boolean => {
  const today = new Date();
  const [year, month] = yearMonth.split('-').map(Number);
  const card = cards.find(c => c.id === cardId);
  
  if (!card) return false;
  
  // Se é mês futuro, ainda não fechou
  if (year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth() + 1)) {
    return false;
  }
  
  // Se é mês atual, verifica se já passou do dia de fechamento
  if (year === today.getFullYear() && month === today.getMonth() + 1) {
    return today.getDate() > card.dia_fechamento;
  }
  
  // Se é mês passado, já fechou
  return true;
};

export const formatMonthYear = (yearMonth: string): string => {
  const [year, month] = yearMonth.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
};