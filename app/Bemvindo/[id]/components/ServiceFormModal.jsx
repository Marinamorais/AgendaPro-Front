"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import styles from '../BemVindo.module.css';
import { api } from '../../../../service/api';
import { useToast } from '../contexts/ToastProvider';

// Schema de validação para o formulário de serviço
const serviceSchema = z.object({
  name: z.string().min(3, "O nome precisa ter no mínimo 3 caracteres."),
  price: z.preprocess(
    (val) => parseFloat(String(val).replace(',', '.')),
    z.number().positive("O preço deve ser um número positivo.")
  ),
  duration_minutes: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number().int().positive("A duração deve ser um número inteiro positivo.")
  ),
  description: z.string().optional(),
});

const ServiceFormModal = ({ closeModal, establishmentId, onSuccess, initialData }) => {
  const { addToast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: initialData || {
      name: '',
      price: '',
      duration_minutes: '',
      description: ''
    }
  });

  const onSubmit = async (formData) => {
    const serviceData = {
      ...formData,
      establishment_id: establishmentId,
    };

    try {
      if (initialData?.id) {
        await api.services.update(initialData.id, serviceData);
      } else {
        await api.services.create(serviceData);
      }
      onSuccess();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <motion.div
      className={styles.modalContent}
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -50, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      <button onClick={closeModal} className={styles.closeButton}>×</button>
      <h2>{initialData ? 'Editar Serviço' : 'Novo Serviço'}</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="name">Nome do Serviço</label>
          <input id="name" {...register("name")} placeholder="Ex: Corte de Cabelo" />
          {errors.name && <p className={styles.errorMessage}>{errors.name.message}</p>}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="price">Preço (R$)</label>
          <input id="price" type="number" step="0.01" {...register("price")} placeholder="Ex: 50.00" />
          {errors.price && <p className={styles.errorMessage}>{errors.price.message}</p>}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="duration_minutes">Duração (em minutos)</label>
          <input id="duration_minutes" type="number" {...register("duration_minutes")} placeholder="Ex: 60" />
          {errors.duration_minutes && <p className={styles.errorMessage}>{errors.duration_minutes.message}</p>}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="description">Descrição (Opcional)</label>
          <textarea id="description" rows="3" {...register("description")} />
        </div>

        <motion.button type="submit" disabled={isSubmitting} className={styles.submitButton} whileTap={{ scale: 0.98 }}>
          {isSubmitting ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Criar Serviço')}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ServiceFormModal;