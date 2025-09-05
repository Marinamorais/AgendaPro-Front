"use client";

/**
 * @module components/Profissionais
 * @description Componente de gerenciamento para a entidade "Profissionais".
 * Orquestra a lista, painel de detalhes, busca e ações de CRUD para profissionais.
 */

// Core do React e bibliotecas
import React, { useState, useMemo, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FaCalendarAlt, FaEdit, FaTrash } from 'react-icons/fa'; // Ícones

// Módulos e Componentes locais
import styles from '../BemVindo.module.css';
import { api } from '../../../../service/api';
import { useApi } from '../hooks/useApi';
import useDebounce from '../hooks/useDebounce';
import Table from './Table';

// --- Subcomponente Otimizado: Painel de Detalhes do Profissional ---
/**
 * Painel lateral que exibe informações detalhadas de um profissional.
 * Otimizado com React.memo para performance.
 * @param {{ professional: object | null, ... }} props
 */
const ProfessionalDetailPanel = memo(({ professional, establishmentId, onEdit, onDelete, onClose }) => {
    const router = useRouter();

    // *** CORREÇÃO APLICADA AQUI ***
    // A chamada foi ajustada para usar um método específico do SDK da API,
    // garantindo consistência e separação de responsabilidades.
    const { data: services, loading: servicesLoading, error: servicesError } = useApi(() => 
        professional ? api.professionals.getServices(professional.id) : null,
        [professional]
    );

    if (!professional) {
        return (
            <div className={`${styles.detailPanel} ${styles.placeholder}`}>
                <p>Selecione um profissional para ver os detalhes.</p>
            </div>
        );
    }

    const viewAgenda = () => {
        router.push(`/Bemvindo/${establishmentId}/${professional.id}`);
    };

    return (
        <motion.div 
            className={styles.detailPanel}
            key={professional.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <div className={styles.panelHeader}>
                <h3>Detalhes do Profissional</h3>
                <button onClick={onClose} className={styles.closePanelButton} aria-label="Fechar painel">×</button>
            </div>
            <div className={styles.panelBody}>
                <h4>{professional.full_name}</h4>
                <p><strong>Cargo:</strong> {professional.professional_role || 'Não informado'}</p>
                <p><strong>Email:</strong> {professional.email || 'Não informado'}</p>
                <p><strong>Telefone:</strong> {professional.phone || 'Não informado'}</p>
                
                <div className={styles.historySection}>
                    <h5>Serviços que realiza</h5>
                    {servicesLoading && <p className={styles.loadingText}>Carregando serviços...</p>}
                    {servicesError && <p className={styles.errorText}>Erro ao buscar serviços.</p>}
                    {!servicesLoading && !servicesError && (
                        <ul className={styles.serviceList}>
                            {services && services.length > 0 ? (
                                services.map(service => <li key={service.id}>{service.name}</li>)
                            ) : (
                                <li>Nenhum serviço associado.</li>
                            )}
                        </ul>
                    )}
                </div>
            </div>
            <div className={styles.panelFooter}>
                <button className={`${styles.actionButton} ${styles.info}`} onClick={viewAgenda}><FaCalendarAlt/> Ver Agenda</button>
                <button className={styles.actionButton} onClick={() => onEdit(professional)}><FaEdit/> Editar</button>
                <button className={`${styles.actionButton} ${styles.danger}`} onClick={() => onDelete(professional)}><FaTrash/> Excluir</button>
            </div>
        </motion.div>
    );
});
ProfessionalDetailPanel.displayName = 'ProfessionalDetailPanel';

// --- Componente Principal ---
/**
 * Componente container que gerencia a aba de Profissionais.
 * @param {{ establishmentId: number, onAdd, onEdit, onDelete, keyForReRender }} props
 */
const Profissionais = ({ establishmentId, onAdd, onEdit, onDelete, keyForReRender }) => {
    // Estados da UI
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'full_name', direction: 'ascending' });
    const [selectedProfessional, setSelectedProfessional] = useState(null);

    // Otimização da busca com debounce
    const debouncedSearchTerm = useDebounce(searchTerm, 350);

    // *** CORREÇÃO APLICADA AQUI ***
    // A chamada à API foi ajustada para usar `api.professionals.getAll`.
    const { data: professionals, loading, error } = useApi(() => 
        api.professionals.getAll({ 
            establishment_id: establishmentId,
            search: debouncedSearchTerm,
            sortBy: sortConfig.key,
            order: sortConfig.direction,
        }),
        [establishmentId, debouncedSearchTerm, sortConfig, keyForReRender] 
    );
    
    // Efeito para limpar o painel de detalhes se o profissional for removido da lista.
    useEffect(() => {
        if (selectedProfessional && professionals && !professionals.some(p => p.id === selectedProfessional.id)) {
            setSelectedProfessional(null);
        }
    }, [professionals, selectedProfessional]);
    
    // Memoização das colunas da tabela para performance.
    const columns = useMemo(() => [
        { key: 'full_name', label: 'Nome' },
        { key: 'professional_role', label: 'Cargo' },
        { key: 'email', label: 'Email' },
    ], []);

    // Função para lidar com a ordenação da tabela.
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
        }));
    };

    return (
        <div className={styles.crmContainer}>
            {/* Painel da Esquerda: Lista de Profissionais */}
            <div className={styles.listPanel}>
                <div className={styles.listHeader}>
                    <input
                        type="text"
                        placeholder="Pesquisar profissionais..."
                        className={styles.searchInputFull}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Pesquisar profissionais"
                    />
                    <button className={styles.primaryButton} onClick={onAdd}>+ Novo Profissional</button>
                </div>

                {error && <p className={styles.errorState}>Ocorreu um erro ao carregar os profissionais: {error}</p>}
                
                <Table
                    columns={columns}
                    data={professionals}
                    loading={loading}
                    onSort={handleSort}
                    sortConfig={sortConfig}
                    onRowClick={setSelectedProfessional}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    rowKey="id"
                    selectedRowId={selectedProfessional?.id}
                />
            </div>
            
            {/* Painel da Direita: Detalhes com Animação */}
            <AnimatePresence>
                <ProfessionalDetailPanel 
                    professional={selectedProfessional} 
                    establishmentId={establishmentId}
                    onEdit={onEdit} 
                    onDelete={onDelete} 
                    onClose={() => setSelectedProfessional(null)}
                />
            </AnimatePresence>
        </div>
    );
};

export default Profissionais;