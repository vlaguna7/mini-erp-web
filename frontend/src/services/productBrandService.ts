import apiClient from './api';

export interface ProductBrandData {
  id: number;
  name: string;
}

export const productBrandService = {
  getAll: async (): Promise<ProductBrandData[]> => {
    const response = await apiClient.get('/product-brands');
    return response.data;
  },

  create: async (name: string): Promise<ProductBrandData> => {
    const response = await apiClient.post('/product-brands', { name });
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/product-brands/${id}`);
    return response.data;
  },
};
