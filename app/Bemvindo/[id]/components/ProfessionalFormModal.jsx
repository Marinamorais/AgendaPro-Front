"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../BemVindo.module.css'; // Reutiliza o mesmo CSS

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const ProfessionalFormModal = ({ closeModal, establishmentId, onSuccess }) => {
  // Estado interno para o formulário
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    professional_role: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handler genérico para os inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler para submeter os dados para a API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(`${apiUrl}/professionals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, establishment_id: establishmentId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao criar profissional.');

      onSuccess();  // Atualiza a lista na página principal
      closeModal(); // Fecha o modal

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // O container do Modal (Overlay e conteúdo)
    <motion.div 
      className={styles.overlay}
      onClick={closeModal} // Fecha ao clicar no fundo
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className={styles.modalContent}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()} // Impede que o clique no formulário feche o modal
      >
        <button onClick={closeModal} className={styles.closeButton}>×</button>
        <h2>Novo Profissional</h2>
        <form onSubmit={handleSubmit}>
          <input name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Nome Completo" required />
          <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="E-mail" required />
          <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Telefone" />
          <input name="professional_role" value={formData.professional_role} onChange={handleChange} placeholder="Cargo (Ex: Cabeleireiro)" />
          {error && <p className={styles.error}>{error}</p>}
          <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}>
            {loading ? 'Salvando...' : 'Salvar Profissional'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProfessionalFormModal;