"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import styles from '../BemVindo.module.css';
import { api } from '../../../../service/api';
import useApi from '../hooks/useApi';
import useDebounce from '../hooks/useDebounce';
import Table from './Table';

// --- Subcomponente para o Painel de Detalhes do Profissional ---
const ProfessionalDetailPanel = ({ professional, establishmentId, onEdit, onDelete, onClose }) => {
    const router = useRouter();

    // Hook para buscar os serviços associados a este profissional
    const { data: services, loading } = useApi(() => 
        professional ? api.get(`professionals/${professional.id}/services`) : Promise.resolve([]),
        [professional]
    );

    if (!professional) {
        return (
            <div className={`${styles.detailPanel} ${styles.placeholder}`}>
                <p>Selecione um profissional para ver os detalhes</p>
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
        >
            <div className={styles.panelHeader}>
                <h3>Detalhes do Profissional</h3>
                <button onClick={onClose} className={styles.closePanelButton}>×</button>
            </div>
            <div className={styles.panelBody}>
                <h4>{professional.full_name}</h4>
                <p><strong>Cargo:</strong> {professional.professional_role || 'Não informado'}</p>
                <p><strong>Email:</strong> {professional.email || 'Não informado'}</p>
                <p><strong>Telefone:</strong> {professional.phone || 'Não informado'}</p>
                
                <div className={styles.historySection}>
                    <h5>Serviços Realizados</h5>
                    {loading ? <p>Carregando serviços...</p> : (
                        <ul>
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
                <button className={`${styles.actionButton} ${styles.info}`} onClick={viewAgenda}>Ver Agenda</button>
                <button className={styles.actionButton} onClick={() => onEdit(professional)}>Editar</button>
                <button className={`${styles.actionButton} ${styles.danger}`} onClick={() => onDelete(professional)}>Excluir</button>
            </div>
        </motion.div>
    );
};


// --- Componente Principal da Aba Profissionais ---
const Profissionais = ({ establishmentId, onAdd, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'full_name', direction: 'ascending' });
    const [selectedProfessional, setSelectedProfessional] = useState(null);

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const { data: professionals, loading, error } = useApi(() => 
        api.get('professionals', { 
            establishment_id: establishmentId,
            search: debouncedSearchTerm,
            sortBy: sortConfig.key,
            order: sortConfig.direction,
        }),
        [establishmentId, debouncedSearchTerm, sortConfig]
    );
    
    const columns = useMemo(() => [
        { key: 'full_name', label: 'Nome' },
        { key: 'professional_role', label: 'Cargo' },
        { key: 'email', label: 'Email' },
    ], []);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
        }));
    };

    return (
        <div className={styles.crmContainer}>
            <div className={styles.listPanel}>
                 <div className={styles.listHeader}>
                    <input
                        type="text"
                        placeholder="Pesquisar por nome ou cargo..."
                        className={styles.searchInputFull}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className={styles.primaryButton} onClick={onAdd}>+ Novo Profissional</button>
                </div>
                {error && <p className={styles.errorMessage}>{error}</p>}
                <Table
                    columns={columns}
                    data={professionals}
                    loading={loading}
                    onSort={handleSort}
                    sortConfig={sortConfig}
                    onRowClick={(prof) => setSelectedProfessional(prof)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    rowKey="id"
                    selectedRowId={selectedProfessional?.id}
                />
            </div>
            
            <ProfessionalDetailPanel 
                professional={selectedProfessional} 
                establishmentId={establishmentId}
                onEdit={onEdit} 
                onDelete={onDelete} 
                onClose={() => setSelectedProfessional(null)}
            />
        </div>
    );
};

export default Profissionais;