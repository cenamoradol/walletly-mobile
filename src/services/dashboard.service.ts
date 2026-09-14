import api from './api';

export interface DashboardStats {
  user: {
    name: string;
  };
  totalBalance: number;
  monthlyExpenses: number;
  monthlyIncome: number;
  budgetProgress: Array<{
    category: string;
    limit: number;
    spent: number;
    remaining: number;
  }>;
  recentTransactions: Array<{
    id: string;
    description: string;
    amount: number;
    type: 'EXPENSE' | 'INCOME';
    date: string;
    location?: string;
    category?: {
        name: string;
        icon?: string;
    };
  }>;
}

export const DashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};
