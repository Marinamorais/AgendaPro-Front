"use client";
import React, { useState, useMemo } from 'react';
import { useApi } from '../hooks/useApi';
import { api } from '../../../../service/api';
import useDebounce from '../hooks/useDebounce';
import Table from './Table';
import styles from '../BemVindo.module.css';

/**
 * Componente para a aba de gerenciamento de Serviços.
 * Recebe as funções de controle (onAdd, onEdit, onDelete) da página pai.
 */
const Servicos = ({ establishmentId, onAdd, onEdit, onDelete, keyForReRender }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Busca os serviços na API usando o hook customizado
  const { data: services, loading, error } = useApi(() => 
    api.get('services', { 
      establishment_id: establishmentId,
      search: debouncedSearchTerm,
      sortBy: sortConfig.key,
      order: sortConfig.direction,
    }),
    [establishmentId, debouncedSearchTerm, sortConfig, keyForReRender]
  );

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  // CORREÇÃO: As colunas agora usam 'key' e 'label' para compatibilidade com o componente Table.
  // Também corrigido 'duration_minutes'.
  const columns = useMemo(() => [
    { key: 'name', label: 'Nome' },
    { key: 'price', label: 'Preço', render: (price) => `R$ ${parseFloat(price || 0).toFixed(2)}` },
    { key: 'duration_minutes', label: 'Duração', render: (duration) => `${duration || 0} min` },
    { key: 'description', label: 'Descrição' },
  ], []);

  if (error) {
    return <p className={styles.errorState}>{error}</p>;
  }

  return (
    <div>
      <div className={styles.listHeader}>
        <input
          type="text"
          placeholder="Pesquisar serviços..."
          className={styles.searchInputFull}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={onAdd} className={styles.primaryButton}>
          + Novo Serviço
        </button>
      </div>

      <Table
        columns={columns}
        data={services || []}
        loading={loading}
        onEdit={onEdit}
        onDelete={onDelete} // Passa a função onDelete para a tabela
        onSort={handleSort}
        sortConfig={sortConfig}
        rowKey="id"
      />
    </div>
  );
};

export default Servicos;