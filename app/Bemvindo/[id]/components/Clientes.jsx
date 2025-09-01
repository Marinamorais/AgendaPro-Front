"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import styles from '../BemVindo.module.css';
import { api } from '../../../../service/api';
import useApi from '../hooks/useApi';
import useDebounce from '../hooks/useDebounce';
import Table from './Table';

// --- Subcomponente para o Histórico de Atendimentos ---
const AppointmentHistory = ({ clientId, establishmentId }) => {
    const { data: history, loading } = useApi(() => 
        api.getAppointments({ establishment_id: establishmentId, client_id: clientId }),
        [clientId, establishmentId]
    );

    if (loading) return <p>Carregando histórico...</p>;
    if (!history || history.length === 0) return <p>Nenhum atendimento encontrado.</p>;

    return (
        <table className={styles.historyTable}>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Serviço</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {history.sort((a,b) => new Date(b.start_time) - new Date(a.start_time)).map(app => (
                    <tr key={app.id}>
                        <td>{format(parseISO(app.start_time), 'dd/MM/yy', { locale: ptBR })}</td>
                        <td>{app.service_name}</td>
                        <td>{app.status}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};


// --- Subcomponente para o Painel de Detalhes do Cliente ---
const ClienteDetailPanel = ({ cliente, establishmentId, onEdit, onDelete, onClose }) => {
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
                <p>
                    <strong>Último Atendimento:</strong> {cliente.last_appointment ? format(parseISO(cliente.last_appointment), 'dd/MM/yyyy', { locale: ptBR }) : 'Nenhum'}
                </p>
                
                <div className={styles.kpiGridSmall}>
                    <div className={styles.kpiCardSmall}>
                        <span>Total Gasto</span>
                        <strong>{(cliente.total_spent || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                    </div>
                    <div className={styles.kpiCardSmall}>
                        <span>Ticket Médio</span>
                        <strong>{(cliente.avg_ticket || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                    </div>
                </div>

                <div className={styles.historySection}>
                    <h5>Histórico de Atendimentos</h5>
                    <AppointmentHistory clientId={cliente.id} establishmentId={establishmentId} />
                </div>
            </div>
            <div className={styles.panelFooter}>
                <button className={styles.actionButton} onClick={() => onEdit(cliente)}>Editar</button>
                <button className={`${styles.actionButton} ${styles.danger}`} onClick={() => onDelete(cliente)}>Excluir</button>
            </div>
        </motion.div>
    );
};

// --- Componente Principal da Aba Clientes ---
const Clientes = ({ establishmentId, onAdd, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'full_name', direction: 'ascending' });
    const [selectedCliente, setSelectedCliente] = useState(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const { data: clientes, loading, error } = useApi(() => 
        api.get('clients', { 
            establishment_id: establishmentId,
            search: debouncedSearchTerm,
            sortBy: sortConfig.key,
            order: sortConfig.direction,
        }),
        [establishmentId, debouncedSearchTerm, sortConfig]
    );
    
    const columns = useMemo(() => [
        { key: 'full_name', label: 'Cliente' },
        { key: 'last_appointment', label: 'Último Atendimento', render: (date) => date ? format(parseISO(date), 'dd/MM/yyyy') : '-' },
        { key: 'total_spent', label: 'Total Gasto', render: (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })},
        { key: 'avg_ticket', label: 'Ticket Médio', render: (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })},
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

    // Atualiza o painel de detalhes se o cliente selecionado for editado/deletado
    useEffect(() => {
        if (selectedCliente && clientes) {
            const updatedClient = clientes.find(c => c.id === selectedCliente.id);
            setSelectedCliente(updatedClient || null);
        }
    }, [clientes, selectedCliente]);

    return (
        <div className={styles.crmContainer}>
            <div className={styles.listPanel}>
                 <div className={styles.listHeader}>
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, email..."
                        className={styles.searchInputFull}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className={styles.primaryButton} onClick={onAdd}>+ Novo Cliente</button>
                </div>
                {error && <p className={styles.errorMessage}>{error}</p>}
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
                establishmentId={establishmentId}
                onEdit={onEdit} 
                onDelete={onDelete} 
                onClose={() => setSelectedCliente(null)}
            />
        </div>
    );
};

export default Clientes;