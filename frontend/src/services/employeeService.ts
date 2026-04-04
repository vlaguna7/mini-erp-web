import apiClient from './api';

export interface EmployeeData {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  active: boolean;
}

export const employeeService = {
  getAll: async (): Promise<EmployeeData[]> => {
    const response = await apiClient.get('/employees');
    return response.data;
  },

  create: async (data: { name: string; email?: string; phone?: string; role?: string }): Promise<EmployeeData> => {
    const response = await apiClient.post('/employees', data);
    return response.data;
  },

  update: async (id: number, data: Partial<EmployeeData>): Promise<EmployeeData> => {
    const response = await apiClient.put(`/employees/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/employees/${id}`);
    return response.data;
  },
};
