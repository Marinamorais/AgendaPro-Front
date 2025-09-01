"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// --- Imports de Componentes e Hooks ---
import styles from './BemVindo.module.css';
import { api } from '../../../service/api';
import { useToast, ToastProvider } from './contexts/ToastProvider';
import DashboardComponent from './components/DashboardComponent';
import Clientes from './components/Clientes'; // O novo componente de CRM
import List from './components/List';
import ConfirmationDialog from './components/ConfirmationDialog';
import ProfessionalFormModal from './components/ProfessionalFormModal';
import ClientFormModal from './components/ClientFormModal';
import ProductFormModal from './components/ProductFormModal';

// --- Configuração das Abas ---
const TABS_CONFIG = {
  dashboard: { label: 'Dashboard', component: DashboardComponent, endpoint: null },
  clientes: { label: 'Clientes', component: Clientes, endpoint: 'clients' },
  profissionais: { label: 'Profissionais', component: List, endpoint: 'professionals' },
  produtos: { label: 'Produtos', component: List, endpoint: 'products' },
  // Adicione outras abas aqui no futuro
};

// --- Componente Wrapper com Provider ---
// Para que os componentes filhos possam usar o `useToast`
const BemVindoPageWrapper = () => (
    <ToastProvider>
        <BemVindoPage />
    </ToastProvider>
);


// --- Componente Principal da Página ---
const BemVindoPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id: establishmentId } = params;
  const { addToast } = useToast();

  const [establishment, setEstablishment] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Estado para modais e diálogos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Efeito para carregar dados do estabelecimento do localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('establishment');
    if (storedData) {
      setEstablishment(JSON.parse(storedData));
    } else {
      // Em um app real, redirecionaria para o login se não houver dados
      console.error("Dados do estabelecimento não encontrados.");
      addToast("Erro: Faça login novamente.", 'error');
      router.push('/');
    }
  }, [router, addToast]);

  // --- Handlers para Modais e Ações ---
  const openModal = useCallback((item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingItem(null);
  }, []);

  const openDeleteDialog = useCallback((item) => {
    setItemToDelete(item);
  }, []);

  // --- Lógica de Sucesso e Deleção ---
  // O estado dos dados agora é gerenciado dentro de cada componente de aba
  // para mantê-los independentes. Esta função serve para notificar.
  const handleSuccess = useCallback(() => {
    closeModal();
    addToast(editingItem ? 'Item atualizado com sucesso!' : 'Item criado com sucesso!', 'success');
    // A atualização dos dados será feita pelo componente da aba ativa.
  }, [closeModal, addToast, editingItem]);

  const handleConfirmDelete = useCallback(async () => {
    if (!itemToDelete) return;
    const endpoint = TABS_CONFIG[activeTab].endpoint;

    try {
      await api.delete(endpoint, itemToDelete.id);
      addToast(`"${itemToDelete.full_name || itemToDelete.name}" foi deletado.`, 'success');
      // A atualização dos dados também será feita pelo componente da aba
    } catch (error) {
      addToast(`Erro ao deletar: ${error.message}`, 'error');
    } finally {
      setItemToDelete(null);
    }
  }, [itemToDelete, activeTab, addToast]);

  // --- Renderização ---
  const ActiveComponent = TABS_CONFIG[activeTab].component;

  const renderModalContent = () => {
    const commonProps = {
      establishmentId,
      onSuccess: handleSuccess,
      closeModal,
      initialData: editingItem,
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
        <div className={styles.sidebarFooter}>
            {/* Espaço para configurações, etc. */}
        </div>
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
                            // A prop `key` força a remontagem do componente ao deletar,
                            // o que aciona a busca de dados atualizada.
                            key={`${activeTab}-${itemToDelete}`} 
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
      </main>

      {/* --- Modais e Diálogos --- */}
      <AnimatePresence>
        {isModalOpen && activeTab !== 'dashboard' && (
            <div className={styles.modalBackdrop}>
                {renderModalContent()}
            </div>
        )}
        {itemToDelete && (
          <ConfirmationDialog
            title="Confirmar Exclusão"
            message={`Tem certeza que deseja excluir "${itemToDelete.full_name || itemToDelete.name}"? Esta ação não pode ser desfeita.`}
            onConfirm={handleConfirmDelete}
            onCancel={() => setItemToDelete(null)}
            confirmText="Excluir"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default BemVindoPageWrapper;