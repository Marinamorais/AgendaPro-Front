"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import styles from '../BemVindo.module.css';
import { api } from '../../../../service/api';
import useApi from '../hooks/useApi'; // Hook genérico para chamadas de API
import useDebounce from '../hooks/useDebounce'; // Hook para debounce da busca
import Table from './Table'; // Novo componente de tabela reutilizável

// Componente para o painel de detalhes do cliente
const ClienteDetailPanel = ({ cliente, onEdit, onDelete, onClose }) => {
    if (!cliente) {
        return (
            <div className={`${styles.detailPanel} ${styles.placeholder}`}>
                <p>Selecione um cliente para ver os detalhes</p>
            </div>
        );
    }

    return (
        <motion.div 
            className={styles.detailPanel}
            key={cliente.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <div className={styles.panelHeader}>
                <h3>Detalhes do Cliente</h3>
                <button onClick={onClose} className={styles.closePanelButton}>×</button>
            </div>
            <div className={styles.panelBody}>
                <h4>{cliente.full_name}</h4>
                <p><strong>Email:</strong> {cliente.email || 'Não informado'}</p>
                <p><strong>Telefone:</strong> {cliente.phone || 'Não informado'}</p>
                <p><strong>Último Atendimento:</strong> {cliente.last_appointment ? format(new Date(cliente.last_appointment), 'dd/MM/yyyy', { locale: ptBR }) : 'Nenhum'}</p>
                
                <div className={styles.kpiGridSmall}>
                    <div className={styles.kpiCardSmall}>
                        <span>Total Gasto</span>
                        <strong>R$ {cliente.total_spent || '0,00'}</strong>
                    </div>
                    <div className={styles.kpiCardSmall}>
                        <span>Ticket Médio</span>
                        <strong>R$ {cliente.avg_ticket || '0,00'}</strong>
                    </div>
                </div>

                <div className={styles.historySection}>
                    <h5>Histórico de Atendimentos</h5>
                    {/* Aqui viria uma lista/tabela de agendamentos do cliente */}
                    <p className={styles.placeholderText}>(Funcionalidade de histórico em breve)</p>
                </div>
            </div>
            <div className={styles.panelFooter}>
                <button className={styles.actionButton} onClick={() => onEdit(cliente)}>Editar</button>
                <button className={`${styles.actionButton} ${styles.danger}`} onClick={() => onDelete(cliente)}>Excluir</button>
            </div>
        </motion.div>
    );
};


// Componente principal da aba Clientes
const Clientes = ({ establishmentId, onAdd, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'full_name', direction: 'ascending' });
    const [selectedCliente, setSelectedCliente] = useState(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms de delay

    // Usando o hook de API para buscar os clientes
    const { data: clientes, loading, error, setData: setClientes } = useApi(() => 
        api.get('clients', { 
            establishment_id: establishmentId,
            search: debouncedSearchTerm,
            sortBy: sortConfig.key,
            order: sortConfig.direction,
        }),
        [establishmentId, debouncedSearchTerm, sortConfig] // Dependências da busca
    );
    
    // Configuração das colunas da tabela
    const columns = useMemo(() => [
        { key: 'full_name', label: 'Cliente' },
        { key: 'last_appointment', label: 'Último Atendimento', render: (date) => date ? format(new Date(date), 'dd/MM/yyyy') : '-' },
        { key: 'total_spent', label: 'Total Gasto', render: (value) => `R$ ${value || '0,00'}` },
        { key: 'avg_ticket', label: 'Ticket Médio', render: (value) => `R$ ${value || '0,00'}` },
    ], []);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
        }));
    };

    const handleRowClick = (cliente) => {
        setSelectedCliente(cliente);
    };

    return (
        <div className={styles.crmContainer}>
            <div className={styles.listPanel}>
                 <div className={styles.listHeader}>
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, telefone, nota..."
                        className={styles.searchInputFull}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className={styles.primaryButton} onClick={onAdd}>+ Novo Cliente</button>
                </div>
                <Table
                    columns={columns}
                    data={clientes}
                    loading={loading}
                    onSort={handleSort}
                    sortConfig={sortConfig}
                    onRowClick={handleRowClick}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    rowKey="id"
                    selectedRowId={selectedCliente?.id}
                />
            </div>
            
            <ClienteDetailPanel 
                cliente={selectedCliente} 
                onEdit={onEdit} 
                onDelete={onDelete} 
                onClose={() => setSelectedCliente(null)}
            />
        </div>
    );
};

export default Clientes;