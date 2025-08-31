const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Função para obter os cabeçalhos de autenticação
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Função genérica para buscar dados (ex: profissionais, clientes, etc.)
export const fetchData = async (endpoint, establishmentId) => {
  if (!establishmentId) return [];
  try {
    const response = await fetch(`${API_URL}/${endpoint}?establishment_id=${establishmentId}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error(`Falha ao buscar ${endpoint}.`);
    return await response.json();
  } catch (error) {
    console.error(error);
    alert(error.message); // Idealmente, use um sistema de notificações (toast)
    return [];
  }
};

// Função genérica para criar novos dados
export const createData = async (endpoint, data) => {
  try {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const responseData = await response.json();
    if (!response.ok) throw new Error(responseData.message || `Erro ao criar ${endpoint}.`);
    return responseData;
  } catch (error) {
    console.error(error);
    throw error; // Lança o erro para ser tratado no componente
  }
};

// --- NOVO: Função para Atualizar (UPDATE) ---
export const updateData = async (endpoint, id, data) => {
  try {
    const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const responseData = await response.json();
    if (!response.ok) throw new Error(responseData.message || `Error updating ${endpoint}.`);
    return responseData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// --- NOVO: Função para Deletar (DELETE) ---
export const deleteData = async (endpoint, id) => {
  try {
    const response = await fetch(`${API_URL}/${endpoint}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!response.ok && response.status !== 204) {
      const responseData = await response.json();
      throw new Error(responseData.message || `Error deleting ${endpoint}.`);
    }
    // DELETE bem-sucedido não retorna conteúdo
  } catch (error) {
    console.error(error);
    throw error;
  }
};