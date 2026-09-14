import api from './api';

export interface Plan {
  id: string;
  name: string;
  creditsPerMonth: number;
  price: number;
  isActive: boolean;
}

export const PlansService = {
  getPlans: async (): Promise<Plan[]> => {
    const response = await api.get('/plans');
    return response.data;
  },
};
