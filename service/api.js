import axios from 'axios';

// Instância centralizada do Axios para configurar a base da API
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor que adiciona o token de autenticação a cada requisição
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

// Função aprimorada para extrair a mensagem de erro mais clara
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
  /**
   * Busca uma lista de recursos de um endpoint.
   * @param {string} endpoint - O nome do recurso (ex: 'professionals', 'clients').
   * @param {object} [params] - Parâmetros de query string (ex: { establishment_id: '...' }).
   * @returns {Promise<Array>}
   */
  get: async (endpoint, params = {}) => {
    try {
      const response = await apiClient.get(`/${endpoint}`, { params });
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Busca um único item pelo ID.
   * @param {string} endpoint - O nome do recurso.
   * @param {string} id - O ID do item.
   * @returns {Promise<object>}
   */
  getById: async (endpoint, id) => {
    try {
      const response = await apiClient.get(`/${endpoint}/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Cria um novo item.
   * @param {string} endpoint - O nome do recurso.
   * @param {object} data - Os dados do novo item.
   * @returns {Promise<object>}
   */
  create: async (endpoint, data) => {
    try {
      const response = await apiClient.post(`/${endpoint}`, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Atualiza um item existente.
   * @param {string} endpoint - O nome do recurso.
   * @param {string} id - O ID do item a ser atualizado.
   * @param {object} data - Os novos dados.
   * @returns {Promise<object>}
   */
  update: async (endpoint, id, data) => {
    try {
      const response = await apiClient.put(`/${endpoint}/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Deleta um item.
   * @param {string} endpoint - O nome do recurso.
   * @param {string} id - O ID do item a ser deletado.
   * @returns {Promise<void>}
   */
  delete: async (endpoint, id) => {
    try {
      await apiClient.delete(`/${endpoint}/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  // Você pode adicionar chamadas específicas aqui
  getDashboardMetrics: async (establishmentId) => {
    try {
        // Simulação: no futuro, esta seria uma chamada a um endpoint como /dashboard/:id/metrics
        // que agregaria os dados no backend para performance.
        const [clients, professionals, products] = await Promise.all([
            api.get('clients', { establishment_id: establishmentId }),
            api.get('professionals', { establishment_id: establishmentId }),
            api.get('products', { establishment_id: establishmentId })
        ]);
        
        return {
            totalClients: clients.length,
            totalProfessionals: professionals.length,
            totalProducts: products.length,
            // Outras métricas poderiam ser calculadas aqui ou no backend
            monthlyRevenue: 55794.00, // Exemplo
        };
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};