import React from 'react';
import { motion } from 'framer-motion';
import styles from '../BemVindo.module.css';

const List = ({ items, type }) => {
  if (!items || items.length === 0) return <p>Nenhum item cadastrado ainda.</p>;

  const getItemDetails = (item, itemType) => {
    switch (itemType) {
      case 'produtos': return { name: item.name, detail: `R$ ${item.sale_price}` };
      case 'clientes': return { name: item.full_name, detail: item.email };
      case 'equipe': default: return { name: item.full_name, detail: item.professional_role };
    }
  };

  return (
    <div className={styles.listGrid}>
      {items.map((item, index) => {
        const { name, detail } = getItemDetails(item, type);
        return (
          <motion.div key={item.id} className={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <div className={styles.avatar}>{name.charAt(0).toUpperCase()}</div>
            <div className={styles.cardInfo}>
              <strong>{name}</strong>
              <span>{detail || 'Não especificado'}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default List;