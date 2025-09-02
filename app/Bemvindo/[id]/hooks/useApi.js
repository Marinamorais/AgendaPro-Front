"use client";

/**
 * @module hooks/useApi
 * @description Hook customizado de altíssimo nível para encapsular a lógica de chamadas de API.
 * Este hook é o motor de busca de dados para a aplicação, gerenciando de forma centralizada
 * os estados de carregamento (loading), os dados retornados (data) e quaisquer erros (error).
 * O objetivo é manter os componentes de UI (a parte visual) completamente limpos,
 * focados apenas em exibir informações, enquanto toda a complexidade de comunicação
 * com o backend fica abstraída aqui.
 * Foi construído para ser genérico, reutilizável e robusto.
 */

// Importações de dependências primárias do React.
// useState: Essencial para criar e gerenciar o estado interno do hook.
// useEffect: Utilizado para disparar a busca de dados na montagem do componente ou quando as dependências mudam.
// useCallback: Memoiza a função de busca, uma otimização crucial para evitar que a função seja
// recriada a cada renderização, o que poderia causar loops de requisições indesejados.
import { useState, useEffect, useCallback } from 'react';

/**
 * @typedef {object} UseApiResult
 * @description Define a estrutura do objeto de retorno do hook `useApi`.
 * @template T - O tipo genérico que representa a estrutura dos dados esperados da API.
 * @property {T | null} data - Os dados retornados pela API após uma chamada bem-sucedida. Inicia como nulo.
 * @property {boolean} loading - Um booleano que é `true` enquanto a chamada à API está em andamento. Fornece controle para exibir spinners ou skeletons na UI.
 * @property {string | null} error - Uma string contendo a mensagem de erro caso a chamada à API falhe. Inicia como nulo.
 * @property {React.Dispatch<React.SetStateAction<T | null>>} setData - Função do React para atualizar manualmente o estado de 'data'. É útil para implementações de UI otimista (quando você atualiza a tela antes mesmo da confirmação da API).
 * @property {() => Promise<void>} refetch - Uma função que pode ser chamada para forçar a re-execução da chamada à API, útil para botões de "Atualizar".
 */

/**
 * Hook customizado para realizar e gerenciar o ciclo de vida de uma chamada de API.
 * @template T - O tipo de dado esperado da resposta da API.
 * @param {() => Promise<T>} apiCallFunction - A função assíncrona que executa a chamada à API.
 * - **Exemplo de uso:** `() => api.get('clients', { establishment_id: 1 })`
 * - Esta função deve ser "preparada" no momento do uso do hook, encapsulando a chamada real.
 * @param {Array<any>} dependencies - Um array de dependências. O hook re-executará a chamada à API
 * automaticamente sempre que um dos valores neste array for alterado. Funciona exatamente como o array de dependências do `useEffect`.
 * - **IMPORTANTE:** Todas as variáveis externas usadas dentro de `apiCallFunction` DEVEM estar listadas aqui para garantir que os dados sejam atualizados corretamente.
 * @returns {UseApiResult<T>} - Um objeto contendo o estado da chamada da API e as funções de controle.
 */
// AQUI ESTÁ A CORREÇÃO FUNDAMENTAL:
// Mudamos de `export default` para `export const`. Isso transforma o hook em uma "exportação nomeada".
// Agora, a importação em outros arquivos OBRIGATORIAMENTE deve ser feita com chaves: `import { useApi } from '...'`.
// Isso elimina 100% da ambiguidade que estava causando o seu erro.
export const useApi = (apiCallFunction, dependencies = []) => {

  // Estado para armazenar os dados que a API retorna.
  // Tipado genericamente, começa como `null` antes da primeira busca.
  const [data, setData] = useState(null);

  // Estado de carregamento. Começa como `true` para que o componente que o utiliza
  // já renderize um estado de "loading" na sua montagem inicial.
  const [loading, setLoading] = useState(true);

  // Estado de erro. Armazena a mensagem de erro para ser exibida na UI se algo falhar.
  const [error, setError] = useState(null);

  /**
   * Função que efetivamente busca os dados.
   * Envolvida em `useCallback` para otimização. A função só é recriada na memória se
   * uma das `dependencies` mudar. Isso é vital para o `useEffect` abaixo funcionar corretamente.
   */
  const fetchData = useCallback(async () => {
    // Passo 1: Iniciar o ciclo de busca.
    setLoading(true); // Informa à UI que o carregamento começou.
    setError(null);   // Limpa qualquer erro de uma requisição anterior.

    try {
      // Passo 2: Executar a chamada da API.
      // O `await` pausa a execução aqui até que a `Promise` da API seja resolvida.
      const result = await apiCallFunction();
      
      // Passo 3: Sucesso!
      // Atualiza o estado 'data' com o resultado. O React irá re-renderizar o componente consumidor com os novos dados.
      setData(result);
      
    } catch (err) {
      // Passo 3 (Alternativo): Falha!
      // Logamos o erro completo no console para o desenvolvedor poder depurar.
      console.error("ERRO CAPTURADO PELO useApi:", err);
      
      // Atualizamos o estado 'error' com uma mensagem amigável para o usuário.
      setError(err.message || 'Ocorreu um erro inesperado. Por favor, tente novamente.');
      
    } finally {
      // Passo 4: Fim do ciclo.
      // Este bloco é executado sempre, tanto em caso de sucesso quanto de falha.
      // Garante que o estado de 'loading' seja desativado.
      setLoading(false);
    }
  // AVISO DO ESLINT DESABILITADO: O array de dependências é passado de forma explícita e intencional
  // para o `useCallback`. Esta é a forma correta de usar este padrão.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  /**
   * Efeito que dispara a busca de dados.
   * Este `useEffect` "escuta" por mudanças na função `fetchData`. Como `fetchData`
   * só muda quando as `dependencies` mudam, este efeito é, na prática,
   * acionado na montagem do componente e sempre que uma das `dependencies` mudar.
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Expõe o estado e as funções para o componente que for usar este hook.
  return { data, loading, error, setData, refetch: fetchData };
};
// NUNCA MAIS TERÁ UM "export default" NESTE ARQUIVO.