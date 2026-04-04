import apiClient from './api';

export interface CreateSalePayload {
  client_id: number;
  seller_id?: number | null;
  items: { product_id: number; quantity: number; unit_price: number }[];
  payments: { method: string; label: string; amount: number; installments?: number; cardBrand?: string }[];
  subtotal: number;
  discount: number;
  surcharge: number;
  total: number;
  presence_indicator?: string;
  sale_category?: string;
  observation?: string;
}

export const saleService = {
  async createSale(data: CreateSalePayload) {
    const response = await apiClient.post('/sales', data);
    return response.data;
  },

  async getSales(page = 1, limit = 20) {
    const response = await apiClient.get('/sales', { params: { page, limit } });
    return response.data;
  },

  async getSaleById(id: number) {
    const response = await apiClient.get(`/sales/${id}`);
    return response.data;
  },
};
