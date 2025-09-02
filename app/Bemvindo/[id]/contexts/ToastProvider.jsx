"use client";
import React, { createContext, useState, useCallback, useContext } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
// AQUI ESTÁ A CORREÇÃO: Importando do arquivo CSS que já existe.
import styles from '../BemVindo.module.css';

// O Contexto agora é exportado corretamente
export const ToastContext = createContext(null);

// Hook para facilitar o uso
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = toastId++;
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000); // O toast some após 4 segundos
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
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