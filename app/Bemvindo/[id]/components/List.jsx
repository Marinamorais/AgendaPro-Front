"use client";

import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
// Supondo que o CSS do List esteja no mesmo arquivo do BemVindo.module.css
// Se for um arquivo separado, ajuste o import. Ex: import styles from './List.module.css';
import styles from '../BemVindo.module.css';

// Função auxiliar movida para fora do componente para evitar recriação
const getItemDetails = (item, itemType) => {
  switch (itemType) {
    case 'produtos':
      return { name: item.name, detail: `R$ ${item.sale_price}` };
    case 'clientes':
      return { name: item.full_name, detail: item.email };
    case 'equipe':
    default:
      return { name: item.full_name, detail: item.professional_role };
  }
};

const List = ({ items, type, onEdit, onDelete, onSelect }) => {
  if (!items || items.length === 0) {
    return <p className={styles.emptyMessage}>Nenhum item cadastrado ainda.</p>;
  }

  return (
    <div className={styles.listGrid}>
      {items.map((item, index) => {
        const { name, detail } = getItemDetails(item, type);
        
        const handleSelect = () => {
            if (onSelect) {
                onSelect(item.id);
            }
        };

        return (
          <motion.div 
            key={item.id} 
            className={`${styles.card} ${onSelect ? styles.clickableCard : ''}`} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: index * 0.05 }}
            
            // Melhorias de acessibilidade
            role={onSelect ? "button" : "group"}
            tabIndex={onSelect ? 0 : -1}
            onClick={handleSelect}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelect();
                }
            }}
          >
            <div className={styles.avatar}>{name ? name.charAt(0).toUpperCase() : '?'}</div>
            
            <div className={styles.cardInfo}>
              <strong>{name}</strong>
              <span>{detail || 'Não especificado'}</span>
            </div>
            
            <div className={styles.cardActions}>
              <button 
                onClick={(e) => { e.stopPropagation(); onEdit(item); }} 
                className={styles.editButton} 
                aria-label={`Editar ${name}`}
              >
                ✏️
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} 
                className={styles.deleteButton} 
                aria-label={`Deletar ${name}`}
              >
                🗑️
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

// Definição das PropTypes para robustez
List.propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string,
        full_name: PropTypes.string,
    })).isRequired,
    type: PropTypes.oneOf(['equipe', 'clientes', 'produtos']).isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onSelect: PropTypes.func,
};

// Envolver com React.memo para otimização de performance
export default React.memo(List);