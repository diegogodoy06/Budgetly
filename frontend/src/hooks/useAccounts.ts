import { useState, useEffect } from 'react';
import { Account, AccountFormData } from '../types';
import { accountsService } from '../services/accounts';
import { useWorkspace } from '../contexts/WorkspaceContext';
import toast from 'react-hot-toast';

interface UseAccountsReturn {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  createAccount: (data: AccountFormData) => Promise<void>;
  updateAccount: (id: number, data: AccountFormData) => Promise<void>;
  deleteAccount: (id: number) => Promise<void>;
  refreshAccounts: () => Promise<void>;
  recalculateAllBalances: () => Promise<void>;
  resetInitialBalances: () => Promise<void>;
}

export const useAccounts = (): UseAccountsReturn => {
  const { currentWorkspace } = useWorkspace();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = async () => {
    if (!currentWorkspace) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Carregando contas para workspace:', currentWorkspace.nome);
      const data = await accountsService.getAccounts();
      setAccounts(data);
      console.log('✅ Contas carregadas:', data.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar contas';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('❌ Erro ao carregar contas:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar contas quando workspace mudar
  useEffect(() => {
    loadAccounts();
  }, [currentWorkspace?.id]);

  // Escutar mudanças de workspace
  useEffect(() => {
    const handleWorkspaceChange = () => {
      console.log('🔄 useAccounts detectou mudança de workspace');
      setAccounts([]); // Limpar dados imediatamente
      setLoading(true);
      // loadAccounts será chamado pelo useEffect de currentWorkspace
    };

    window.addEventListener('workspaceChanged', handleWorkspaceChange);
    
    return () => {
      window.removeEventListener('workspaceChanged', handleWorkspaceChange);
    };
  }, []);

  const createAccount = async (accountData: AccountFormData) => {
    try {
      const newAccount = await accountsService.createAccount(accountData);
      setAccounts(prev => [...prev, newAccount]);
      toast.success('Conta criada com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err; // Re-throw para que o componente possa tratar
    }
  };

  const updateAccount = async (id: number, accountData: AccountFormData) => {
    try {
      const updatedAccount = await accountsService.updateAccount(id, accountData);
      setAccounts(prev => 
        prev.map(account => 
          account.id === id ? updatedAccount : account
        )
      );
      toast.success('Conta atualizada com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar conta';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err; // Re-throw para que o componente possa tratar
    }
  };

  const deleteAccount = async (id: number) => {
    try {
      await accountsService.deleteAccount(id);
      setAccounts(prev => prev.filter(account => account.id !== id));
      toast.success('Conta removida com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover conta';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err; // Re-throw para que o componente possa tratar
    }
  };

  const refreshAccounts = async () => {
    await loadAccounts();
  };

  const recalculateAllBalances = async () => {
    if (!currentWorkspace) {
      toast.error('Nenhum workspace selecionado');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Recalculando saldos de todas as contas...');
      
      const response = await accountsService.recalculateAllBalances();
      
      if (response.contas_atualizadas > 0) {
        toast.success(`${response.contas_atualizadas} conta(s) com saldo corrigido!`);
        console.log('✅ Saldos recalculados:', response);
        
        // Recarregar as contas para mostrar os novos saldos
        await loadAccounts();
      } else {
        toast.success('Todos os saldos já estavam corretos!');
        console.log('ℹ️ Nenhuma conta precisou de correção');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao recalcular saldos';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('❌ Erro ao recalcular saldos:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetInitialBalances = async () => {
    if (!currentWorkspace) {
      toast.error('Nenhum workspace selecionado');
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Zerando saldos iniciais de contas sem transações...');
      
      const response = await accountsService.resetInitialBalances();
      
      if (response.contas_zeradas > 0) {
        toast.success(`${response.contas_zeradas} conta(s) com saldo inicial zerado!`);
        console.log('✅ Saldos iniciais zerados:', response);
        
        // Recarregar as contas para mostrar os novos saldos
        await loadAccounts();
      } else {
        toast.success('Todas as contas já estavam com saldo correto!');
        console.log('ℹ️ Nenhuma conta precisou ser zerada');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao zerar saldos iniciais';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('❌ Erro ao zerar saldos iniciais:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    accounts,
    loading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    refreshAccounts,
    recalculateAllBalances,
    resetInitialBalances
  };
};
