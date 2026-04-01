import apiClient from './api';

export interface SupplierData {
  id: number;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
}

export const supplierService = {
  getAll: async (): Promise<SupplierData[]> => {
    const response = await apiClient.get('/suppliers');
    return response.data;
  },

  create: async (data: { name: string; cnpj?: string; email?: string; phone?: string }): Promise<SupplierData> => {
    const response = await apiClient.post('/suppliers', data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/suppliers/${id}`);
    return response.data;
  },
};
