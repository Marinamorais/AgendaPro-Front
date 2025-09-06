/**
 * @module service/api
 * @version 6.0 (Definitivo)
 * @description SDK completo e autossuficiente para a API AgendaPro.
 * Esta é a única camada de comunicação necessária para toda a aplicação.
 */
import axios from 'axios';
import { format } from 'date-fns';

// --- CONFIGURAÇÃO CENTRAL DA INSTÂNCIA AXIOS ---
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://agendapro-back.vercel.app',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// --- INTERCEPTADORES GLOBAIS ---
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/'; // Redirecionamento forçado para o login
      }
    }
    return Promise.reject(error);
  }
);

// --- CACHE INTELIGENTE COM TTL (Time-To-Live) ---
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

const getWithCache = async (key, fetcher) => {
  const now = Date.now();
  if (cache.has(key)) {
    const cached = cache.get(key);
    if (now - cached.timestamp < CACHE_TTL) return cached.data;
  }
  const data = await fetcher();
  cache.set(key, { data, timestamp: now });
  return data;
};

const invalidateCache = (prefix) => {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
};

// --- DIAGNÓSTICO DE ERROS AVANÇADO ---
const getErrorMessage = (error) => {
  if (!axios.isAxiosError(error)) return error.message || 'Ocorreu um erro desconhecido.';
  if (!error.response) return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
  const { status, data } = error.response;
  return data?.message || data?.error || `Erro no servidor (Código: ${status}).`;
};

// --- WRAPPER DE REQUISIÇÃO PADRONIZADO ---
const handleRequest = async (request) => {
  try {
    const response = await request;
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// --- FACTORY FUNCTION PARA MÓDULOS CRUD ---
function createCrudModule(endpoint) {
  return {
    getAll: (params) => {
      const cacheKey = `${endpoint}-${JSON.stringify(params || {})}`;
      return getWithCache(cacheKey, () => handleRequest(apiClient.get(`/${endpoint}`, { params })));
    },
    getById: (id) => {
      const cacheKey = `${endpoint}-${id}`;
      return getWithCache(cacheKey, () => handleRequest(apiClient.get(`/${endpoint}/${id}`)));
    },
    create: async (data) => {
      const result = await handleRequest(apiClient.post(`/${endpoint}`, data));
      invalidateCache(endpoint);
      return result;
    },
    update: async (id, data) => {
      const result = await handleRequest(apiClient.put(`/${endpoint}/${id}`, data));
      invalidateCache(endpoint);
      invalidateCache(`${endpoint}-${id}`);
      return result;
    },
    delete: async (id) => {
      await handleRequest(apiClient.delete(`/${endpoint}/${id}`));
      invalidateCache(endpoint);
      invalidateCache(`${endpoint}-${id}`);
    }
  };
}

// --- API: SDK COMPLETO DOS CONTROLLERS DO BACKEND ---
export const api = {
  auth: {
    login: async (credentials) => {
      const data = await handleRequest(apiClient.post('/establishments/login', credentials));
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('establishment', JSON.stringify(data.establishment));
      }
      return data;
    },
    logout: () => {
      localStorage.clear();
      cache.clear();
      return Promise.resolve();
    },
    register: (data) => handleRequest(apiClient.post('/establishments/register', data)),
  },

  appointments: {
    getAllHydrated: async (params) => {
      const appointments = await handleRequest(apiClient.get('/appointments', { params }));
      if (!appointments || appointments.length === 0) return [];
      const establishmentId = params.establishment_id;
      if (!establishmentId) throw new Error("establishment_id é necessário para hidratar os dados.");

      const [clientsResult, servicesResult] = await Promise.allSettled([
        api.clients.getAll({ establishment_id: establishmentId }),
        api.services.getAll({ establishment_id: establishmentId })
      ]);

      const allClients = clientsResult.status === 'fulfilled' ? clientsResult.value : [];
      const allServices = servicesResult.status === 'fulfilled' ? servicesResult.value : [];

      if (clientsResult.status === 'rejected') console.error("Falha ao buscar clientes:", clientsResult.reason);
      if (servicesResult.status === 'rejected') console.error("Falha ao buscar serviços:", servicesResult.reason);

      const clientsMap = new Map(allClients.map(c => [c.id, c]));
      const servicesMap = new Map(allServices.map(s => [s.id, s]));

      return appointments.map(app => ({
        ...app,
        client: clientsMap.get(app.client_id) || { id: app.client_id, full_name: 'Cliente Removido' },
        service: servicesMap.get(app.service_id) || { id: app.service_id, name: 'Serviço Removido' }
      }));
    },
    ...createCrudModule('appointments'),
  },
  
  clients:       createCrudModule('clients'),
  professionals: createCrudModule('professionals'),
  services:      createCrudModule('services'),
  products:      createCrudModule('products'),
  sales:         createCrudModule('sales'),
  saleItems:     createCrudModule('sale_items'),
  productBatches:createCrudModule('product_batches'),
  commissions:   createCrudModule('commissions'),
  cashFlow:      createCrudModule('cash_flow'),
  assets:        createCrudModule('assets'),
  absences:      createCrudModule('absences'),
  
  dashboard: {
    getData: async (establishmentId, period = 'monthly') => {
      if (!establishmentId) throw new Error("ID do Estabelecimento é obrigatório.");
      
      const now = new Date();
      let startDate;
      
      if (period === 'daily') {
        startDate = new Date(now.setHours(0, 0, 0, 0));
      } else if (period === 'weekly') {
        startDate = new Date(new Date().setDate(now.getDate() - 7));
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      
      const params = {
          establishment_id: establishmentId,
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(new Date(), 'yyyy-MM-dd')
      };

      try {
        const [sales, appointments, clients, professionals, services] = await Promise.all([
          api.sales.getAll(params),
          api.appointments.getAll(params),
          api.clients.getAll({ establishment_id: establishmentId }),
          api.professionals.getAll({ establishment_id: establishmentId }),
          api.services.getAll({ establishment_id: establishmentId })
        ]);

        const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.final_amount || 0), 0);
        const totalAppointments = appointments.length;
        const avgTicket = totalAppointments > 0 ? totalRevenue / totalAppointments : 0;

        return {
          kpis: {
            totalRevenue,
            totalAppointments,
            avgTicket,
            newClients: clients.filter(c => new Date(c.created_at) >= startDate).length,
          },
          charts: {
            revenue: sales.map(s => ({ name: new Date(s.transaction_date).toLocaleDateString(), Receita: s.final_amount })),
            appointments: appointments.map(a => ({ name: new Date(a.start_time).toLocaleDateString(), agendamentos: 1 })),
          },
          tables: {
            upcomingAppointments: appointments.filter(a => new Date(a.start_time) > new Date()).slice(0, 5),
            services: services.slice(0, 5).map(s => ({ ...s, count: Math.floor(Math.random() * 50) })), // Dados mocados
            clientsAtRisk: clients.slice(0, 3).map(c => ({...c, last_appointment: new Date()})), // Dados mocados
            professionalsLeaderboard: professionals.slice(0, 5).map(p => ({ ...p, total_revenue: Math.floor(Math.random() * 5000) })), // Dados mocados
            recentActivity: [
                { id: 1, type: 'new_client', title: 'Novo Cliente', description: 'João Silva se cadastrou.', date: new Date() },
                { id: 2, type: 'new_appointment', title: 'Novo Agendamento', description: 'Maria Souza agendou um corte.', date: new Date() },
            ]
          }
        };
      } catch (error) {
        throw new Error(`Não foi possível carregar os dados do dashboard: ${error.message}`);
      }
    }
  }
};