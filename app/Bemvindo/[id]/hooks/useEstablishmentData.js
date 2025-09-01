import { useState, useCallback } from 'react';
import { fetchAllData, deleteItem } from '../../../../service/api';

/**
 * Hook para gerenciar os dados do estabelecimento (profissionais, clientes, produtos).
 *
 * Este hook encapsula toda a lógica de:
 * - Armazenamento do estado dos dados.
 * - Controle de estado de carregamento (loading) e erros.
 * - Funções para buscar e atualizar os dados da API.
 * - Funções para manipulação otimista do estado (ex: remover um item da lista
 * imediatamente após a confirmação de exclusão, antes da resposta da API).
 *
 * @returns {object} - Um objeto contendo o estado dos dados e as funções para gerenciá-los.
 */
export const useEstablishmentData = () => {
  // Estado para armazenar o objeto do estabelecimento (vindo do localStorage)
  const [establishment, setEstablishment] = useState(null);

  // Estado unificado para os dados das diferentes abas
  const [data, setData] = useState({
    profissionais: [],
    clientes: [],
    produtos: [],
  });
  
  // Estado para controlar o carregamento inicial dos dados
  const [loading, setLoading] = useState(true);

  // Estado para armazenar mensagens de erro da API
  const [error, setError] = useState(null);

  /**
   * Função para buscar todos os dados iniciais do estabelecimento.
   * Ela é envolvida em `useCallback` para evitar recriações desnecessárias
   * quando passada como dependência para `useEffect`.
   */
  const fetchAndSetData = useCallback(async () => {
    setLoading(true);
    setError(null);

    let establishmentObject = establishment;
    // Se o 'establishment' ainda não estiver no estado, tenta buscar do localStorage
    if (!establishmentObject) {
        try {
            const storedEstablishment = localStorage.getItem('establishment');
            if (storedEstablishment) {
                establishmentObject = JSON.parse(storedEstablishment);
                setEstablishment(establishmentObject);
            } else {
                throw new Error("Dados do estabelecimento não encontrados no localStorage.");
            }
        } catch (e) {
            console.error(e);
            setError("Não foi possível carregar os dados do estabelecimento.");
            setLoading(false);
            return;
        }
    }
    
    // Se não houver ID, não há como prosseguir.
    if (!establishmentObject?.id) {
        setError("ID do estabelecimento inválido.");
        setLoading(false);
        return;
    }

    try {
      // Usa Promise.all para buscar todos os dados em paralelo, melhorando a performance.
      const [professionalsData, clientsData, productsData] = await Promise.all([
        fetchAllData('professionals', establishmentObject.id),
        fetchAllData('clients', establishmentObject.id),
        fetchAllData('products', establishmentObject.id),
      ]);
      
      // Atualiza o estado 'data' com os resultados das chamadas da API.
      setData({
        profissionais: professionalsData,
        clientes: clientsData,
        produtos: productsData,
      });

    } catch (err) {
      // Em caso de erro em qualquer uma das chamadas, armazena a mensagem de erro.
      setError(err.message);
    } finally {
      // Garante que o estado de 'loading' seja desativado ao final do processo.
      setLoading(false);
    }
  }, [establishment]); // A dependência garante que a função só é recriada se o 'establishment' mudar.

  /**
   * Remove um item do estado local e, em seguida, chama a API para deletá-lo.
   * Isso proporciona uma experiência de usuário mais rápida (atualização otimista).
   * @param {string} resourceKey - A chave do recurso no estado 'data' (ex: 'profissionais').
   * @param {string|number} itemId - O ID do item a ser removido.
   */
  const removeItemFromState = useCallback(async (resourceKey, itemId) => {
    // Salva o estado atual para poder reverter em caso de erro na API.
    const originalData = { ...data };

    // Atualiza o estado local removendo o item, para uma UI mais responsiva.
    setData((prevData) => ({
      ...prevData,
      [resourceKey]: prevData[resourceKey].filter((item) => item.id !== itemId),
    }));

    try {
      // Chama a API para deletar o item no backend.
      await deleteItem(resourceKey, itemId);
    } catch (err) {
      // Se a chamada da API falhar, reverte o estado para o original
      // e exibe uma mensagem de erro.
      setData(originalData);
      alert(`Erro ao deletar: ${err.message}`);
    }
  }, [data]);

  return {
    establishment,
    data,
    loading,
    error,
    fetchAndSetData,
    removeItemFromState,
  };
};