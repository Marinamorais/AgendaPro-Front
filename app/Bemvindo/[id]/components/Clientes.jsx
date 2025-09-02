"use client";

/**
 * @module components/Clientes
 * @description Componente de gerenciamento completo para a entidade "Clientes".
 * Responsável por:
 * - Exibir a lista de clientes em uma tabela paginada e ordenável.
 * - Fornecer funcionalidades de busca e filtro em tempo real.
 * - Orquestrar a abertura de modais para criação e edição de clientes.
 * - Exibir um painel de detalhes para o cliente selecionado.
 * - Lidar com a lógica de confirmação e exclusão.
 * Este componente é um "container inteligente" que gerencia o estado e passa props para
 * subcomponentes "burros" (de apresentação).
 */

// Importações do Core do React e Next.js
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Importações de Módulos e Componentes Locais
import styles from '../BemVindo.module.css';
import { api } from '../../../../service/api';
// A CORREÇÃO QUE RESOLVE O SEU ERRO ESTÁ AQUI:
// Importamos `useApi` usando chaves `{}` pois ele agora é uma exportação nomeada.
import { useApi } from '../hooks/useApi';
import useDebounce from '../hooks/useDebounce';
import Table from './Table';

// --- Subcomponente para o Histórico de Atendimentos ---
/**
 * Subcomponente especializado em buscar e renderizar o histórico de agendamentos de um único cliente.
 * @param {{ clientId: string | number, establishmentId: string | number }} props
 * @returns {JSX.Element}
 */
const AppointmentHistory = ({ clientId, establishmentId }) => {
    // Utiliza o hook `useApi` de forma isolada para buscar apenas os dados de que precisa.
    // Isso mantém o componente autônomo e fácil de manter.
    const { data: history, loading } = useApi(() => 
        api.getAppointments({ establishment_id: establishmentId, client_id: clientId }),
        [clientId, establishmentId]
    );

    if (loading) return <p className={styles.loadingText}>Carregando histórico...</p>;
    if (!history || history.length === 0) return <p className={styles.emptyText}>Nenhum atendimento anterior encontrado para este cliente.</p>;

    // Ordena o histórico para mostrar os agendamentos mais recentes primeiro.
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
};


// --- Subcomponente para o Painel de Detalhes do Cliente ---
/**
 * Painel lateral que exibe informações detalhadas de um cliente selecionado.
 * @param {{ cliente: object | null, ... }} props
 * @returns {JSX.Element}
 */
const ClienteDetailPanel = ({ cliente, establishmentId, onEdit, onDelete, onClose }) => {
    // Se nenhum cliente estiver selecionado, exibe um placeholder amigável.
    if (!cliente) {
        return (
            <div className={`${styles.detailPanel} ${styles.placeholder}`}>
                <p>Selecione um cliente da lista para ver os detalhes completos.</p>
            </div>
        );
    }

    return (
        // `AnimatePresence` garante que o painel tenha uma animação de saída suave.
        // O `key` no `motion.div` é crucial para o React e o Framer Motion entenderem que o conteúdo mudou.
        <AnimatePresence>
            <motion.div 
                className={styles.detailPanel}
                key={cliente.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} // Animação de saída para a esquerda
            >
                <div className={styles.panelHeader}>
                    <h3>Detalhes do Cliente</h3>
                    <button onClick={onClose} className={styles.closePanelButton} aria-label="Fechar painel de detalhes">×</button>
                </div>
                <div className={styles.panelBody}>
                    <h4>{cliente.full_name}</h4>
                    <p><strong>Email:</strong> {cliente.email || 'Não informado'}</p>
                    <p><strong>Telefone:</strong> {cliente.phone || 'Não informado'}</p>
                    <p>
                        <strong>Último Atendimento:</strong> {cliente.last_appointment ? format(parseISO(cliente.last_appointment), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Nenhum'}
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
        </AnimatePresence>
    );
};

// --- Componente Principal da Aba Clientes ---
/**
 * Orquestrador da aba de Clientes.
 * @param {{ establishmentId: string, onAdd: () => void, ... }} props
 * @returns {JSX.Element}
 */
const Clientes = ({ establishmentId, onAdd, onEdit, onDelete, keyForReRender }) => {
    // Estados para controlar a UI: termo de busca, ordenação da tabela e cliente selecionado.
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'full_name', direction: 'ascending' });
    const [selectedCliente, setSelectedCliente] = useState(null);

    // Hook `useDebounce` para otimizar a busca, evitando uma chamada de API a cada tecla digitada.
    const debouncedSearchTerm = useDebounce(searchTerm, 350); // Aumentado para 350ms

    // Hook `useApi` para buscar os dados dos clientes, passando todos os parâmetros de busca e ordenação.
    // O `keyForReRender` é um "truque" para forçar o hook a buscar os dados novamente após uma operação de CRUD.
    const { data: clientes, loading, error } = useApi(() => 
        api.get('clients', { 
            establishment_id: establishmentId,
            search: debouncedSearchTerm,
            sortBy: sortConfig.key,
            order: sortConfig.direction,
        }),
        [establishmentId, debouncedSearchTerm, sortConfig, keyForReRender]
    );
    
    // Definição das colunas da tabela, memoizada com `useMemo` para evitar recriação a cada renderização.
    const columns = useMemo(() => [
        { key: 'full_name', label: 'Cliente' },
        { key: 'last_appointment', label: 'Última Visita', render: (date) => date ? format(parseISO(date), 'dd/MM/yyyy') : 'Nunca' },
        { key: 'total_spent', label: 'Total Gasto', render: (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })},
        { key: 'avg_ticket', label: 'Ticket Médio', render: (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })},
    ], []);

    // Função para atualizar a configuração de ordenação quando o cabeçalho de uma coluna é clicado.
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
        }));
    };

    // Efeito para garantir que o painel de detalhes seja limpo se o cliente selecionado for excluído da lista.
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
                {error && <p className={styles.errorState}>{error}</p>}
                
                {/* Componente Tabela para exibir os dados */}
                <Table
                    columns={columns}
                    data={clientes}
                    loading={loading}
                    onSort={handleSort}
                    sortConfig={sortConfig}
                    onRowClick={setSelectedCliente} // Define o cliente selecionado ao clicar na linha
                    onEdit={onEdit}   // Propaga a função para o botão de editar na linha da tabela
                    onDelete={onDelete} // Propaga a função para o botão de deletar na linha da tabela
                    rowKey="id"
                    selectedRowId={selectedCliente?.id} // Passa o ID para a tabela destacar a linha selecionada
                />
            </div>
            
            {/* Painel da Direita: Detalhes do Cliente */}
            <ClienteDetailPanel 
                cliente={selectedCliente}
                establishmentId={establishmentId}
                onEdit={onEdit} 
                onDelete={onDelete} 
                onClose={() => setSelectedCliente(null)} // Função para fechar o painel
            />
        </div>
    );
};

export default Clientes;