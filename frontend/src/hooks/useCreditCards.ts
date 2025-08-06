import { useState, useEffect } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { creditCardsAPI } from '@/services/api';
import type { CreditCard, CreditCardFormData } from '@/types';
import toast from 'react-hot-toast';

export const useCreditCards = () => {
  const { currentWorkspace } = useWorkspace();
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);

  const clearData = () => {
    setCards([]);
    setLoading(true);
  };

  const loadCards = async () => {
    if (!currentWorkspace) {
      setCards([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Carregando cartões para workspace:', currentWorkspace.nome);
      const data = await creditCardsAPI.getAll();
      setCards(data);
      console.log('✅ Cartões carregados:', data.length);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
      toast.error('Erro ao carregar cartões de crédito');
    } finally {
      setLoading(false);
    }
  };

  const createCard = async (formData: CreditCardFormData): Promise<CreditCard> => {
    try {
      const newCard = await creditCardsAPI.create(formData);
      setCards(prev => [...prev, newCard]);
      toast.success('Cartão criado com sucesso!');
      return newCard;
    } catch (error: any) {
      console.error('Erro ao criar cartão:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao criar cartão';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateCard = async (cardId: number, formData: CreditCardFormData): Promise<CreditCard> => {
    try {
      const updatedCard = await creditCardsAPI.update(cardId, formData);
      setCards(prev => prev.map(c => c.id === cardId ? updatedCard : c));
      toast.success('Cartão atualizado com sucesso!');
      return updatedCard;
    } catch (error: any) {
      console.error('Erro ao atualizar cartão:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar cartão';
      toast.error(errorMessage);
      throw error;
    }
  };

  const deleteCard = async (cardId: number): Promise<void> => {
    if (!confirm('Tem certeza que deseja excluir este cartão?')) {
      return;
    }

    try {
      await creditCardsAPI.delete(cardId);
      setCards(prev => prev.filter(c => c.id !== cardId));
      toast.success('Cartão excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir cartão:', error);
      toast.error('Erro ao excluir cartão');
      throw error;
    }
  };

  useEffect(() => {
    loadCards();
  }, [currentWorkspace?.id]);

  // Escutar mudanças de workspace
  useEffect(() => {
    const handleWorkspaceChange = () => {
      console.log('🔄 useCreditCards detectou mudança de workspace');
      clearData();
    };

    window.addEventListener('workspaceChanged', handleWorkspaceChange);
    
    return () => {
      window.removeEventListener('workspaceChanged', handleWorkspaceChange);
    };
  }, []);

  return {
    cards,
    loading,
    createCard,
    updateCard,
    deleteCard,
    refetch: loadCards
  };
};