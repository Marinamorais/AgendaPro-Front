"use client";
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import styles from '../BemVindo.module.css';
// CORREÇÃO: Importa o objeto 'api' em vez de funções separadas
import { api } from '../../../../service/api';
import { useToast } from '../contexts/ToastProvider';

const ProductFormModal = ({ closeModal, establishmentId, onSuccess, initialData }) => {
  const { addToast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm({
    mode: "onBlur",
  });

  useEffect(() => {
    if (initialData) {
      setValue('name', initialData.name);
      setValue('sku', initialData.sku);
      setValue('sale_price', initialData.sale_price);
    }
  }, [initialData, setValue]);
  
  const onSubmit = async (formData) => {
    try {
      if (initialData) {
        // CORREÇÃO: Usa api.update
        await api.update('products', initialData.id, formData);
      } else {
        // CORREÇÃO: Usa api.create
        await api.create('products', { ...formData, establishment_id: establishmentId });
      }
      onSuccess();
    } catch (error) {
      addToast(error.message, 'error');
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
      <h2>{initialData ? 'Editar Produto' : 'Novo Produto'}</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="name">Nome do Produto</label>
          <input 
            id="name"
            type="text"
            className={errors.name ? styles.inputError : ''}
            placeholder="Ex: Shampoo Hidratante" 
            {...register("name", { required: "O nome é obrigatório." })}
          />
          {errors.name && <span className={styles.errorMessage}>{errors.name.message}</span>}
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="sku">SKU (Código)</label>
          <input 
            id="sku"
            type="text"
            placeholder="Ex: SH-001 (Opcional)" 
            {...register("sku")}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="sale_price">Preço de Venda (R$)</label>
          <input 
            id="sale_price"
            type="number"
            step="0.01"
            className={errors.sale_price ? styles.inputError : ''}
            placeholder="Ex: 49.90" 
            {...register("sale_price", { 
              required: "O preço é obrigatório.",
              valueAsNumber: true,
              min: { value: 0.01, message: "O preço deve ser positivo." }
            })}
          />
          {errors.sale_price && <span className={styles.errorMessage}>{errors.sale_price.message}</span>}
        </div>
        
        <motion.button 
          type="submit" 
          className={styles.submitButton}
          disabled={isSubmitting}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? 'Salvando...' : (initialData ? 'Salvar Alterações' : 'Adicionar Produto')}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ProductFormModal;