"use client";
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form'; // 1. Importa o hook
import styles from '../BemVindo.module.css';
import { createData, updateData } from '../../../../service/api';

const ClientFormModal = ({ closeModal, establishmentId, onSuccess, initialData }) => {
  // 2. Configura o react-hook-form, incluindo valores padrão se estiver editando
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      full_name: initialData?.full_name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || ''
    }
  });

  // A função de submissão agora recebe os dados validados diretamente
  const onSubmit = async (formData) => {
    try {
      if (initialData) {
        // MODO EDIÇÃO
        await updateData('clients', initialData.id, formData);
      } else {
        // MODO CRIAÇÃO
        await createData('clients', { ...formData, establishment_id: establishmentId });
      }
      onSuccess();
      closeModal();
    } catch (err) {
      // Em uma app real, você poderia setar um erro de formulário aqui
      alert(err.message || "Ocorreu um erro inesperado.");
    }
  };

  return (
    <motion.div 
      className={styles.overlay}
      onClick={closeModal}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className={styles.modalContent}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={closeModal} className={styles.closeButton}>×</button>
        <h2>{initialData ? 'Editar Cliente' : 'Novo Cliente'}</h2>
        
        {/* 3. O formulário agora usa o handleSubmit do react-hook-form */}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.inputContainer}>
            <label htmlFor="full_name">Nome Completo</label>
            <input 
              id="full_name"
              {...register("full_name", { required: "O nome completo é obrigatório." })}
              placeholder="Nome do Cliente"
              className={errors.full_name ? styles.inputError : ""}
            />
            {errors.full_name && <p className={styles.errorMessage}>{errors.full_name.message}</p>}
          </div>

          <div className={styles.inputContainer}>
            <label htmlFor="email">E-mail (Opcional)</label>
            <input 
              id="email"
              type="email"
              {...register("email", {
                pattern: { // Adiciona validação de formato de e-mail
                  value: /^\S+@\S+$/i,
                  message: "Formato de e-mail inválido."
                }
              })}
              placeholder="email@exemplo.com"
              className={errors.email ? styles.inputError : ""}
            />
            {errors.email && <p className={styles.errorMessage}>{errors.email.message}</p>}
          </div>

          <div className={styles.inputContainer}>
            <label htmlFor="phone">Telefone (Opcional)</label>
            <input 
              id="phone"
              type="tel"
              {...register("phone")}
              placeholder="(XX) XXXXX-XXXX"
            />
          </div>

          <motion.button type="submit" disabled={isSubmitting} className={styles.submitButton} whileTap={{ scale: 0.98 }}>
            {isSubmitting ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Criar Cliente')}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ClientFormModal;