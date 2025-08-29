"use client"; // Indica que este componente deve ser renderizado no lado do cliente
import axios from "axios"; // Importa a biblioteca Axios para fazer requisições HTTP

// Define a URL base da API
const API_URL = "https://agenda-pro-back.vercel.app/";

// Cria uma instância do Axios com a URL base definida
const api = axios.create({
  baseURL: API_URL,

});
// Cadastrar Cliente
export async function createCliente(data) {
  try {
    const response = await api.post("/clientes", data);
    return response.data;
  } catch (error) {
    console.error("Erro ao cadastrar cliente:", error.response?.data || error.message);
    throw error;
  }
}

// Cadastrar Profissional
export async function createProfissional(data) {
  try {
    const response = await api.post("/profissionais", data);
    return response.data;
  } catch (error) {
    console.error("Erro ao cadastrar profissional:", error.response?.data || error.message);
    throw error;
  }
}


export default api; // Exporta a instância do Axios para ser usada em outros arquivos
