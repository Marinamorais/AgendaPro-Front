// app/Bemvindo/[id]/hooks/useApi.js

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para encapsular a lógica de uma chamada de API.
 * Gerencia os estados de carregamento, dados e erro automaticamente.
 *
 * @param {Function} apiCallFunction - A função que efetivamente faz a chamada à API (ex: () => api.get('clients')).
 * @param {Array} dependencies - Um array de dependências que, quando alterado, dispara uma nova chamada à API.
 * @returns {{data: any, loading: boolean, error: string | null, setData: Function}}
 */
const useApi = (apiCallFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Usamos useCallback para memoizar a função e evitar re-execuções desnecessárias.
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCallFunction();
      setData(result);
    } catch (err) {
      setError(err.message || 'Ocorreu um erro ao buscar os dados.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies); // A dependência do Eslint é desabilitada pois `dependencies` já controla isso.

  // O useEffect dispara a busca de dados quando o componente é montado
  // ou quando qualquer uma das dependências no array muda.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, setData };
};

export default useApi;