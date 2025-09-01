"use client";
import React from 'react';
import { motion } from 'framer-motion';
import styles from '../BemVindo.module.css';

/**
 * Componente reutilizável para renderizar uma lista de itens (profissionais, clientes, produtos).
 * @param {Array} items - O array de dados a ser exibido.
 * @param {string} type - O tipo de item ('equipe', 'clientes', 'produtos').
 * @param {Function} onEdit - Função a ser chamada ao clicar no botão de editar.
 * @param {Function} onDelete - Função a ser chamada ao clicar no botão de deletar.
 * @param {Function | null} onSelect - Função a ser chamada ao clicar no card (usado para navegação).
 */
const List = ({ items, type, onEdit, onDelete, onSelect }) => {
  // Exibe uma mensagem se a lista estiver vazia.
  if (!items || items.length === 0) {
    return <p className={styles.emptyMessage}>Nenhum item cadastrado ainda.</p>;
  }

  // Função auxiliar para extrair os detalhes corretos de cada tipo de item.
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

  return (
    <div className={styles.listGrid}>
      {items.map((item, index) => {
        const { name, detail } = getItemDetails(item, type);
        
        return (
          <motion.div 
            key={item.id} 
            // Adiciona a classe 'clickableCard' SE a prop 'onSelect' for fornecida.
            className={`${styles.card} ${onSelect ? styles.clickableCard : ''}`} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: index * 0.05 }}
            // Executa a função onSelect (navegação) ao clicar no card, se ela existir.
            onClick={() => onSelect && onSelect(item.id)}
          >
            <div className={styles.avatar}>{name.charAt(0).toUpperCase()}</div>
            
            <div className={styles.cardInfo}>
              <strong>{name}</strong>
              <span>{detail || 'Não especificado'}</span>
            </div>
            
            {/* Contêiner para os botões de ação (editar, deletar) */}
            <div className={styles.cardActions}>
              <button 
                // Impede que o clique no botão propague para o card (e acione a navegação).
                onClick={(e) => { e.stopPropagation(); onEdit(item); }} 
                className={styles.editButton} 
                title={`Editar ${name}`}
              >
                ✏️
              </button>
              <button 
                // Impede que o clique no botão propague para o card.
                onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} 
                className={styles.deleteButton} 
                title={`Deletar ${name}`}
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

export default List;