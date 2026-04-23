import apiClient from './api';

export type ResolutionMethod = 'TROCA' | 'DEVOLVER_PAGAMENTO' | 'GERAR_CREDITO';

export interface CreateReturnPayload {
  saleId: number;
  items: { saleItemId: number; quantity: number }[];
  resolutionMethod: ResolutionMethod;
  clientId?: number | null;
  observation?: string | null;
  returnDate?: string;
}

export interface CreateReturnResponse {
  saleId: number;
  resolutionMethod: ResolutionMethod;
  resolutionLabel: string;
  totalRefund: number;
  returnIds: number[];
  financialTransactionId: number | null;
  clientId: number | null;
}

export const returnService = {
  async create(payload: CreateReturnPayload): Promise<CreateReturnResponse> {
    const { data } = await apiClient.post('/returns', payload);
    return data;
  },

  async getBySale(saleId: number) {
    const { data } = await apiClient.get(`/returns/by-sale/${saleId}`);
    return data.returns as Array<{
      id: number;
      productId: number;
      quantity: number;
      product: { id: number; name: string; code: string };
    }>;
  },
};
