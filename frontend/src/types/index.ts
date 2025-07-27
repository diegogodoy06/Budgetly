export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

export interface Account {
  id: number;
  name: string;
  account_type: 'checking' | 'savings' | 'wallet' | 'credit_card';
  account_type_display: string;
  initial_balance: string;
  current_balance: string;
  credit_limit?: string;
  closing_day?: number;
  due_day?: number;
  available_credit?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  account: number;
  account_name: string;
  to_account?: number;
  to_account_name?: string;
  transaction_type: 'income' | 'expense' | 'transfer';
  transaction_type_display: string;
  amount: string;
  description: string;
  notes: string;
  date: string;
  category?: number;
  category_name?: string;
  tags: number[];
  tags_data: Tag[];
  installments: number;
  installment_number: number;
  parent_transaction?: number;
  recurrence_type: 'none' | 'monthly';
  recurrence_end_date?: string;
  is_processed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: number;
  category: number;
  category_name: string;
  month: number;
  year: number;
  planned_amount: string;
  spent_amount: string;
  remaining_amount: string;
  percentage_used: number;
  is_over_budget: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditCardBill {
  id: number;
  account: number;
  account_name: string;
  month: number;
  year: number;
  closing_date: string;
  due_date: string;
  total_amount: string;
  paid_amount: string;
  remaining_amount: string;
  status: 'open' | 'closed' | 'paid' | 'overdue';
  status_display: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardData {
  total_accounts: number;
  total_balance: string;
  monthly_income: string;
  monthly_expense: string;
  pending_bills: number;
  active_budgets: number;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}
