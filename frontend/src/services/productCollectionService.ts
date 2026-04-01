import apiClient from './api';

export interface ProductCollectionData {
  id: number;
  name: string;
}

export const productCollectionService = {
  getAll: async (): Promise<ProductCollectionData[]> => {
    const response = await apiClient.get('/product-collections');
    return response.data;
  },

  create: async (name: string): Promise<ProductCollectionData> => {
    const response = await apiClient.post('/product-collections', { name });
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/product-collections/${id}`);
    return response.data;
  },
};
