"use client";

/**
 * @module components/Clientes
 * @description Componente de gerenciamento completo para a entidade "Clientes" (CRM).
 * Orquestra a exibição da lista de clientes, um painel de detalhes, busca e ações de CRUD.
 */

// Core do React e bibliotecas
import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Ícones para ações

// Módulos e Componentes locais
import styles from '../BemVindo.module.css';
import { api } from '../../../../service/api';
import { useApi } from '../hooks/useApi';
import useDebounce from '../hooks/useDebounce';
import Table from './Table'; // Componente de Tabela genérico

// --- Subcomponente Otimizado: Histórico de Atendimentos ---
/**
 * Busca e renderiza o histórico de agendamentos de um cliente.
 * Utiliza React.memo para evitar re-renderizações desnecessárias.
 * @param {{ clientId: number, establishmentId: number }} props
 */
const AppointmentHistory = memo(({ clientId, establishmentId }) => {
    // Hook useApi focado em buscar apenas os agendamentos deste cliente.
    const { data: history, loading, error } = useApi(() =>
        api.appointments.getAll({ establishment_id: establishmentId, client_id: clientId }),
        [clientId, establishmentId]
    );

    if (loading) return <p className={styles.loadingText}>Carregando histórico...</p>;
    if (error) return <p className={styles.errorText}>Erro ao buscar histórico.</p>;
    if (!history || history.length === 0) return <p className={styles.emptyText}>Nenhum atendimento anterior encontrado.</p>;

    // Ordena o histórico para mostrar os mais recentes primeiro.
    const sortedHistory = [...history].sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

    return (
        <div className={styles.tableWrapperSmall}>
            <table className={styles.historyTable}>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Serviço</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedHistory.map(app => (
                        <tr key={app.id}>
                            <td>{format(parseISO(app.start_time), 'dd/MM/yy', { locale: ptBR })}</td>
                            <td>{app.service_name}</td>
                            <td>
                                <span className={`${styles.statusBadgeSmall} ${styles[app.status?.toLowerCase()]}`}>
                                    {app.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});
AppointmentHistory.displayName = 'AppointmentHistory'; // Nome para o React DevTools

// --- Subcomponente Otimizado: Painel de Detalhes do Cliente ---
/**
 * Painel lateral que exibe informações detalhadas de um cliente.
 * Otimizado com React.memo.
 * @param {{ cliente: object | null, ... }} props
 */
const ClienteDetailPanel = memo(({ cliente, establishmentId, onEdit, onDelete, onClose }) => {
    if (!cliente) {
        return (
            <div className={`${styles.detailPanel} ${styles.placeholder}`}>
                <p>Selecione um cliente da lista para ver os detalhes completos.</p>
            </div>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                className={styles.detailPanel}
                key={cliente.id} // Chave para a animação funcionar na troca de clientes
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
            >
                <div className={styles.panelHeader}>
                    <h3>Detalhes do Cliente</h3>
                    <button onClick={onClose} className={styles.closePanelButton} aria-label="Fechar painel">×</button>
                </div>
                <div className={styles.panelBody}>
                    <h4>{cliente.full_name}</h4>
                    <p><strong>Email:</strong> {cliente.email || 'Não informado'}</p>
                    <p><strong>Telefone:</strong> {cliente.phone || 'Não informado'}</p>
                    <p><strong>Último Atendimento:</strong> {cliente.last_appointment ? format(parseISO(cliente.last_appointment), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Nenhum'}</p>
                    
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
                    <button className={styles.actionButton} onClick={() => onEdit(cliente)}> <FaEdit/> Editar</button>
                    <button className={`${styles.actionButton} ${styles.danger}`} onClick={() => onDelete(cliente)}> <FaTrash/> Excluir</button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
});
ClienteDetailPanel.displayName = 'ClienteDetailPanel';

// --- Componente Principal ---
/**
 * Componente container que gerencia a aba de Clientes.
 * @param {{ establishmentId: number, onAdd, onEdit, onDelete, keyForReRender }} props
 */
const Clientes = ({ establishmentId, onAdd, onEdit, onDelete, keyForReRender }) => {
    // Estados da UI
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'full_name', direction: 'ascending' });
    const [selectedCliente, setSelectedCliente] = useState(null);

    // Otimização da busca com debounce
    const debouncedSearchTerm = useDebounce(searchTerm, 350);

    // *** CORREÇÃO APLICADA AQUI ***
    // A chamada à API foi ajustada para usar a estrutura correta do SDK: `api.clients.getAll`.
    const { data: clientes, loading, error } = useApi(() =>
        api.clients.getAll({
            establishment_id: establishmentId,
            search: debouncedSearchTerm,
            sortBy: sortConfig.key,
            order: sortConfig.direction,
        }),
        [establishmentId, debouncedSearchTerm, sortConfig, keyForReRender]
    );
    
    // Memoização das colunas para evitar recriação a cada renderização.
    const columns = useMemo(() => [
        { key: 'full_name', label: 'Cliente' },
        { key: 'last_appointment', label: 'Última Visita', render: (date) => date ? format(parseISO(date), 'dd/MM/yyyy') : 'Nunca' },
        { key: 'total_spent', label: 'Total Gasto', render: (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })},
        { key: 'avg_ticket', label: 'Ticket Médio', render: (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })},
    ], []);

    // Função para lidar com a ordenação da tabela
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
        }));
    };

    // Efeito para limpar o painel de detalhes se o cliente selecionado for removido da lista.
    useEffect(() => {
        if (selectedCliente && clientes && !clientes.some(c => c.id === selectedCliente.id)) {
            setSelectedCliente(null);
        }
    }, [clientes, selectedCliente]);

    return (
        <div className={styles.crmContainer}>
            {/* Painel da Esquerda: Lista de Clientes */}
            <div className={styles.listPanel}>
                 <div className={styles.listHeader}>
                     <input
                         type="text"
                         placeholder="Pesquisar clientes por nome ou email..."
                         className={styles.searchInputFull}
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         aria-label="Campo de busca de clientes"
                     />
                     <button className={styles.primaryButton} onClick={onAdd}>+ Novo Cliente</button>
                 </div>

                 {/* Tratamento de estado de erro */}
                 {error && <p className={styles.errorState}>Ocorreu um erro ao carregar os clientes: {error}</p>}
                
                 {/* Componente de Tabela */}
                 <Table
                     columns={columns}
                     data={clientes}
                     loading={loading}
                     onSort={handleSort}
                     sortConfig={sortConfig}
                     onRowClick={setSelectedCliente}
                     onEdit={onEdit}
                     onDelete={onDelete}
                     rowKey="id"
                     selectedRowId={selectedCliente?.id}
                 />
            </div>
            
            {/* Painel da Direita: Detalhes do Cliente */}
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