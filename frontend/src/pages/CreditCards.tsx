import React, { useState, useEffect } from 'react';
import { PlusIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import type { CreditCard, CreditCardFormData } from '@/types';
import { useCreditCards } from '@/hooks/useCreditCards';
import { useCreditCardTransactions } from '@/hooks/useCreditCardTransactions';
import { isInvoiceClosed } from '@/utils/creditCardCalculations';
import CreditCardItem from '@/components/CreditCards/CreditCardItem';
import CreditCardModal from '@/components/CreditCards/CreditCardModal';
import TransactionModal from '@/components/CreditCards/TransactionModal';
import TransactionList from '@/components/CreditCards/TransactionList';
import MonthNavigation from '@/components/CreditCards/MonthNavigation';
import InvoiceStatus from '@/components/CreditCards/InvoiceStatus';

const CreditCards: React.FC = () => {
  // Use custom hooks for data management
  const { cards, loading, createCard, updateCard, deleteCard } = useCreditCards();
  
  // State for selected card and month
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    return `${year}-${month.toString().padStart(2, '0')}`;
  });
  
  // State for month navigation
  const [monthOffset, setMonthOffset] = useState(0);
  
  // Modal states
  const [showCardModal, setShowCardModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showInvoicesModal, setShowInvoicesModal] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  
  // Use transactions hook for selected card
  const {
    transactions,
    currentInvoice,
    loadingTransactions,
    createTransaction,
    deleteTransaction,
    getMonthTransactions
  } = useCreditCardTransactions(selectedCard);

  // Auto-select first card when cards are loaded
  useEffect(() => {
    if (cards.length > 0 && !selectedCard) {
      setSelectedCard(cards[0].id);
    }
  }, [cards, selectedCard]);

  const handleCardSelect = (cardId: number) => {
    setSelectedCard(cardId);
  };

  const handleCardEdit = (card: CreditCard) => {
    setEditingCard(card);
    setShowCardModal(true);
  };

  const handleCardDelete = async (cardId: number) => {
    await deleteCard(cardId);
    if (selectedCard === cardId) {
      setSelectedCard(cards.length > 1 ? cards.find(c => c.id !== cardId)?.id || null : null);
    }
  };

  const handleCardModalSubmit = async (formData: CreditCardFormData) => {
    try {
      if (editingCard) {
        await updateCard(editingCard.id, formData);
      } else {
        await createCard(formData);
      }
      handleCardModalClose();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleCardModalClose = () => {
    setShowCardModal(false);
    setEditingCard(null);
  };

  const handleTransactionModalSubmit = async (transactionData: any) => {
    try {
      await createTransaction(transactionData);
      setShowTransactionModal(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDeleteTransaction = (transactionId: number) => {
    deleteTransaction(transactionId);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  const handleNavigatePrevious = () => {
    setMonthOffset(prev => prev - 1);
  };

  const handleNavigateNext = () => {
    setMonthOffset(prev => prev + 1);
  };

  const selectedCardData = cards.find(c => c.id === selectedCard);
  const monthTransactions = selectedCard ? getMonthTransactions(selectedCard, selectedMonth) : [];
  const isCurrentInvoiceClosed = selectedCard ? isInvoiceClosed(selectedCard, selectedMonth, cards) : false;

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
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Cartões de Crédito
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie seus cartões de crédito e transações
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => setShowCardModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Novo Cartão
          </button>
        </div>
      </div>

      {/* Cards dos Cartões */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <CreditCardItem
            key={card.id}
            card={card}
            isSelected={selectedCard === card.id}
            onSelect={handleCardSelect}
            onEdit={handleCardEdit}
            onDelete={handleCardDelete}
          />
        ))}
      </div>

      {/* Estado Vazio */}
      {cards.length === 0 && (
        <div className="text-center py-12">
          <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cartão encontrado</h3>
          <p className="text-gray-600 mb-4">Adicione seu primeiro cartão de crédito para começar</p>
          <button
            onClick={() => setShowCardModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Adicionar Cartão
          </button>
        </div>
      )}

      {/* Detalhes e Transações do Cartão Selecionado */}
      {selectedCard && selectedCardData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header com informações do cartão */}
          <div className="px-6 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {selectedCardData.nome}
                </h3>
                
                {/* Invoice Status Component */}
                <InvoiceStatus card={selectedCardData} currentInvoice={currentInvoice} />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInvoicesModal(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Faturas
                </button>
                {!isCurrentInvoiceClosed && (
                  <button
                    type="button"
                    onClick={() => setShowTransactionModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Nova Transação
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Month Navigation Component */}
          <MonthNavigation
            selectedCard={selectedCard}
            selectedMonth={selectedMonth}
            onMonthChange={handleMonthChange}
            monthOffset={monthOffset}
            onNavigatePrevious={handleNavigatePrevious}
            onNavigateNext={handleNavigateNext}
            cards={cards}
            transactions={transactions}
          />
          
          {/* Transaction List Component */}
          <TransactionList
            transactions={monthTransactions}
            isLoading={loadingTransactions}
            selectedMonth={selectedMonth}
            isInvoiceClosed={isCurrentInvoiceClosed}
            onDeleteTransaction={handleDeleteTransaction}
            onAddTransaction={() => setShowTransactionModal(true)}
          />
        </div>
      )}

      {/* Modals */}
      <CreditCardModal
        isOpen={showCardModal}
        onClose={handleCardModalClose}
        onSubmit={handleCardModalSubmit}
        editingCard={editingCard}
      />
      
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onSubmit={handleTransactionModalSubmit}
        selectedCardId={selectedCard}
      />
    </div>
  );
};

export default CreditCards;