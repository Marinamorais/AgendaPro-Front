"use client";
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form'; // Importa a biblioteca
import styles from '../BemVindo.module.css';
import { createData, updateData } from '../../../../service/api';

const ProductFormModal = ({ closeModal, establishmentId, onSuccess, initialData }) => {
  // Configuração do react-hook-form para validação
  const { register, handleSubmit, formState: { errors, isValid }, setValue, watch } = useForm({
    mode: "onChange", // Valida a cada mudança
  });

  // Preenche o formulário com dados iniciais para edição
  useEffect(() => {
    if (initialData) {
      setValue('name', initialData.name);
      setValue('sku', initialData.sku);
      setValue('sale_price', initialData.sale_price);
    }
  }, [initialData, setValue]);
  
  // Lida com a submissão do formulário
  const onSubmit = async (formData) => {
    try {
      if (initialData) {
        await updateData('products', initialData.id, formData);
      } else {
        await createData('products', { ...formData, establishment_id: establishmentId });
      }
      onSuccess(); // Atualiza a lista na página principal
      closeModal(); // Fecha o modal
    } catch (error) {
      // Idealmente, aqui você chamaria um toast de erro
      alert(error.message || 'Ocorreu um erro.');
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
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -30, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
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
            disabled={!isValid} // O botão só é clicável se o formulário for válido
            whileTap={{ scale: 0.98 }}
          >
            {initialData ? 'Salvar Alterações' : 'Adicionar Produto'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProductFormModal;