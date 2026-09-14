import api from './api';
import { Category } from './categories.service';

export interface BudgetCategory {
  budgetId: string;
  categoryId: string;
  category: Category;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  month: number;
  year: number;
  categories: BudgetCategory[];
  spent: number;
  percentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryBreakdown {
  category: Category;
  spent: number;
  transactions: any[];
}

export interface BudgetDetail extends Budget {
  categoryBreakdown: CategoryBreakdown[];
  comparison: {
    prevSpent: number;
    changePercent: number;
    changeDiff: number;
  };
}

export const BudgetsService = {
  async getAll(month?: number, year?: number): Promise<Budget[]> {
    const params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await api.get('/budgets', { params });
    return response.data;
  },

  async getOne(id: string): Promise<BudgetDetail> {
    const response = await api.get(`/budgets/${id}`);
    return response.data;
  },

  async create(data: {
    name: string;
    amount: number;
    month: number;
    year: number;
    categoryIds: string[];
  }): Promise<Budget> {
    const response = await api.post('/budgets', data);
    return response.data;
  },

  async update(
    id: string,
    data: { name?: string; amount?: number; categoryIds?: string[] },
  ): Promise<Budget> {
    const response = await api.patch(`/budgets/${id}`, data);
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`);
  },
};
