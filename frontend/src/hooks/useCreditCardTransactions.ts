import { useState, useEffect } from 'react';
import { transactionsAPI, invoicesAPI } from '@/services/api';
import type { Transaction, CreditCardInvoice } from '@/types';
import toast from 'react-hot-toast';

export const useCreditCardTransactions = (cardId: number | null) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<CreditCardInvoice[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<any>(null);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  const loadTransactions = async (creditCardId: number) => {
    try {
      setLoadingTransactions(true);
      const data = await transactionsAPI.getByCreditCard(creditCardId);
      setTransactions(data);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      toast.error('Erro ao carregar transações do cartão');
    } finally {
      setLoadingTransactions(false);
    }
  };

  const loadInvoices = async (creditCardId: number) => {
    try {
      setLoadingInvoices(true);
      const [invoicesData, previewData] = await Promise.all([
        invoicesAPI.getByCard(creditCardId),
        invoicesAPI.getPreview(creditCardId)
      ]);
      setInvoices(invoicesData);
      setCurrentInvoice(previewData);
    } catch (error) {
      console.error('Erro ao carregar faturas:', error);
      toast.error('Erro ao carregar faturas do cartão');
    } finally {
      setLoadingInvoices(false);
    }
  };

  const closeInvoice = async (invoiceId: number) => {
    try {
      await invoicesAPI.close(invoiceId);
      toast.success('Fatura fechada com sucesso!');
      
      // Recarregar faturas após fechar
      if (cardId) {
        loadInvoices(cardId);
      }
    } catch (error) {
      console.error('Erro ao fechar fatura:', error);
      toast.error('Erro ao fechar fatura');
    }
  };

  const createTransaction = async (transactionData: any) => {
    try {
      await transactionsAPI.create(transactionData);
      
      // Recarregar transações
      if (cardId) {
        loadTransactions(cardId);
      }
      
      toast.success('Transação adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      toast.error('Erro ao criar transação');
      throw error;
    }
  };

  const deleteTransaction = (transactionId: number) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
    toast.success('Transação excluída com sucesso!');
  };

  const getMonthTransactions = (creditCardId: number, yearMonth: string) => {
    return transactions.filter(t => {
      if (t.credit_card !== creditCardId) return false;
      const transactionDate = new Date(t.data);
      const transactionYearMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
      return transactionYearMonth === yearMonth;
    });
  };

  const getInvoiceValue = (creditCardId: number, yearMonth: string) => {
    return getMonthTransactions(creditCardId, yearMonth).reduce((total, t) => total + parseFloat(t.valor), 0);
  };

  // Carregar dados quando cartão for selecionado
  useEffect(() => {
    if (cardId) {
      loadTransactions(cardId);
      loadInvoices(cardId);
    }
  }, [cardId]);

  return {
    transactions,
    invoices,
    currentInvoice,
    loadingTransactions,
    loadingInvoices,
    createTransaction,
    deleteTransaction,
    closeInvoice,
    getMonthTransactions,
    getInvoiceValue,
    refetchTransactions: () => cardId && loadTransactions(cardId),
    refetchInvoices: () => cardId && loadInvoices(cardId)
  };
};