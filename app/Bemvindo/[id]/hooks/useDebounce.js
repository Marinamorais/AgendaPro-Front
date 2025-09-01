// app/Bemvindo/[id]/hooks/useDebounce.js

import { useState, useEffect } from 'react';

/**
 * Hook personalizado para "atrasar" a atualização de um valor.
 * É muito útil para otimizar buscas, evitando que uma nova chamada de API
 * seja feita a cada tecla digitada pelo usuário.
 *
 * @param {*} value - O valor a ser "atrasado" (ex: o texto de um input de busca).
 * @param {number} delay - O tempo de atraso em milissegundos.
 * @returns {*} - O valor "atrasado".
 */
const useDebounce = (value, delay) => {
  // Estado para armazenar o valor com debounce
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Configura um timer que só vai atualizar o estado 'debouncedValue'
    // após o 'delay' especificado ter passado sem que o 'value' original mude.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Função de limpeza: se o 'value' ou 'delay' mudarem antes do timer terminar,
    // o timer anterior é cancelado. Isso garante que a atualização só ocorra
    // quando o usuário para de digitar.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // O efeito é re-executado se o valor ou o delay mudarem.

  return debouncedValue;
};

export default useDebounce;