"use client";
import axios from "axios";

// 1. Pega a URL da API do arquivo .env, garantindo que funcione em qualquer ambiente.
//    Lembre-se que a variável no .env precisa do prefixo (ex: VITE_API_URL).
const API_URL = import.meta.env.VITE_API_URL;

// 2. Cria a instância do Axios com a URL base correta.
const api = axios.create({
  baseURL: API_URL,
});

// 3. (A MÁGICA) - Cria um "interceptor" que adiciona o token de autenticação
//    em TODAS as requisições feitas com esta instância.
api.interceptors.request.use(
  (config) => {
    // Pega o token que foi salvo no localStorage durante o login
    const token = localStorage.getItem('authToken');

    // Se o token existir, adiciona-o ao cabeçalho de autorização
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config; // Retorna a configuração da requisição (com o token, se houver)
  },
  (error) => {
    // Faz algo com o erro da requisição
    return Promise.reject(error);
  }
);

export default api;