"use client";
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from '../BemVindo.module.css';
// CORREÇÃO: Importa o objeto 'api' em vez de funções separadas
import { api } from '../../../../service/api'; 
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '../contexts/ToastProvider';

// Schema de validação com Zod
const professionalSchema = z.object({
  full_name: z.string().min(3, "O nome precisa ter no mínimo 3 caracteres."),
  email: z.string().email("Por favor, insira um e-mail válido."),
  phone: z.string().optional(),
  professional_role: z.string().optional(),
});

const ProfessionalFormModal = ({ closeModal, establishmentId, onSuccess, initialData }) => {
  const { addToast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm({
    resolver: zodResolver(professionalSchema),
  });

  // Preenche o formulário no modo de edição
  useEffect(() => {
    if (initialData) {
      setValue('full_name', initialData.full_name || '');
      setValue('email', initialData.email || '');
      setValue('phone', initialData.phone || '');
      setValue('professional_role', initialData.professional_role || '');
    }
  }, [initialData, setValue]);

  const onSubmit = async (formData) => {
    try {
      if (initialData) {
        // CORREÇÃO: Usa api.update
        await api.update('professionals', initialData.id, formData);
      } else {
        // CORREÇÃO: Usa api.create
        await api.create('professionals', { ...formData, establishment_id: establishmentId });
      }
      onSuccess(); // Chama a função de sucesso que atualiza a lista e fecha o modal
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
      <h2>{initialData ? 'Editar Profissional' : 'Novo Profissional'}</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="full_name">Nome Completo</label>
          <input id="full_name" {...register('full_name')} placeholder="Nome do profissional" className={errors.full_name ? styles.inputError : ''}/>
          {errors.full_name && <p className={styles.errorMessage}>{errors.full_name.message}</p>}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" {...register('email')} placeholder="email@exemplo.com" className={errors.email ? styles.inputError : ''}/>
          {errors.email && <p className={styles.errorMessage}>{errors.email.message}</p>}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="phone">Telefone (Opcional)</label>
          <input id="phone" type="tel" {...register('phone')} placeholder="(55) 99999-9999" />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="professional_role">Cargo (Opcional)</label>
          <input id="professional_role" {...register('professional_role')} placeholder="Ex: Cabeleireiro" />
        </div>

        <motion.button type="submit" className={styles.submitButton} disabled={isSubmitting} whileTap={{ scale: 0.98 }}>
          {isSubmitting ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Criar Profissional')}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ProfessionalFormModal;