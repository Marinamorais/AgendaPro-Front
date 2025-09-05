"use client";

/**
 * @module components/Servicos
 * @description Componente para gerenciar a lista de serviços de um estabelecimento.
 * Exibe os serviços em uma tabela e permite busca, ordenação e ações de CRUD.
 */

// Core do React e bibliotecas
import React, { useState, useMemo } from 'react';
import { FaPlus } from 'react-icons/fa'; // Ícone para o botão de adicionar

// Módulos e Componentes locais
import styles from '../BemVindo.module.css';
import { api } from '../../../../service/api';
import { useApi } from '../hooks/useApi';
import useDebounce from '../hooks/useDebounce';
import Table from './Table';

/**
 * @param {{
 * establishmentId: number,
 * onAdd: () => void,
 * onEdit: (item: object) => void,
 * onDelete: (item: object) => void,
 * keyForReRender: number
 * }} props
 */
const Servicos = ({ establishmentId, onAdd, onEdit, onDelete, keyForReRender }) => {
  // Estados da UI
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  
  // Otimização da busca com debounce
  const debouncedSearchTerm = useDebounce(searchTerm, 350);

  // *** CORREÇÃO APLICADA AQUI ***
  // A chamada à API foi ajustada para usar a estrutura correta do SDK: `api.services.getAll`.
  const { data: services, loading, error } = useApi(() => 
    api.services.getAll({ 
      establishment_id: establishmentId,
      search: debouncedSearchTerm,
      sortBy: sortConfig.key,
      order: sortConfig.direction,
    }),
    [establishmentId, debouncedSearchTerm, sortConfig, keyForReRender]
  );

  // Função para lidar com a ordenação da tabela
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  // Memoização das colunas para evitar recriação a cada renderização.
  const columns = useMemo(() => [
    { key: 'name', label: 'Nome' },
    { 
      key: 'price', 
      label: 'Preço', 
      // Função de renderização mais robusta para formatar a moeda.
      render: (price) => (Number(price) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    },
    { 
      key: 'duration_minutes', 
      label: 'Duração', 
      render: (duration) => `${duration || 0} min` 
    },
    { key: 'description', label: 'Descrição' },
  ], []);

  // Exibe uma mensagem de erro clara se a busca falhar.
  if (error) {
    return <p className={styles.errorState}>Ocorreu um erro ao carregar os serviços: {error}</p>;
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
          aria-label="Pesquisar serviços"
        />
        <button onClick={onAdd} className={styles.primaryButton}>
          <FaPlus style={{ marginRight: '8px' }} />
          Novo Serviço
        </button>
      </div>

      <Table
        columns={columns}
        data={services || []}
        loading={loading}
        onEdit={onEdit}
        onDelete={onDelete}
        onSort={handleSort}
        sortConfig={sortConfig}
        rowKey="id"
      />
    </div>
  );
};

export default Servicos;