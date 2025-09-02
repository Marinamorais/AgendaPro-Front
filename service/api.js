import axios from 'axios';

// ... (código existente do apiClient e getErrorMessage)
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


export const api = {
  // ... (métodos existentes: get, getById, create, update, delete, getAppointments)
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
   * NOVO: Endpoint Mestre para o Dashboard.
   * Busca e processa todos os dados necessários para o dashboard de uma vez só.
   * @param {string} establishmentId - O ID do estabelecimento.
   * @param {string} period - O período a ser analisado ('daily', 'weekly', 'monthly').
   * @returns {Promise<object>}
   */
  getDashboardData: async (establishmentId, period = 'monthly') => {
    if (!establishmentId) {
      throw new Error("ID do Estabelecimento é obrigatório para buscar dados do dashboard.");
    }
    try {
      // Em um cenário real, isso seria uma única chamada:
      // const response = await apiClient.get(`/dashboard/${establishmentId}`, { params: { period } });
      // return response.data;

      // Como o backend não tem essa rota, vamos simular a agregação aqui no frontend.
      // Isso demonstra a estrutura de dados que o backend deveria idealmente retornar.
      console.log(`Buscando dados do dashboard para o período: ${period}`);
      const [sales, appointments, clients, professionals] = await Promise.all([
        api.get('sales', { establishment_id: establishmentId }),
        api.get('appointments', { establishment_id: establishmentId }),
        api.get('clients', { establishment_id: establishmentId }),
        api.get('professionals', { establishment_id: establishmentId })
      ]);

      // --- Processamento dos Dados (Lógica que estaria no Backend) ---
      const now = new Date();
      let startDate;
      if (period === 'daily') startDate = new Date(now.setHours(0, 0, 0, 0));
      else if (period === 'weekly') startDate = new Date(now.setDate(now.getDate() - 7));
      else startDate = new Date(now.getFullYear(), now.getMonth(), 1);

      const filteredSales = sales.filter(s => new Date(s.transaction_date) >= startDate);
      const filteredAppointments = appointments.filter(a => new Date(a.start_time) >= startDate);

      // KPIs
      const totalRevenue = filteredSales.reduce((sum, sale) => sum + parseFloat(sale.final_amount), 0);
      const concludedAppointments = filteredAppointments.filter(a => a.status === 'Concluído');
      const lostRevenue = filteredAppointments
        .filter(a => ['Cancelado', 'No-Show'].includes(a.status))
        .reduce((sum, a) => sum + parseFloat(a.service?.price || 0), 0);
      const avgTicket = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
      
      // Dados para Gráficos
      const revenueByDay = {};
      filteredAppointments.forEach(app => {
        const day = new Date(app.start_time).toLocaleDateString('pt-BR', { weekday: 'short' });
        if (!revenueByDay[day]) revenueByDay[day] = { name: day, Receita: 0, Perdido: 0 };
        if (app.status === 'Concluído') revenueByDay[day].Receita += parseFloat(app.service?.price || 0);
        if (['Cancelado', 'No-Show'].includes(app.status)) revenueByDay[day].Perdido += parseFloat(app.service?.price || 0);
      });

      const cancellationsByReason = { 'Cliente': 0, 'Profissional': 0, 'Outros': 0 }; // Simulado, pois a API não tem motivo
      filteredAppointments.forEach(a => {
        if (a.status === 'Cancelado') cancellationsByReason['Cliente']++;
      });
      
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
          antiChurn: clients.filter(c => c.last_appointment && (new Date() - new Date(c.last_appointment)) / (1000 * 3600 * 24) > 45).slice(0, 5), // Clientes que não voltam há 45 dias
          topProfessionals: professionals.slice(0,3).map(p => ({...p, revenue: Math.random() * 5000})), // Simulado
          topServices: sales.slice(0,3).map(s => ({...s, name: s.service?.name, count: Math.floor(Math.random() * 20)})), // Simulado
        }
      };

    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};