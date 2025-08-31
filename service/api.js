"use client"; // Indica que este componente deve ser renderizado no lado do cliente
import axios from "axios"; // Importa a biblioteca Axios para fazer requisições HTTP

// Define a URL base da API
const API_URL = "https://agenda-pro-back.vercel.app/";

// Cria uma instância do Axios com a URL base definida
const api = axios.create({
  baseURL: API_URL,

});

export default api; // Exporta a instância do Axios para ser usada em outros arquivos
