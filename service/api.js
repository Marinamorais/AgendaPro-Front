import axios from 'axios';

// ... (instância do apiClient e interceptor permanecem os mesmos)
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const getErrorMessage = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
};


// Objeto que encapsula todas as chamadas da API
export const api = {
  // ... (métodos get, getById, create, update, delete permanecem os mesmos)
  get: async (endpoint, params = {}) => {
    try {
      const response = await apiClient.get(`/${endpoint}`, { params });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
  
  getById: async (endpoint, id) => {
    try {
      const response = await apiClient.get(`/${endpoint}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  create: async (endpoint, data) => {
    try {
      const response = await apiClient.post(`/${endpoint}`, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  update: async (endpoint, id, data) => {
    try {
      const response = await apiClient.put(`/${endpoint}/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  delete: async (endpoint, id) => {
    try {
      await apiClient.delete(`/${endpoint}/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * NOVA FUNÇÃO: Busca agendamentos com filtros específicos.
   * @param {object} params - Parâmetros de filtro.
   * @param {string} params.establishment_id - ID do estabelecimento (obrigatório).
   * @param {string} [params.client_id] - Filtrar por ID do cliente.
   * @param {string} [params.startDate] - Filtrar por data de início (formato YYYY-MM-DD).
   * @returns {Promise<Array>}
   */
  getAppointments: async (params) => {
    try {
      const response = await apiClient.get('/appointments', { params });
      // A API retorna com informações aninhadas, vamos simplificar
      return response.data.map(app => ({
          ...app,
          client_name: app.client?.full_name || 'N/A',
          service_name: app.service?.name || 'N/A'
      }));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getDashboardMetrics: async (establishmentId) => {
    try {
        const [clients, professionals, products, sales] = await Promise.all([
            api.get('clients', { establishment_id: establishmentId }),
            api.get('professionals', { establishment_id: establishmentId }),
            api.get('products', { establishment_id: establishmentId }),
            api.get('sales', { establishment_id: establishmentId }),
        ]);
        
        // Cálculo do faturamento total a partir das vendas
        const totalRevenue = sales.reduce((acc, sale) => acc + parseFloat(sale.final_amount || 0), 0);

        return {
            totalClients: clients.length,
            totalProfessionals: professionals.length,
            totalProducts: products.length,
            totalRevenue: totalRevenue,
            recentClients: clients.slice(0, 5) // Pega os 5 clientes mais recentes
        };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};