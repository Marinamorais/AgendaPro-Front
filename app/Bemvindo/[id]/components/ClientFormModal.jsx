"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import styles from '../BemVindo.module.css';
// CORREÇÃO: Importa o objeto 'api' em vez de funções separadas
import { api } from '../../../../service/api';
import { useToast } from '../contexts/ToastProvider';

const ClientFormModal = ({ closeModal, establishmentId, onSuccess, initialData }) => {
  const { addToast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      full_name: initialData?.full_name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || ''
    }
  });

  const onSubmit = async (formData) => {
    try {
      if (initialData) {
        // CORREÇÃO: Usa api.update
        await api.update('clients', initialData.id, formData);
      } else {
        // CORREÇÃO: Usa api.create
        await api.create('clients', { ...formData, establishment_id: establishmentId });
      }
      onSuccess();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <motion.div
        className={styles.formModalContent}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
    >
      <button onClick={closeModal} className={styles.closeButton}>×</button>
      <h2>{initialData ? 'Editar Cliente' : 'Novo Cliente'}</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="full_name">Nome Completo</label>
          <input 
            id="full_name"
            {...register("full_name", { required: "O nome completo é obrigatório." })}
            placeholder="Nome do Cliente"
            className={errors.full_name ? styles.inputError : ""}
          />
          {errors.full_name && <p className={styles.errorMessage}>{errors.full_name.message}</p>}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email">E-mail (Opcional)</label>
          <input 
            id="email"
            type="email"
            {...register("email", {
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Formato de e-mail inválido."
              }
            })}
            placeholder="email@exemplo.com"
            className={errors.email ? styles.inputError : ""}
          />
          {errors.email && <p className={styles.errorMessage}>{errors.email.message}</p>}
        </div>

        <div className={styles.inputGroup}>
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
  );
};

export default ClientFormModal;