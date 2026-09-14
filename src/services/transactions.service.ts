import api from './api';

export const TransactionService = {
  async getAll() {
    const response = await api.get('/transactions');
    return response.data;
  },

  async create(data: any) {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  async autoParse(smsText: string) {
    const response = await api.post('/transactions/auto-parse', { smsText });
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  }
};

export const DashboardService = {
  async getStats() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  }
};
