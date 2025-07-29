import axios from 'axios';
import type { 
  User, Account, Transaction, Category, Tag, Budget, CreditCardBill,
  LoginRequest, RegisterRequest, AuthResponse, DashboardData,
  CreditCard, CreditCardFormData
} from '@/types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Só redireciona se não estiver já na página de login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    api.post('/api/auth/login/', data).then(res => res.data),
  
  register: (data: RegisterRequest): Promise<AuthResponse> =>
    api.post('/api/auth/register/', data).then(res => res.data),
  
  logout: (): Promise<void> =>
    api.post('/api/auth/logout/').then(res => res.data),
  
  getProfile: (): Promise<User> =>
    api.get('/api/auth/profile/').then(res => res.data),
};

// Accounts API
export const accountsAPI = {
  getAll: (): Promise<Account[]> =>
    api.get('/api/accounts/').then(res => res.data.results || res.data),
  
  getById: (id: number): Promise<Account> =>
    api.get(`/api/accounts/${id}/`).then(res => res.data),
  
  create: (data: Partial<Account>): Promise<Account> =>
    api.post('/api/accounts/', data).then(res => res.data),
  
  update: (id: number, data: Partial<Account>): Promise<Account> =>
    api.patch(`/api/accounts/${id}/`, data).then(res => res.data),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/api/accounts/${id}/`).then(res => res.data),
  
  getBalances: (): Promise<Account[]> =>
    api.get('/api/accounts/balances/').then(res => res.data),
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
    api.get('/api/transactions/', { params }).then(res => res.data.results || res.data),
  
  getById: (id: number): Promise<Transaction> =>
    api.get(`/api/transactions/${id}/`).then(res => res.data),
  
  create: (data: any): Promise<Transaction> =>
    api.post('/api/transactions/', data).then(res => res.data),
  
  update: (id: number, data: any): Promise<Transaction> =>
    api.put(`/api/transactions/${id}/`, data).then(res => res.data),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/api/transactions/${id}/`).then(res => res.data),
  
  getByCreditCard: (creditCardId: number, params?: any): Promise<Transaction[]> =>
    api.get('/api/transactions/', { 
      params: { credit_card: creditCardId, ...params } 
    }).then(res => res.data.results || res.data),
  
  summary: (params?: any): Promise<any> =>
    api.get('/api/transactions/summary/', { params }).then(res => res.data),
  
  byCategory: (params?: any): Promise<any> =>
    api.get('/api/transactions/by-category/', { params }).then(res => res.data),
};

// Categories API
export const categoriesAPI = {
  getAll: (): Promise<Category[]> =>
    api.get('/api/categories/').then(res => res.data.results || res.data),
  
  getById: (id: number): Promise<Category> =>
    api.get(`/api/categories/${id}/`).then(res => res.data),
  
  create: (data: Partial<Category>): Promise<Category> =>
    api.post('/api/categories/', data).then(res => res.data),
  
  update: (id: number, data: Partial<Category>): Promise<Category> =>
    api.patch(`/api/categories/${id}/`, data).then(res => res.data),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/api/categories/${id}/`).then(res => res.data),
};

// Tags API
export const tagsAPI = {
  getAll: (): Promise<Tag[]> =>
    api.get('/api/tags/').then(res => res.data.results || res.data),
  
  create: (data: Partial<Tag>): Promise<Tag> =>
    api.post('/api/tags/', data).then(res => res.data),
  
  delete: (id: number): Promise<void> =>
    api.delete(`/api/tags/${id}/`).then(res => res.data),
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

export default api;
