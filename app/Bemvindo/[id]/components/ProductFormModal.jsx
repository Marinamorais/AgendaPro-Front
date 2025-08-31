"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../BemVindo.module.css'; // Reuses the same CSS

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const ProductFormModal = ({ closeModal, establishmentId, onSuccess }) => {
  // Internal state for the product form
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    sale_price: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handler for the inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler to submit data to the API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const token = localStorage.getItem('authToken');

    try {
      const response = await fetch(`${apiUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, establishment_id: establishmentId })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error creating product.');

      onSuccess();  // Updates the list on the main page
      closeModal(); // Closes the modal

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        <h2>New Product</h2>
        <form onSubmit={handleSubmit}>
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Product Name" required />
          <input name="sku" value={formData.sku} onChange={handleChange} placeholder="SKU (Code - Optional)" />
          <input name="sale_price" type="number" value={formData.sale_price} onChange={handleChange} placeholder="Sale Price" required />
          {error && <p className={styles.error}>{error}</p>}
          <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}>
            {loading ? 'Saving...' : 'Save Product'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProductFormModal;