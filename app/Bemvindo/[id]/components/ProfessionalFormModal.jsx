"use client";
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from '../BemVindo.module.css';
import { createData, updateData } from '../../../../service/api';

// 1. Importa as ferramentas de validação
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 2. Define o "contrato" dos dados do formulário com Zod
const professionalSchema = z.object({
  full_name: z.string().min(3, "O nome precisa ter no mínimo 3 caracteres."),
  email: z.string().email("Por favor, insira um e-mail válido."),
  phone: z.string().optional(),
  professional_role: z.string().optional(),
});

const ProfessionalFormModal = ({ closeModal, establishmentId, onSuccess, initialData }) => {
  // 3. Integra o react-hook-form com o schema do Zod
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm({
    resolver: zodResolver(professionalSchema),
  });

  // Efeito que preenche o formulário no modo de edição
  useEffect(() => {
    if (initialData) {
      setValue('full_name', initialData.full_name || '');
      setValue('email', initialData.email || '');
      setValue('phone', initialData.phone || '');
      setValue('professional_role', initialData.professional_role || '');
    }
  }, [initialData, setValue]);

  // 4. A função de submit agora recebe os dados já validados
  const onSubmit = async (formData) => {
    try {
      if (initialData) {
        await updateData('professionals', initialData.id, formData);
      } else {
        await createData('professionals', { ...formData, establishment_id: establishmentId });
      }
      onSuccess();
      closeModal();
    } catch (err) {
      // Erros da API ainda podem ser tratados aqui
      alert(err.message || 'Ocorreu um erro inesperado.');
    }
  };

  return (
    <motion.div className={styles.overlay} onClick={closeModal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div 
        className={styles.modalContent} 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={closeModal} className={styles.closeButton}>×</button>
        <h2>{initialData ? 'Editar Profissional' : 'Novo Profissional'}</h2>
        
        {/* 5. O formulário agora usa o handleSubmit do react-hook-form */}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="full_name">Nome Completo</label>
            <input id="full_name" {...register('full_name')} placeholder="Nome do profissional" />
            {errors.full_name && <p className={styles.errorMessage}>{errors.full_name.message}</p>}
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" {...register('email')} placeholder="email@exemplo.com" />
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
    </motion.div>
  );
};

export default ProfessionalFormModal;