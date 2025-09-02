"use client";

/**
 * @module components/Profissionais
 * @description Componente para gerenciar a lista de profissionais de um estabelecimento.
 * Permite visualização, busca, ordenação e disparo de ações de CRUD.
 */

// Importações de dependências do React, Next.js e Framer Motion.
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// Importação de estilos, serviços da API e hooks customizados.
import styles from '../BemVindo.module.css';
import { api } from '../../../../service/api';
// CORREÇÃO: Importa `useApi` como uma exportação nomeada.
import { useApi } from '../hooks/useApi';
import useDebounce from '../hooks/useDebounce';

// Importação de subcomponentes reutilizáveis.
import Table from './Table';

// --- Subcomponente para o Painel de Detalhes do Profissional ---

/**
 * @param {{
 * professional: object | null,
 * establishmentId: string,
 * onEdit: (item: object) => void,
 * onDelete: (item: object) => void,
 * onClose: () => void
 * }} props
 */
const ProfessionalDetailPanel = ({ professional, establishmentId, onEdit, onDelete, onClose }) => {
    const router = useRouter();

    // Hook para buscar os serviços associados a este profissional específico.
    // A chamada só é feita se `professional` existir.
    const { data: services, loading: servicesLoading } = useApi(() => 
        professional ? api.get(`professionals/${professional.id}/services`) : Promise.resolve([]),
        [professional] // Re-executa se o profissional selecionado mudar.
    );

    // Renderização de um placeholder se nenhum profissional estiver selecionado.
    if (!professional) {
        return (
            <div className={`${styles.detailPanel} ${styles.placeholder}`}>
                <p>Selecione um profissional da lista para ver os detalhes completos.</p>
            </div>
        );
    }

    // Função para navegar para a agenda específica deste profissional.
    const viewAgenda = () => {
        router.push(`/Bemvindo/${establishmentId}/${professional.id}`);
    };

    return (
        <motion.div 
            className={styles.detailPanel}
            key={professional.id} // Chave para garantir que o Framer Motion detecte a mudança e re-anime.
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            <div className={styles.panelHeader}>
                <h3>Detalhes do Profissional</h3>
                <button onClick={onClose} className={styles.closePanelButton} aria-label="Fechar painel de detalhes">×</button>
            </div>
            <div className={styles.panelBody}>
                <h4>{professional.full_name}</h4>
                <p><strong>Cargo:</strong> {professional.professional_role || 'Não informado'}</p>
                <p><strong>Email:</strong> {professional.email || 'Não informado'}</p>
                <p><strong>Telefone:</strong> {professional.phone || 'Não informado'}</p>
                
                <div className={styles.historySection}>
                    <h5>Serviços que realiza</h5>
                    {servicesLoading ? <p>Carregando serviços...</p> : (
                        <ul>
                            {services && services.length > 0 ? (
                                services.map(service => <li key={service.id}>{service.name}</li>)
                            ) : (
                                <li>Nenhum serviço associado a este profissional.</li>
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

/**
 * @param {{
 * establishmentId: string,
 * onAdd: () => void,
 * onEdit: (item: object) => void,
 * onDelete: (item: object) => void,
 * keyForReRender: number // Prop para forçar a re-busca de dados
 * }} props
 */
const Profissionais = ({ establishmentId, onAdd, onEdit, onDelete, keyForReRender }) => {
    // Estado para o termo de busca no input.
    const [searchTerm, setSearchTerm] = useState('');
    // Estado para a configuração de ordenação da tabela.
    const [sortConfig, setSortConfig] = useState({ key: 'full_name', direction: 'ascending' });
    // Estado para guardar qual profissional está atualmente selecionado para ver os detalhes.
    const [selectedProfessional, setSelectedProfessional] = useState(null);

    // Utiliza o hook useDebounce para evitar chamadas de API a cada tecla digitada.
    // A busca só será realizada 300ms após o usuário parar de digitar.
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Hook principal para buscar a lista de profissionais da API.
    const { data: professionals, loading, error } = useApi(() => 
        api.get('professionals', { 
            establishment_id: establishmentId,
            search: debouncedSearchTerm,
            sortBy: sortConfig.key,
            order: sortConfig.direction,
        }),
        // O hook re-executa a busca quando qualquer um destes valores mudar.
        [establishmentId, debouncedSearchTerm, sortConfig, keyForReRender] 
    );
    
    // Efeito para limpar o profissional selecionado se a lista de profissionais mudar (ex: após uma deleção).
    useEffect(() => {
        if (selectedProfessional && professionals) {
            const stillExists = professionals.some(p => p.id === selectedProfessional.id);
            if (!stillExists) {
                setSelectedProfessional(null);
            }
        }
    }, [professionals, selectedProfessional]);
    
    // Definição das colunas da tabela, memoizada com useMemo para performance.
    const columns = useMemo(() => [
        { key: 'full_name', label: 'Nome' },
        { key: 'professional_role', label: 'Cargo' },
        { key: 'email', label: 'Email' },
    ], []);

    // Função para lidar com a lógica de ordenação da tabela.
    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
        }));
    };

    return (
        <div className={styles.crmContainer}>
            {/* Painel esquerdo com a lista e busca */}
            <div className={styles.listPanel}>
                 <div className={styles.listHeader}>
                    <input
                        type="text"
                        placeholder="Pesquisar profissionais por nome ou cargo..."
                        className={styles.searchInputFull}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Pesquisar profissionais"
                    />
                    <button className={styles.primaryButton} onClick={onAdd}>+ Novo Profissional</button>
                </div>

                {/* Exibe mensagem de erro se a busca falhar */}
                {error && <p className={styles.errorState}>{error}</p>}
                
                {/* Componente de Tabela reutilizável */}
                <Table
                    columns={columns}
                    data={professionals}
                    loading={loading}
                    onSort={handleSort}
                    sortConfig={sortConfig}
                    onRowClick={(professional) => setSelectedProfessional(professional)}
                    onEdit={onEdit}   // Passa a função para o botão de editar da linha
                    onDelete={onDelete} // Passa a função para o botão de deletar da linha
                    rowKey="id"
                    selectedRowId={selectedProfessional?.id}
                />
            </div>
            
            {/* Painel direito com os detalhes do profissional selecionado */}
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
// FIM DO ARQUIVO