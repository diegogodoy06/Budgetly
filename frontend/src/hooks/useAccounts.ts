import { useState, useEffect } from 'react';
import { Account, AccountFormData } from '../types';
import { accountsService } from '../services/accounts';
import toast from 'react-hot-toast';

interface UseAccountsReturn {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  createAccount: (data: AccountFormData) => Promise<void>;
  updateAccount: (id: number, data: AccountFormData) => Promise<void>;
  deleteAccount: (id: number) => Promise<void>;
  refreshAccounts: () => Promise<void>;
}

export const useAccounts = (): UseAccountsReturn => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await accountsService.getAccounts();
      setAccounts(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar contas';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    loadAccounts();
  }, []);

  return {
    accounts,
    loading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    refreshAccounts
  };
};
