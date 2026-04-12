import apiClient from './api';

export interface FinancialTransaction {
  id: number;
  type: string;
  category: string | null;
  description: string;
  value: number;
  date: string;
  paymentMethod: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

export interface RecurringExpense {
  id: number;
  description: string;
  category: string | null;
  value: number;
  frequency: string;
  dayOfMonth: number | null;
  startDate: string;
  endDate: string | null;
  active: boolean;
  notes: string | null;
  createdAt: string;
}

export const financialService = {
  // Transações
  getTransactions: async (filters?: { type?: string; date_from?: string; date_to?: string }): Promise<FinancialTransaction[]> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    const { data } = await apiClient.get(`/financial/transactions?${params}`);
    return data;
  },

  createTransaction: async (body: {
    type: string;
    description: string;
    value: number;
    date: string;
    category?: string;
    paymentMethod?: string;
    status?: string;
    notes?: string;
  }): Promise<FinancialTransaction> => {
    const { data } = await apiClient.post('/financial/transactions', body);
    return data;
  },

  updateTransaction: async (id: number, body: Partial<FinancialTransaction>): Promise<FinancialTransaction> => {
    const { data } = await apiClient.put(`/financial/transactions/${id}`, body);
    return data;
  },

  deleteTransaction: async (id: number): Promise<void> => {
    await apiClient.delete(`/financial/transactions/${id}`);
  },

  // Despesas recorrentes
  getRecurringExpenses: async (): Promise<RecurringExpense[]> => {
    const { data } = await apiClient.get('/financial/recurring');
    return data;
  },

  createRecurringExpense: async (body: {
    description: string;
    value: number;
    frequency: string;
    startDate: string;
    category?: string;
    dayOfMonth?: number;
    endDate?: string;
    notes?: string;
  }): Promise<RecurringExpense> => {
    const { data } = await apiClient.post('/financial/recurring', body);
    return data;
  },

  updateRecurringExpense: async (id: number, body: Partial<RecurringExpense>): Promise<RecurringExpense> => {
    const { data } = await apiClient.put(`/financial/recurring/${id}`, body);
    return data;
  },

  deleteRecurringExpense: async (id: number): Promise<void> => {
    await apiClient.delete(`/financial/recurring/${id}`);
  },
};
