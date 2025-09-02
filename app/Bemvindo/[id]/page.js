"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// --- Imports de Componentes e Hooks ---
import styles from './BemVindo.module.css';
import { api } from '../../../service/api';
import { ToastProvider, useToast } from './contexts/ToastProvider';

// --- Componentes das Abas ---
import DashboardComponent from './components/DashboardComponent';
import Clientes from './components/Clientes';
import Profissionais from './components/Profissionais';
import Produtos from './components/Produtos';

// --- Componentes de Modais ---
import ConfirmationDialog from './components/ConfirmationDialog';
import ProfessionalFormModal from './components/ProfessionalFormModal';
import ClientFormModal from './components/ClientFormModal';
import ProductFormModal from './components/ProductFormModal';

const TABS_CONFIG = {
  dashboard: { label: 'Dashboard', component: DashboardComponent },
  clientes: { label: 'Clientes', component: Clientes, endpoint: 'clients' },
  profissionais: { label: 'Profissionais', component: Profissionais, endpoint: 'professionals' },
  produtos: { label: 'Produtos', component: Produtos, endpoint: 'products' },
};

// --- Componente Principal da Página ---
const BemVindoPageContent = () => {
  const router = useRouter();
  const params = useParams();
  const { id: establishmentId } = params;
  const { addToast } = useToast();

  const [establishment, setEstablishment] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Estado para forçar re-renderização dos filhos após uma ação
  const [reRenderKey, setReRenderKey] = useState(0);

  // --- Gerenciamento de Modais ---
  const [modalState, setModalState] = useState({ isOpen: false, item: null });
  const [dialogState, setDialogState] = useState({ isOpen: false, item: null });
  
  useEffect(() => {
    const storedData = localStorage.getItem('establishment');
    if (storedData) {
      setEstablishment(JSON.parse(storedData));
    } else {
      console.error("Dados do estabelecimento não encontrados.");
      addToast("Erro: Faça login novamente.", 'error');
      router.push('/');
    }
  }, [router, addToast]);

  // --- Funções para controle dos Modais e Diálogos ---
  const openModal = useCallback((item = null) => setModalState({ isOpen: true, item }), []);
  const closeModal = useCallback(() => setModalState({ isOpen: false, item: null }), []);
  const openDeleteDialog = useCallback((item) => setDialogState({ isOpen: true, item }), []);
  const closeDeleteDialog = useCallback(() => setDialogState({ isOpen: false, item: null }), []);

  const forceReRender = () => setReRenderKey(prev => prev + 1);

  // --- Ações de CRUD ---
  const handleSuccess = useCallback(() => {
    const action = modalState.item ? 'atualizado' : 'criado';
    addToast(`Item ${action} com sucesso!`, 'success');
    closeModal();
    forceReRender(); // Força a atualização da lista
  }, [addToast, closeModal, modalState.item]);

  const handleConfirmDelete = useCallback(async () => {
    if (!dialogState.item) return;
    const endpoint = TABS_CONFIG[activeTab].endpoint;
    if (!endpoint) return;

    try {
      await api.delete(endpoint, dialogState.item.id);
      addToast(`"${dialogState.item.full_name || dialogState.item.name}" foi deletado.`, 'success');
      closeDeleteDialog();
      forceReRender(); // Força a atualização da lista
    } catch (error) {
      addToast(`Erro ao deletar: ${error.message}`, 'error');
      closeDeleteDialog();
    }
  }, [dialogState.item, activeTab, addToast, closeDeleteDialog]);

  // Renderiza o Componente da Aba Ativa
  const ActiveComponent = TABS_CONFIG[activeTab].component;

  // Renderiza o Modal de Formulário correto para a Aba Ativa
  const renderModalContent = () => {
    const commonProps = {
      establishmentId,
      onSuccess: handleSuccess,
      closeModal,
      initialData: modalState.item,
    };
    switch (activeTab) {
      case 'profissionais': return <ProfessionalFormModal {...commonProps} />;
      case 'clientes': return <ClientFormModal {...commonProps} />;
      case 'produtos': return <ProductFormModal {...commonProps} />;
      default: return null;
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <img src="https://i.imgur.com/0SkCPnh.png" alt="Logo" />
          <span>OiAgendaPro</span>
        </div>
        <nav className={styles.sidebarNav}>
          {Object.entries(TABS_CONFIG).map(([key, { label }]) => (
            <button
              key={key}
              className={activeTab === key ? styles.active : ''}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </nav>
        {/* Adicione um footer ou botão de logout se desejar */}
      </aside>
      
      <main className={styles.mainContent}>
        <header className={styles.mainHeader}>
          <h1>{establishment?.name || 'Carregando...'}</h1>
          <p>Seu centro de comando para decisões inteligentes.</p>
        </header>
        
        <div className={styles.contentArea}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab} // A animação acontece na troca de aba
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {ActiveComponent && (
                        <ActiveComponent
                            establishmentId={establishmentId}
                            onAdd={() => openModal()}
                            onEdit={openModal}
                            onDelete={openDeleteDialog}
                            keyForReRender={reRenderKey} // Passa a chave para o filho
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
      </main>

      {/* Renderização de Modais e Diálogos */}
      <AnimatePresence>
        {modalState.isOpen && activeTab !== 'dashboard' && (
            <div className={styles.modalBackdrop} onClick={closeModal}>
                {renderModalContent()}
            </div>
        )}
        {dialogState.isOpen && (
          <ConfirmationDialog
            title="Confirmar Exclusão"
            message={`Tem certeza que deseja excluir "${dialogState.item.full_name || dialogState.item.name}"? Esta ação não pode ser desfeita.`}
            onConfirm={handleConfirmDelete}
            onCancel={closeDeleteDialog}
            confirmText="Excluir"
          />
        )}
      </AnimatePresence>
    </div>
  );
};


// --- Componente Wrapper com o Provider de Notificações ---
const BemVindoPageWrapper = () => (
    <ToastProvider>
        <BemVindoPageContent />
    </ToastProvider>
);

export default BemVindoPageWrapper;