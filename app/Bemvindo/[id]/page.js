"use client";

/**
 * @module BemVindo/[id]/Page
 * @description Página principal da área logada, com navegação por abas.
 * A estrutura foi refatorada para ser mais modular e fácil de manter,
 * utilizando um objeto de configuração para as abas.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import styles from './BemVindo.module.css';
import { api } from '../../../service/api';
import { useToast } from './contexts/ToastProvider';

// --- Imports dos componentes de cada aba ---
import DashboardComponent from './components/DashboardComponent';
import Clientes from './components/Clientes';
import Profissionais from './components/Profissionais';
import Produtos from './components/Produtos';
import Servicos from './components/Servicos'; // <<-- ADICIONADO

// --- Imports dos modais ---
import ConfirmationDialog from './components/ConfirmationDialog';
import ProfessionalFormModal from './components/ProfessionalFormModal';
import ClientFormModal from './components/ClientFormModal';
import ProductFormModal from './components/ProductFormModal';
import ServiceFormModal from './components/ServiceFormModal'; // <<-- ADICIONADO

// Objeto de configuração central para as abas
const TABS_CONFIG = {
  dashboard: { label: 'Dashboard', component: DashboardComponent },
  clientes: { label: 'Clientes', component: Clientes, endpoint: 'clients' },
  profissionais: { label: 'Profissionais', component: Profissionais, endpoint: 'professionals' },
  servicos: { label: 'Serviços', component: Servicos, endpoint: 'services' }, // <<-- ADICIONADO
  produtos: { label: 'Produtos', component: Produtos, endpoint: 'products' },
};

export default function BemVindoPage() {
  const router = useRouter();
  const params = useParams();
  const { id: establishmentId } = params;
  
  const { addToast } = useToast();

  const [establishment, setEstablishment] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [reRenderKey, setReRenderKey] = useState(0);
  const [modalState, setModalState] = useState({ isOpen: false, item: null });
  const [dialogState, setDialogState] = useState({ isOpen: false, item: null });
  
  useEffect(() => {
    const storedData = localStorage.getItem('establishment');
    if (storedData) {
      setEstablishment(JSON.parse(storedData));
    } else {
      addToast("Erro de autenticação. Por favor, faça login novamente.", 'error');
      router.push('/');
    }
  }, [router, addToast]);

  const openModal = useCallback((item = null) => setModalState({ isOpen: true, item }), []);
  const closeModal = useCallback(() => setModalState({ isOpen: false, item: null }), []);
  const openDeleteDialog = useCallback((item) => setDialogState({ isOpen: true, item }), []);
  const closeDeleteDialog = useCallback(() => setDialogState({ isOpen: false, item: null }), []);

  const forceReRender = () => setReRenderKey(prev => prev + 1);

  const handleSuccess = useCallback(() => {
    addToast(`Operação realizada com sucesso!`, 'success');
    closeModal();
    forceReRender();
  }, [addToast, closeModal]);

  const handleConfirmDelete = useCallback(async () => {
    if (!dialogState.item) return;
    const endpoint = TABS_CONFIG[activeTab].endpoint;
    if (!endpoint) return;

    try {
      await api.delete(endpoint, dialogState.item.id);
      addToast(`Item deletado com sucesso.`, 'success');
      closeDeleteDialog();
      forceReRender();
    } catch (error) {
      addToast(`Erro ao deletar: ${error.message}`, 'error');
      closeDeleteDialog();
    }
  }, [dialogState.item, activeTab, addToast, closeDeleteDialog]);

  const ActiveComponent = TABS_CONFIG[activeTab].component;

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
      case 'servicos': return <ServiceFormModal {...commonProps} />; // <<-- ADICIONADO
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
      </aside>
      
      <main className={styles.mainContent}>
        <header className={styles.mainHeader}>
          <h1>{establishment?.name || 'Carregando...'}</h1>
          <p>Seu centro de comando para decisões inteligentes.</p>
        </header>
        
        <div className={styles.contentArea}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
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
                            keyForReRender={reRenderKey}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
      </main>

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