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
  zipCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  observations?: string;
}

export interface ClientRecord extends ClientData {
  id: number;
  creditBalance?: string | number;
  createdAt?: string;
  updatedAt?: string;
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

  getClientPurchases: async (id: number, page: number = 1, limit: number = 50) => {
    const response = await apiClient.get(`/clients/${id}/purchases`, {
      params: { page, limit },
    });
    return response.data as {
      sales: ClientPurchase[];
      total: number;
      stats: {
        totalSales: number;
        totalSpent: number;
        averageTicket: number;
        firstPurchaseDate: string | null;
        lastPurchaseDate: string | null;
      };
      page: number;
      limit: number;
      totalPages: number;
    };
  },
};

export interface ClientPurchaseItem {
  id: number;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  product: { id: number; name: string; code: string | null };
}

export interface ClientPurchasePayment {
  id: number;
  method: string;
  label: string;
  amount: string;
  installments: number | null;
  cardBrand: string | null;
}

export interface ClientPurchase {
  id: number;
  totalValue: string;
  subtotal: string;
  discount: string;
  surcharge: string;
  presenceIndicator: string | null;
  saleCategory: string | null;
  observation: string | null;
  saleDate: string;
  createdAt: string;
  seller: { id: number; name: string } | null;
  items: ClientPurchaseItem[];
  payments: ClientPurchasePayment[];
}
