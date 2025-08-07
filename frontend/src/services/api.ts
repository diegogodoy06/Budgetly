import axios from 'axios';
import type { 
  User, Account, Transaction, Category, Tag, Budget, CreditCardBill,
  LoginRequest, RegisterRequest, AuthResponse, DashboardData,
  CreditCard, CreditCardFormData, CreditCardInvoice
} from '@/types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and workspace
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Detectar se é JWT (começa com 'ey') ou Token DRF
      const isJWT = token.startsWith('ey');
      if (isJWT) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 JWT Token detectado, usando Bearer auth');
      } else {
        config.headers.Authorization = `Token ${token}`;
        console.log('🔑 DRF Token detectado, usando Token auth');
      }
    }
    
    // Não adicionar workspace ID para endpoints de autenticação
    const authEndpoints = [
      '/api/accounts/login/', 
      '/api/accounts/register/', 
      '/api/accounts/logout/',
      '/api/accounts/profile/',
      '/api/accounts/workspaces/'
    ];
    const isAuthEndpoint = authEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    if (!isAuthEndpoint) {
      // Adicionar workspace ID se disponível e não for endpoint de auth
      const currentWorkspaceId = localStorage.getItem('current_workspace_id');
      if (currentWorkspaceId) {
        config.headers['X-Workspace-ID'] = currentWorkspaceId;
        console.log('🏢 Requisição com workspace ID:', currentWorkspaceId, 'para:', config.url);
      } else {
        console.log('⚠️ Requisição sem workspace ID para:', config.url);
      }
    } else {
      console.log('🔐 Endpoint de autenticação, não enviando workspace ID para:', config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o erro for 401 (Unauthorized), faz logout
    if (error.response?.status === 401) {
      console.log('🚨 Erro 401 detectado:', error.config?.url);
      
      // Verificar se não é um endpoint de autenticação que está falhando
      const authEndpoints = [
        '/api/accounts/login/', 
        '/api/accounts/register/', 
        '/api/accounts/profile/',
        '/api/accounts/workspaces/'
      ];
      const isAuthEndpoint = authEndpoints.some(endpoint => error.config?.url?.includes(endpoint));
      
      if (!isAuthEndpoint) {
        console.log('🔒 Erro 401 em endpoint não-auth - fazendo logout automático');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('current_workspace_id');
        
        // Só redireciona se não estiver já na página de login
        if (window.location.pathname !== '/login') {
          console.log('🔄 Redirecionando para login devido ao erro 401');
          window.location.href = '/login';
        }
      } else {
        console.log('🔒 Erro 401 em endpoint de auth - não fazendo logout automático');
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    api.post('/api/accounts/login/', data).then(res => res.data),
  
  register: (data: RegisterRequest): Promise<AuthResponse> =>
    api.post('/api/accounts/register/', data).then(res => res.data),
  
  logout: (): Promise<void> =>
    api.post('/api/accounts/logout/').then(res => res.data),
  
  getProfile: (): Promise<User> =>
    api.get('/api/accounts/profile/').then(res => res.data),
};

// Accounts API
export const accountsAPI = {
  getAll: (): Promise<Account[]> =>
    api.get('/api/accounts/accounts/').then(res => res.data.results || res.data),
  
  getById: (id: number): Promise<Account> =>
    api.get(`/api/accounts/accounts/${id}/`).then(res => res.data),
  
  create: (data: Partial<Account>): Promise<Account> =>
    api.post('/api/accounts/accounts/', data).then(res => res.data),
  
  update: (id: number, data: Partial<Account>): Promise<Account> =>
    api.patch(`/api/accounts/accounts/${id}/`, data).then(res => res.data),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/api/accounts/accounts/${id}/`).then(res => res.data),
  
  getBalances: (): Promise<Account[]> =>
    api.get('/api/accounts/accounts/balances/').then(res => res.data),
};

// Credit Cards API
export const creditCardsAPI = {
  getAll: (): Promise<CreditCard[]> =>
    api.get('/api/accounts/credit-cards/').then(res => res.data.results || res.data),
  
  getById: (id: number): Promise<CreditCard> =>
    api.get(`/api/accounts/credit-cards/${id}/`).then(res => res.data),
  
  create: (data: CreditCardFormData): Promise<CreditCard> =>
    api.post('/api/accounts/credit-cards/', data).then(res => res.data),
  
  update: (id: number, data: Partial<CreditCardFormData>): Promise<CreditCard> =>
    api.patch(`/api/accounts/credit-cards/${id}/`, data).then(res => res.data),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/api/accounts/credit-cards/${id}/`).then(res => res.data),
  
  getBalances: (): Promise<CreditCard[]> =>
    api.get('/api/accounts/credit-cards/balances/').then(res => res.data),
};

// Transactions API
export const transactionsAPI = {
  getAll: (params?: any): Promise<Transaction[]> =>
    api.get('/api/transactions/transactions/', { params }).then(res => res.data.results || res.data),
  
  getById: (id: number): Promise<Transaction> =>
    api.get(`/api/transactions/transactions/${id}/`).then(res => res.data),
  
  create: (data: any): Promise<Transaction> =>
    api.post('/api/transactions/transactions/', data).then(res => res.data),
  
  update: (id: number, data: any): Promise<Transaction> =>
    api.patch(`/api/transactions/transactions/${id}/`, data).then(res => res.data),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/api/transactions/transactions/${id}/`).then(res => res.data),
  
  getByCreditCard: (creditCardId: number, params?: any): Promise<Transaction[]> =>
    api.get('/api/transactions/transactions/', { 
      params: { credit_card: creditCardId, ...params } 
    }).then(res => res.data.results || res.data),
  
  summary: (params?: any): Promise<any> =>
    api.get('/api/transactions/transactions/summary/', { params }).then(res => res.data),
  
  byCategory: (params?: any): Promise<any> =>
    api.get('/api/transactions/transactions/by_category/', { params }).then(res => res.data),
  
  confirmCreditCardTransaction: (id: number): Promise<Transaction> =>
    api.post(`/api/transactions/transactions/${id}/confirm_credit_card_transaction/`).then(res => res.data.transaction),
  
  // CSV Import methods
  uploadCSVPreview: (formData: FormData): Promise<{
    headers: string[];
    preview_rows: string[][];
    total_rows: number;
    delimiter: string;
    suggested_mapping: Record<string, number>;
  }> =>
    api.post('/api/transactions/csv-preview/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data),
  
  importCSVTransactions: (formData: FormData): Promise<{
    success: boolean;
    imported_count: number;
    skipped_count: number;
    total_rows: number;
    errors: string[];
  }> =>
    api.post('/api/transactions/csv-import/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data),
};

// Categories API
export const categoriesAPI = {
  getAll: (): Promise<Category[]> =>
    api.get('/api/categories/categories/').then(res => res.data.results || res.data),
  
  getById: (id: number): Promise<Category> =>
    api.get(`/api/categories/categories/${id}/`).then(res => res.data),
  
  create: (data: Partial<Category>): Promise<Category> =>
    api.post('/api/categories/categories/', data).then(res => res.data),
  
  update: (id: number, data: Partial<Category>): Promise<Category> =>
    api.patch(`/api/categories/categories/${id}/`, data).then(res => res.data),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/api/categories/categories/${id}/`).then(res => res.data),

  // Novos endpoints para categorias hierárquicas
  getHierarchy: (): Promise<Category[]> =>
    api.get('/api/categories/categories/hierarchy/').then(res => res.data),
  
  getFlatList: (): Promise<any[]> =>
    api.get('/api/categories/categories/flat-list/').then(res => res.data)
};

// Cost Centers API
export const costCentersAPI = {
  getAll: (): Promise<any[]> =>
    api.get('/api/categories/cost-centers/').then(res => res.data.results || res.data),
  
  getById: (id: number): Promise<any> =>
    api.get(`/api/categories/cost-centers/${id}/`).then(res => res.data),
  
  create: (data: any): Promise<any> =>
    api.post('/api/categories/cost-centers/', data).then(res => res.data),
  
  update: (id: number, data: any): Promise<any> =>
    api.patch(`/api/categories/cost-centers/${id}/`, data).then(res => res.data),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/api/categories/cost-centers/${id}/`).then(res => res.data),
};

// Tags API
export const tagsAPI = {
  getAll: (): Promise<Tag[]> =>
    api.get('/api/categories/tags/').then(res => res.data.results || res.data),
  
  create: (data: Partial<Tag>): Promise<Tag> =>
    api.post('/api/categories/tags/', data).then(res => res.data),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/api/categories/tags/${id}/`).then(res => res.data),
};

// Budgets API
export const budgetsAPI = {
  getAll: (params?: any): Promise<Budget[]> =>
    api.get('/api/budgets/', { params }).then(res => res.data.results || res.data),
  
  getById: (id: number): Promise<Budget> =>
    api.get(`/api/budgets/${id}/`).then(res => res.data),
  
  create: (data: Partial<Budget>): Promise<Budget> =>
    api.post('/api/budgets/', data).then(res => res.data),
  
  update: (id: number, data: Partial<Budget>): Promise<Budget> =>
    api.patch(`/api/budgets/${id}/`, data).then(res => res.data),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/api/budgets/${id}/`).then(res => res.data),
  
  getSummary: (params?: any): Promise<any> =>
    api.get('/api/budgets/summary/', { params }).then(res => res.data),
};

// Credit Card Bills API
export const billsAPI = {
  getAll: (): Promise<CreditCardBill[]> =>
    api.get('/api/transactions/bills/').then(res => res.data.results || res.data),
  
  getById: (id: number): Promise<CreditCardBill> =>
    api.get(`/api/transactions/bills/${id}/`).then(res => res.data),
  
  pay: (id: number, data: { amount: string; from_account: number }): Promise<any> =>
    api.post(`/api/transactions/bills/${id}/pay/`, data).then(res => res.data),
  
  close: (id: number): Promise<any> =>
    api.post(`/api/transactions/bills/${id}/close/`).then(res => res.data),
};

// Reports API
export const reportsAPI = {
  getDashboard: (): Promise<DashboardData> =>
    api.get('/api/reports/dashboard/').then(res => res.data),
  
  getAccountBalanceChart: (): Promise<any[]> =>
    api.get('/api/reports/charts/account-balance/').then(res => res.data),
  
  getCategoryExpenseChart: (params?: any): Promise<any[]> =>
    api.get('/api/reports/charts/category-expense/', { params }).then(res => res.data),
  
  getMonthlyTrend: (): Promise<any[]> =>
    api.get('/api/reports/charts/monthly-trend/').then(res => res.data),
  
  uploadFile: (file: File, accountId: number): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('account', accountId.toString());
    
    return api.post('/api/reports/import/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data);
  },
};

// Credit Card Invoices API
export const invoicesAPI = {
  // Listar todas as faturas
  getAll: (): Promise<CreditCardInvoice[]> =>
    api.get('/api/transactions/invoices/').then(res => res.data),

  // Listar faturas por cartão
  getByCard: (creditCardId: number): Promise<CreditCardInvoice[]> =>
    api.get(`/api/transactions/invoices/by_card/?credit_card_id=${creditCardId}`).then(res => res.data),
  
  // Obter fatura específica
  get: (invoiceId: number): Promise<CreditCardInvoice> =>
    api.get(`/api/transactions/invoices/${invoiceId}/`).then(res => res.data),
  
  // Criar nova fatura
  create: (data: Partial<CreditCardInvoice>): Promise<CreditCardInvoice> =>
    api.post('/api/transactions/invoices/', data).then(res => res.data),
  
  // Fechar fatura
  close: (invoiceId: number): Promise<{ message: string; invoice: CreditCardInvoice }> =>
    api.post(`/api/transactions/invoices/${invoiceId}/close/`).then(res => res.data),
  
  // Reabrir fatura
  reopen: (invoiceId: number): Promise<{ message: string; invoice: CreditCardInvoice }> =>
    api.post(`/api/transactions/invoices/${invoiceId}/reopen/`).then(res => res.data),
  
  // Pagar fatura
  pay: (invoiceId: number, data: { valor: number; conta_origem: number }): Promise<{ message: string; invoice: CreditCardInvoice }> =>
    api.post(`/api/transactions/invoices/${invoiceId}/pay/`, data).then(res => res.data),
  
  // Validar data para transação
  validateDate: (creditCardId: number, date: string): Promise<{ 
    valid: boolean; 
    message: string; 
    invoice_status?: string;
    invoice_month?: string;
  }> =>
    api.post('/api/transactions/validate-date/', { 
      credit_card_id: creditCardId, 
      date 
    }).then(res => res.data),
  
  // Obter melhor data de compra
  getBestPurchaseDate: (creditCardId: number): Promise<{
    credit_card_id: number;
    credit_card_name: string;
    best_date: string;
    best_date_formatted: string;
    invoice_month: string;
    due_date: string;
    due_date_formatted: string;
    days_to_due: number;
    closing_day: number;
    due_day: number;
  }> =>
    api.get(`/api/transactions/best-purchase-date/?credit_card_id=${creditCardId}`).then(res => res.data),

  // Preview da fatura atual do cartão
  getPreview: (creditCardId: number): Promise<any> =>
    api.get(`/api/accounts/credit-cards/${creditCardId}/invoice_preview/`).then(res => res.data),
};

// Automation Rules API
export const automationRulesAPI = {
  getAll: (): Promise<any[]> =>
    api.get('/api/automation-rules/').then(res => res.data.results || res.data),
  
  getById: (id: number): Promise<any> =>
    api.get(`/api/automation-rules/${id}/`).then(res => res.data),
  
  create: (data: any): Promise<any> =>
    api.post('/api/automation-rules/', data).then(res => res.data),
  
  update: (id: number, data: any): Promise<any> =>
    api.patch(`/api/automation-rules/${id}/`, data).then(res => res.data),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/api/automation-rules/${id}/`).then(res => res.data),
  
  toggleActive: (id: number): Promise<any> =>
    api.post(`/api/automation-rules/${id}/toggle_active/`).then(res => res.data),
  
  testRules: (data: any): Promise<any> =>
    api.post('/api/automation-rules/test_all_rules/', data).then(res => res.data),
  
  applyToTransactions: (data: any): Promise<any> =>
    api.post('/api/automation-rules/apply_to_transactions/', data).then(res => res.data),
  
  getByStage: (): Promise<any> =>
    api.get('/api/automation-rules/by_stage/').then(res => res.data),
  
  bulkToggle: (data: { rule_ids: number[], is_active: boolean }): Promise<any> =>
    api.post('/api/automation-rules/bulk_toggle/', data).then(res => res.data),
  
  // Settings
  getSettings: (): Promise<any> =>
    api.get('/api/automation-rules/settings/').then(res => res.data),
  
  updateSettings: (data: any): Promise<any> =>
    api.patch('/api/automation-rules/settings/', data).then(res => res.data),
};

export default api;
