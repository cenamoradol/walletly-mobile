import api from './api';

export interface Category {
  id: string;
  name: string;
  type: 'EXPENSE' | 'INCOME';
  icon?: string;
  color?: string;
  parentId?: string;
  children?: Category[];
}

export const CategoriesService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  create: async (data: { name: string; type: 'EXPENSE' | 'INCOME'; icon?: string; color?: string }): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  update: async (id: string, data: { name?: string; type?: 'EXPENSE' | 'INCOME'; icon?: string; color?: string }): Promise<Category> => {
    const response = await api.patch(`/categories/${id}`, data);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
