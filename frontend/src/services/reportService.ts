import apiClient from './api';

export interface ReportFilters {
  date_from?: string;
  date_to?: string;
  commission_rate?: number;
  category_id?: number;
  brand_id?: number;
  collection_id?: number;
  supplier_id?: number;
  seller_id?: number;
  group_by?: string;
}

const get = async (path: string, filters?: ReportFilters) => {
  const params: Record<string, string> = {};
  if (filters) {
    for (const [k, v] of Object.entries(filters)) {
      if (v !== undefined && v !== null && v !== '') params[k] = String(v);
    }
  }
  const { data } = await apiClient.get(`/reports${path}`, { params });
  return data;
};

export const reportService = {
  salesReport: (f?: ReportFilters) => get('/sales', f),
  commissionsReport: (f?: ReportFilters) => get('/commissions', f),
  salesChannelsReport: (f?: ReportFilters) => get('/sales-channels', f),
  dailyCashReport: (f?: ReportFilters) => get('/daily-cash', f),
  paymentMethodsReport: (f?: ReportFilters) => get('/payment-methods', f),
  cashFlowReport: (f?: ReportFilters) => get('/cash-flow', f),
  productPerformanceReport: (f?: ReportFilters) => get('/product-performance', f),
  salesByCategoryReport: (f?: ReportFilters) => get('/sales-by-category', f),
  stockInventoryReport: () => get('/stock-inventory'),
  clientReport: (f?: ReportFilters) => get('/clients', f),
  clientLifecycleReport: () => get('/client-lifecycle'),
  clientCreditsReport: (f?: ReportFilters) => get('/client-credits', f),
};
