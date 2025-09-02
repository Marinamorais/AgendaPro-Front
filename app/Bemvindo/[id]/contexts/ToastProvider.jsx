"use client";

/**
 * @module contexts/ToastProvider
 * @description Este módulo fornece o sistema de notificações (Toasts) para a aplicação.
 * Ele consiste em um Contexto (ToastContext), um Provedor (ToastProvider), e um hook (useToast).
 */

import React, { createContext, useState, useCallback, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from '../BemVindo.module.css';

// 1. O CONTEXTO: É o "canal" de comunicação. Exportado para o hook usar.
export const ToastContext = createContext(null);

// 2. O HOOK: A forma como os componentes "falam" pelo canal.
// Ele lança o erro que você está vendo se não encontrar um Provedor acima dele na árvore de componentes.
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // ESTE ERRO SÓ ACONTECE SE A ESTRUTURA DA PÁGINA ESTIVER INCORRETA.
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

let toastId = 0;

// 3. O PROVEDOR: O componente que "envelopa" a sua aplicação e fornece o valor para o contexto.
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = toastId++;
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {/* 'children' é a sua página/componente que será renderizado DENTRO do provedor */}
      {children}
      
      {/* Container onde os toasts aparecerão na tela */}
      <div className={styles.toastContainer}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`${styles.toast} ${styles[toast.type]}`}
            >
              <p>{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className={styles.toastCloseButton}>×</button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};