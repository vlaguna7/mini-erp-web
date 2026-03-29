import apiClient from './api';

export interface ClientData {
  name: string;
  personType?: string;
  cpfCnpj?: string;
  gender?: string;
  birthDate?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  email?: string;
  category?: string;
  photo?: string;
}

export const clientService = {
  getClients: async (page: number = 1, limit: number = 100) => {
    const response = await apiClient.get('/clients', { params: { page, limit } });
    return response.data;
  },

  getClient: async (id: number) => {
    const response = await apiClient.get(`/clients/${id}`);
    return response.data;
  },

  createClient: async (data: ClientData) => {
    const response = await apiClient.post('/clients', data);
    return response.data;
  },

  updateClient: async (id: number, data: Partial<ClientData>) => {
    const response = await apiClient.put(`/clients/${id}`, data);
    return response.data;
  },

  deleteClient: async (id: number) => {
    const response = await apiClient.delete(`/clients/${id}`);
    return response.data;
  },
};
