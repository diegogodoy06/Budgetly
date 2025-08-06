import api from './api';
import { Account, AccountFormData } from '../types';

// Interface para resposta paginada da API
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Interface para resposta da API (backend usa campos em português)
interface AccountResponse {
  id: number;
  nome: string;
  tipo: string;
  banco?: string;
  codigo_banco?: string;
  saldo_inicial: string;
  saldo_atual: string;
  eh_conta: boolean;
  cor: string;
  icone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Interface para dados enviados ao backend
interface AccountPayload {
  nome: string;
  tipo: string;
  banco?: string;
  codigo_banco?: string;
  saldo_inicial: string;
  eh_conta: boolean;
  cor: string;
  icone: string;
}

export const accountsService = {
  // Listar todas as contas do usuário
  async getAccounts(): Promise<Account[]> {
    try {
      const response = await api.get<PaginatedResponse<AccountResponse>>('/api/accounts/accounts/');
      return response.data.results.map((account: AccountResponse) => ({
        ...account,
        tipo: account.tipo as Account['tipo']
      }));
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
      throw new Error('Erro ao carregar contas');
    }
  },

  // Buscar uma conta específica
  async getAccount(id: number): Promise<Account> {
    try {
      const response = await api.get<AccountResponse>(`/api/accounts/accounts/${id}/`);
      return {
        ...response.data,
        tipo: response.data.tipo as Account['tipo']
      };
    } catch (error) {
      console.error('Erro ao buscar conta:', error);
      throw new Error('Erro ao carregar conta');
    }
  },

  // Criar nova conta
  async createAccount(accountData: AccountFormData): Promise<Account> {
    try {
      const payload: AccountPayload = {
        nome: accountData.nome,
        tipo: accountData.tipo,
        banco: accountData.banco,
        codigo_banco: accountData.codigo_banco,
        saldo_inicial: accountData.saldo_inicial.toString(),
        eh_conta: accountData.eh_conta,
        cor: accountData.cor,
        icone: accountData.icone
      };

      const response = await api.post<AccountResponse>('/api/accounts/accounts/', payload);
      return {
        ...response.data,
        tipo: response.data.tipo as Account['tipo']
      };
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);
      
      // Tratar erros específicos
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.nome) {
          throw new Error(`Nome: ${errorData.nome[0]}`);
        }
        if (errorData.non_field_errors) {
          throw new Error(errorData.non_field_errors[0]);
        }
      }
      
      throw new Error('Erro ao criar conta');
    }
  },

  // Atualizar conta
  async updateAccount(id: number, accountData: AccountFormData): Promise<Account> {
    try {
      const payload: AccountPayload = {
        nome: accountData.nome,
        tipo: accountData.tipo,
        banco: accountData.banco,
        codigo_banco: accountData.codigo_banco,
        saldo_inicial: accountData.saldo_inicial.toString(),
        eh_conta: accountData.eh_conta,
        cor: accountData.cor,
        icone: accountData.icone
      };

      const response = await api.put<AccountResponse>(`/api/accounts/accounts/${id}/`, payload);
      return {
        ...response.data,
        tipo: response.data.tipo as Account['tipo']
      };
    } catch (error: any) {
      console.error('Erro ao atualizar conta:', error);
      
      // Tratar erros específicos
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.nome) {
          throw new Error(`Nome: ${errorData.nome[0]}`);
        }
        if (errorData.non_field_errors) {
          throw new Error(errorData.non_field_errors[0]);
        }
      }
      
      throw new Error('Erro ao atualizar conta');
    }
  },

  // Deletar conta (soft delete)
  async deleteAccount(id: number): Promise<void> {
    try {
      await api.delete(`/api/accounts/accounts/${id}/`);
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      throw new Error('Erro ao deletar conta');
    }
  },

  // Buscar saldos das contas (endpoint otimizado)
  async getAccountBalances(): Promise<Pick<Account, 'id' | 'nome' | 'tipo' | 'saldo_atual'>[]> {
    try {
      const response = await api.get<PaginatedResponse<AccountResponse>>('/api/accounts/accounts/balances/');
      return response.data.results.map((account: AccountResponse) => ({
        id: account.id,
        nome: account.nome,
        tipo: account.tipo as Account['tipo'],
        saldo_atual: account.saldo_atual
      }));
    } catch (error) {
      console.error('Erro ao buscar saldos:', error);
      throw new Error('Erro ao carregar saldos');
    }
  },

  // Recalcular todos os saldos das contas do workspace
  async recalculateAllBalances(): Promise<{
    message: string;
    contas_atualizadas: number;
    total_contas: number;
    resultados: Array<{
      conta: string;
      saldo_anterior?: string;
      saldo_atual: string;
      diferenca?: string;
      atualizada: boolean;
      message?: string;
    }>;
  }> {
    try {
      const response = await api.post('/api/accounts/accounts/recalculate_all_balances/');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao recalcular saldos:', error);
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.detail) {
          throw new Error(errorData.detail);
        }
      }
      
      throw new Error('Erro ao recalcular saldos das contas');
    }
  },

  // Zerar saldos iniciais de contas sem transações
  async resetInitialBalances(): Promise<{
    message: string;
    contas_zeradas: number;
    total_contas: number;
    resultados: Array<{
      conta: string;
      saldo_inicial_anterior?: string;
      saldo_inicial_atual?: number;
      saldo_atual?: number;
      zerada: boolean;
      motivo?: string;
    }>;
  }> {
    try {
      const response = await api.post('/api/accounts/accounts/reset_initial_balances/');
      return response.data;
    } catch (error: any) {
      console.error('Erro ao zerar saldos iniciais:', error);
      
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.detail) {
          throw new Error(errorData.detail);
        }
      }
      
      throw new Error('Erro ao zerar saldos iniciais');
    }
  }
};
