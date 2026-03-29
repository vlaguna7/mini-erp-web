import apiClient from './api';

export const dashboardService = {
  getStats: async () => {
    try {
      const response = await apiClient.get('/dashboard/stats');
      return response.data;
    } catch {
      return null;
    }
  },

  getSalesToday: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiClient.get('/sales', {
        params: { date_from: today, date_to: today, limit: 100 },
      });
      const sales = Array.isArray(response.data)
        ? response.data
        : response.data.sales ?? [];
      const total = sales.reduce(
        (sum: number, s: any) => sum + parseFloat(s.total_value || 0),
        0
      );
      return { total, count: sales.length };
    } catch {
      return { total: 0, count: 0 };
    }
  },

  getSalesWeek: async () => {
    try {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      const response = await apiClient.get('/sales', {
        params: {
          date_from: weekAgo.toISOString().split('T')[0],
          date_to: today.toISOString().split('T')[0],
          limit: 500,
        },
      });
      const sales = Array.isArray(response.data)
        ? response.data
        : response.data.sales ?? [];
      const total = sales.reduce(
        (sum: number, s: any) => sum + parseFloat(s.total_value || 0),
        0
      );
      return { total, count: sales.length };
    } catch {
      return { total: 0, count: 0 };
    }
  },

  getRecentActivity: async () => {
    try {
      const [salesRes, entriesRes] = await Promise.allSettled([
        apiClient.get('/sales', { params: { limit: 5 } }),
        apiClient.get('/entries', { params: { limit: 5 } }),
      ]);

      const activities: any[] = [];

      if (salesRes.status === 'fulfilled') {
        const sales = Array.isArray(salesRes.value.data)
          ? salesRes.value.data
          : salesRes.value.data.sales ?? [];
        sales.slice(0, 3).forEach((s: any) => {
          activities.push({
            type: 'sale',
            label: 'Venda realizada',
            detail: `R$ ${parseFloat(s.totalValue || s.total_value || 0).toFixed(2)}`,
            date: s.createdAt || s.created_at || s.saleDate || s.sale_date,
          });
        });
      }

      if (entriesRes.status === 'fulfilled') {
        const entries = Array.isArray(entriesRes.value.data)
          ? entriesRes.value.data
          : entriesRes.value.data.entries ?? [];
        entries.slice(0, 2).forEach((e: any) => {
          activities.push({
            type: 'entry',
            label: e.description || 'Entrada registrada',
            detail: `R$ ${parseFloat(e.value || 0).toFixed(2)}`,
            date: e.createdAt || e.created_at || e.entryDate || e.entry_date,
          });
        });
      }

      activities.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      return activities.slice(0, 5);
    } catch {
      return [];
    }
  },
};