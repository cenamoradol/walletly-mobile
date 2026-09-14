import api from './api';

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  allowedType: string;
  balance: number;
}

export const PaymentsService = {
  getAll: async (): Promise<PaymentMethod[]> => {
    const response = await api.get('/payments');
    return response.data;
  },

  create: async (data: { name: string; type: string; allowedType?: string; balance?: number }): Promise<PaymentMethod> => {
    const response = await api.post('/payments', data);
    return response.data;
  },

  update: async (id: string, data: { name?: string; type?: string; allowedType?: string; balance?: number }): Promise<PaymentMethod> => {
    const response = await api.patch(`/payments/${id}`, data);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/payments/${id}`);
  },
};
