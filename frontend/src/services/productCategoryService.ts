import apiClient from './api';

export interface ProductCategoryData {
  id: number;
  name: string;
}

export const productCategoryService = {
  getAll: async (): Promise<ProductCategoryData[]> => {
    const response = await apiClient.get('/product-categories');
    return response.data;
  },

  create: async (name: string): Promise<ProductCategoryData> => {
    const response = await apiClient.post('/product-categories', { name });
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/product-categories/${id}`);
    return response.data;
  },
};
