/**
 * @module service/api
 * @description Módulo centralizado para todas as comunicações com a API backend.
 * Inclui interceptador para autenticação JWT e tratamento de erros robusto.
 */
import axios from 'axios';

// --- Instância do Axios ---
// Cria uma instância base do Axios que será usada em todas as requisições.
// Isso centraliza a URL base, headers e interceptadores.
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interceptador de Requisição ---
// Antes de cada requisição ser enviada, este interceptador é executado.
// Sua função é buscar o token de autenticação no localStorage e, se existir,
// injetá-lo no header 'Authorization'.
apiClient.interceptors.request.use(
  (config) => {
    // A verificação `typeof window !== 'undefined'` garante que o código
    // só tente acessar o localStorage quando estiver no ambiente do navegador.
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

// --- Tratamento de Erro Aprimorado ---
/**
 * Analisa um objeto de erro do Axios e retorna a mensagem mais relevante.
 * Diferencia erros de resposta do servidor, erros de conexão e outros.
 * @param {any} error - O objeto de erro capturado.
 * @returns {string} A mensagem de erro formatada.
 */
const getErrorMessage = (error) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // O servidor respondeu com um erro (status 4xx ou 5xx).
      // Prioriza a mensagem de erro vinda do corpo da resposta da API.
      return error.response.data?.message || error.response.data?.error || `Erro ${error.response.status}: Requisição falhou.`;
    } else if (error.request) {
      // A requisição foi feita, mas não houve resposta (ex: servidor offline).
      return 'Não foi possível conectar ao servidor. Verifique sua conexão de rede.';
    }
  }
  // Para erros genéricos ou que não são do Axios.
  return error.message || 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
};

// --- Objeto de Serviço da API ---
// Contém todos os métodos para interagir com os endpoints da API.
export const api = {
  /**
   * Busca uma lista de recursos de um endpoint.
   * @param {string} endpoint - O endpoint da API (ex: 'clients').
   * @param {object} [params={}] - Parâmetros de query (ex: { page: 1 }).
   * @returns {Promise<any>}
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
   * Busca um recurso específico pelo seu ID.
   * @param {string} endpoint - O endpoint da API.
   * @param {string|number} id - O ID do recurso.
   * @returns {Promise<any>}
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
   * Cria um novo recurso.
   * @param {string} endpoint - O endpoint da API.
   * @param {object} data - Os dados para o novo recurso.
   * @returns {Promise<any>}
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
   * Atualiza um recurso existente.
   * @param {string} endpoint - O endpoint da API.
   * @param {string|number} id - O ID do recurso a ser atualizado.
   * @param {object} data - Os novos dados para o recurso.
   * @returns {Promise<any>}
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
   * Deleta um recurso.
   * @param {string} endpoint - O endpoint da API.
   * @param {string|number} id - O ID do recurso a ser deletado.
   * @returns {Promise<void>}
   */
  delete: async (endpoint, id) => {
    try {
      await apiClient.delete(`/${endpoint}/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Busca e formata a lista de agendamentos.
   * @param {object} params - Parâmetros de query para filtrar agendamentos.
   * @returns {Promise<Array<object>>}
   */
  getAppointments: async (params) => {
    try {
      const response = await apiClient.get('/appointments', { params });
      return response.data.map(app => ({
          ...app,
          client_name: app.client?.full_name || 'N/A',
          service_name: app.service?.name || 'N/A'
      }));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * Endpoint Mestre para o Dashboard.
   * ATENÇÃO: Atualmente, esta função realiza múltiplas chamadas e agrega os dados
   * no frontend. O ideal é que o backend forneça um único endpoint (ex: /dashboard)
   * que retorne todos esses dados já processados.
   * @param {string} establishmentId - O ID do estabelecimento.
   * @param {string} [period='monthly'] - O período a ser analisado ('daily', 'weekly', 'monthly').
   * @returns {Promise<object>} Objeto consolidado com KPIs, dados para gráficos e tabelas.
   */
  getDashboardData: async (establishmentId, period = 'monthly') => {
    if (!establishmentId) {
      throw new Error("ID do Estabelecimento é obrigatório para buscar dados do dashboard.");
    }
    try {
      // Simulação da agregação no frontend, pois o backend não possui a rota consolidada.
      // O ideal seria uma única chamada: `apiClient.get(`/dashboard/${establishmentId}`, { params: { period } })`
      console.log(`Buscando dados do dashboard para o período: ${period}`);
      const [sales, appointments, clients, professionals] = await Promise.all([
        api.get('sales', { establishment_id: establishmentId }),
        api.get('appointments', { establishment_id: establishmentId }),
        api.get('clients', { establishment_id: establishmentId }),
        api.get('professionals', { establishment_id: establishmentId })
      ]);

      // --- Início da Lógica de Processamento que Deveria Estar no Backend ---
      const now = new Date();
      let startDate;
      if (period === 'daily') startDate = new Date(now.setHours(0, 0, 0, 0));
      else if (period === 'weekly') startDate = new Date(new Date().setDate(now.getDate() - 7));
      else startDate = new Date(now.getFullYear(), now.getMonth(), 1);

      const filteredSales = sales.filter(s => new Date(s.transaction_date) >= startDate);
      const filteredAppointments = appointments.filter(a => new Date(a.start_time) >= startDate);

      const totalRevenue = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.final_amount), 0);
      const lostRevenue = filteredAppointments
        .filter(a => ['Cancelado', 'No-Show'].includes(a.status))
        .reduce((sum, a) => sum + parseFloat(a.service?.price || 0), 0);
      const avgTicket = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

      const revenueByDay = {};
      filteredAppointments.forEach(app => {
        const day = new Date(app.start_time).toLocaleDateString('pt-BR', { weekday: 'short' });
        if (!revenueByDay[day]) revenueByDay[day] = { name: day, Receita: 0, Perdido: 0 };
        if (app.status === 'Concluído') revenueByDay[day].Receita += parseFloat(app.service?.price || 0);
        if (['Cancelado', 'No-Show'].includes(app.status)) revenueByDay[day].Perdido += parseFloat(app.service?.price || 0);
      });
      
      const cancellationsByReason = { 'Cliente': 0, 'Profissional': 0, 'Outros': 0 };
      filteredAppointments.forEach(a => {
        if (a.status === 'Cancelado') cancellationsByReason['Cliente']++;
      });
      // --- Fim da Lógica de Processamento ---

      return {
        kpis: {
          totalRevenue,
          totalAppointments: filteredAppointments.length,
          occupancy: 50, // Simulado
          lostRevenue,
          avgTicket,
        },
        charts: {
          revenue: Object.values(revenueByDay),
          cancellations: Object.entries(cancellationsByReason).map(([name, value]) => ({ name, value })),
        },
        tables: {
          upcomingAppointments: appointments.filter(a => new Date(a.start_time) >= new Date()).slice(0, 5),
          antiChurn: clients.filter(c => c.last_appointment && (new Date() - new Date(c.last_appointment)) / (1000 * 3600 * 24) > 45).slice(0, 5),
          topProfessionals: professionals.slice(0, 3).map(p => ({ ...p, revenue: Math.random() * 5000 })), // Simulado
          topServices: sales.slice(0, 3).map(s => ({ ...s, name: s.service?.name, count: Math.floor(Math.random() * 20) })), // Simulado
        }
      };

    } catch (error) {
      // Se qualquer uma das chamadas falhar, o erro será capturado e tratado aqui.
      throw new Error(getErrorMessage(error));
    }
  },
};