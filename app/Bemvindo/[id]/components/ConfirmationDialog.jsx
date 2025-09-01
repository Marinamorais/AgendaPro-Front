"use client";

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import styles from '../BemVindo.module.css';

/**
 * Um componente de modal para confirmar ações destrutivas, como a exclusão de um item.
 *
 * @param {object} props
 * @param {string} props.title - O título do diálogo.
 * @param {string} props.message - A mensagem de confirmação para o usuário.
 * @param {function} props.onConfirm - A função a ser chamada quando o usuário confirma a ação.
 * @param {function} props.onCancel - A função a ser chamada quando o usuário cancela a ação.
 * @param {string} [props.confirmText='Confirmar'] - O texto para o botão de confirmação.
 * @param {string} [props.cancelText='Cancelar'] - O texto para o botão de cancelamento.
 */
const ConfirmationDialog = ({ title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar' }) => {
  const confirmButtonRef = useRef(null);

  // Efeito para focar o botão de cancelar ao abrir, por segurança.
  useEffect(() => {
    const previousActiveElement = document.activeElement;
    if (confirmButtonRef.current) {
        confirmButtonRef.current.focus();
    }

    // Função de cleanup para retornar o foco ao elemento anterior quando o modal fechar.
    return () => {
        previousActiveElement?.focus();
    };
  }, []);

  // Manipulador de teclado para fechar com 'Escape' e confirmar com 'Enter'
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <motion.div
      className={styles.overlay}
      onClick={onCancel}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onKeyDown={handleKeyDown}
    >
      <motion.div
        className={styles.dialogContent}
        onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do diálogo o feche
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
      >
        <h2 id="dialog-title" className={styles.dialogTitle}>{title}</h2>
        <p id="dialog-message" className={styles.dialogMessage}>{message}</p>
        <div className={styles.dialogActions}>
          <button
            onClick={onCancel}
            className={`${styles.dialogButton} ${styles.cancelButton}`}
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={onConfirm}
            className={`${styles.dialogButton} ${styles.confirmButton}`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmationDialog;