"use client";
import React from 'react';
import { motion } from 'framer-motion';
import styles from './AuthModal.module.css';
import LoginComponent from '../LoginComponent/page';
import RegisterComponent from '../RegisterComponent/page';

const AuthModal = ({ mode, setMode, closeModal }) => {
  // Impede que o clique dentro do modal feche o modal
  const handleContentClick = (e) => e.stopPropagation();

  return (
    // O Overlay que cobre a tela inteira e aplica o blur
    <motion.div
      className={styles.overlay}
      onClick={closeModal} // Fecha o modal ao clicar no fundo
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* O container do formulário com animação de entrada */}
      <motion.div
        className={styles.modalContent}
        onClick={handleContentClick}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <button className={styles.closeButton} onClick={closeModal}>×</button>
        
        {mode === 'login' ? (
          <>
            <LoginComponent />
            <p className={styles.switcher}>
              Não tem uma conta?{' '}
              <button onClick={() => setMode('register')}>Registre-se</button>
            </p>
          </>
        ) : (
          <>
            <RegisterComponent />
            <p className={styles.switcher}>
              Já tem uma conta?{' '}
              <button onClick={() => setMode('login')}>Faça login</button>
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AuthModal;