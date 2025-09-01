import { useState, useCallback } from 'react';

/**
 * Hook personalizado para gerenciar o estado de um modal.
 * Encapsula a lógica de abrir, fechar e armazenar dados do item
 * que está sendo editado ou visualizado.
 *
 * @returns {object} - Um objeto contendo o estado do modal e as funções para manipulá-lo.
 */
export const useModal = () => {
  // O estado 'modalState' agora armazena o tipo de modal ('profissionais', 'clientes', etc.)
  // e os dados do item que está sendo editado ('editingItem').
  const [modalState, setModalState] = useState({
    type: null, // ex: 'profissionais', 'clientes', 'produtos'
    item: null, // O objeto de dados para edição
  });

  /**
   * Abre o modal para um tipo específico e, opcionalmente, com dados para edição.
   * @param {string} type - O tipo de modal a ser aberto.
   * @param {object | null} [itemToEdit=null] - Os dados do item para preencher o formulário no modo de edição.
   */
  const openModal = useCallback((type, itemToEdit = null) => {
    if (!type) {
      console.error("Tentativa de abrir modal sem especificar o tipo.");
      return;
    }
    document.body.style.overflow = 'hidden'; // Trava o scroll da página
    setModalState({ type, item: itemToEdit });
  }, []);

  /**
   * Fecha o modal e reseta seu estado.
   */
  const closeModal = useCallback(() => {
    document.body.style.overflow = 'auto'; // Libera o scroll da página
    setModalState({ type: null, item: null });
  }, []);

  return {
    modalType: modalState.type,
    editingItem: modalState.item,
    isModalOpen: modalState.type !== null,
    openModal,
    closeModal,
  };
};