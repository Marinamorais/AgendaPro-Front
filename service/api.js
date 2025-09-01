"use client";
import axios from 'axios';

/**
 * ------------------------------------------------------------------
 * SERVIÇO DE API CENTRALIZADO - O CORAÇÃO DA COMUNICAÇÃO
 * ------------------------------------------------------------------
 * Esta não é uma simples configuração. É o sistema nervoso da sua aplicação.
 * Usamos "interceptors" do Axios para criar um sistema de segurança e
 * resiliência automático e proativo.
 */

// 1. CRIAÇÃO DA INSTÂNCIA BASE DO AXIOS
// A partir daqui, todas as requisições já sabem o endereço do backend.
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// 2. INTERCEPTOR DE REQUISIÇÃO (O GUARDA-COSTAS AUTOMÁTICO)
// Este código é executado ANTES de CADA requisição sair do seu frontend.
api.interceptors.request.use(
  (config) => {
    // Busca o token de autenticação salvo no navegador.
    const token = localStorage.getItem('authToken');
    
    // Se o token existir, ele é injetado no cabeçalho da requisição.
    // Com isso, NUNCA MAIS precisará de se preocupar em adicionar o token manualmente.
    // Todas as requisições futuras estarão automaticamente autenticadas.
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config; // A requisição segue o seu caminho, agora segura.
  },
  (error) => {
    // Trata erros que podem acontecer ANTES da requisição ser enviada.
    console.error("Erro na configuração da requisição:", error);
    return Promise.reject(error);
  }
);

// 3. INTERCEPTOR DE RESPOSTA (O SISTEMA IMUNOLÓGICO)
// Este código é executado DEPOIS que CADA resposta chega do backend.
api.interceptors.response.use(
  // Se a resposta for um sucesso (status 2xx), ele apenas a repassa.
  (response) => response,
  (error) => {
    // Se a resposta for um erro...
    // O caso mais crítico: erro 401 (Não Autorizado) significa que o token é inválido ou expirou.
    if (error.response && error.response.status === 401) {
      // Limpa os dados de autenticação do utilizador para evitar loops.
      localStorage.removeItem('authToken');
      localStorage.removeItem('establishment');
      
      // Redireciona o utilizador para a página de login.
      // Isso impede que o utilizador fique "preso" num ecrã que exige login.
      // É uma medida de segurança e UX fundamental.
      if (typeof window !== 'undefined') {
        window.location.href = '/'; 
        alert("A sua sessão expirou. Por favor, faça login novamente.");
      }
    }
    // Repassa outros erros para que o componente que fez a chamada possa tratá-los.
    return Promise.reject(error);
  }
);

/**
 * ------------------------------------------------------------------
 * EXPORTAÇÕES DE FUNÇÕES ESPECIALIZADAS
 * ------------------------------------------------------------------
 * Em vez de funções genéricas, criamos um "menu" de operações claras.
 * Isso torna o código nos componentes mais legível e à prova de erros.
 */

// --- Autenticação ---
export const loginEstablishment = (credentials) => api.post('/establishments/login', credentials);
export const registerEstablishment = (data) => api.post('/establishments', data);

// --- CRUD de Profissionais ---
export const getProfessionals = (establishmentId) => api.get(`/professionals?establishment_id=${establishmentId}`);
export const createProfessional = (data) => api.post('/professionals', data);
export const updateProfessional = (id, data) => api.put(`/professionals/${id}`, data);
export const deleteProfessional = (id) => api.delete(`/professionals/${id}`);

// --- CRUD de Clientes ---
export const getClients = (establishmentId) => api.get(`/clients?establishment_id=${establishmentId}`);
export const createClient = (data) => api.post('/clients', data);
export const updateClient = (id, data) => api.put(`/clients/${id}`, data);
export const deleteClient = (id) => api.delete(`/clients/${id}`);

// --- CRUD de Produtos ---
export const getProducts = (establishmentId) => api.get(`/products?establishment_id=${establishmentId}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// --- Endpoints da Agenda ---
export const getProfessionalById = (id) => api.get(`/professionals/${id}`);
export const getAppointmentsForWeek = (professionalId, startDate, endDate) => 
  api.get(`/appointments?professional_id=${professionalId}&startDate=${startDate}&endDate=${endDate}`);
export const getAbsencesForWeek = (professionalId, startDate, endDate) => 
  api.get(`/absences?professional_id=${professionalId}&startDate=${startDate}&endDate=${endDate}`);

// Adicione aqui outras funções conforme necessário (Serviços, Vendas, etc.)

export default api;

