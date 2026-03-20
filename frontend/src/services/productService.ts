import apiClient from './api';

export const authService = {
  register: async (name: string, email: string, password: string) => {
    const response = await apiClient.post('/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },
};

export const productService = {
  getProducts: async (page: number = 1, limit: number = 100) => {
    try {
      const response = await apiClient.get('/products', {
        params: { page, limit },
      });
      // Normalize response to always return array
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data.products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  getProduct: async (id: string) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (productData: any) => {
    const response = await apiClient.post('/products', productData);
    return response.data;
  },

  updateProduct: async (id: string, productData: any) => {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  getLowStockProducts: async () => {
    const response = await apiClient.get('/products/low-stock');
    return response.data;
  },
};
