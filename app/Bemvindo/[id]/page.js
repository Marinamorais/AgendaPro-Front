"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './BemVindo.module.css';
import { fetchData } from '../../../service/api'; // Use o caminho correto para seu arquivo api.js
import ProfessionalFormModal from './components/ProfessionalFormModal';
import ClientFormModal from './components/ClientFormModal';
import ProductFormModal from './components/ProductFormModal';
import List from './components/List';
import ModalContainer from './components/ModalContainer';

const TABS = ['equipe', 'clientes', 'produtos'];
const ENDPOINTS = {
  equipe: 'professionals',
  clientes: 'clients',
  produtos: 'products',
};

const BemVindoPage = () => {
  const [establishment, setEstablishment] = useState(null);
  // O estado agora inicia vazio, esperando os dados da API
  const [data, setData] = useState({ equipe: [], clientes: [], produtos: [] });
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null);
  const [activeTab, setActiveTab] = useState('equipe');

  // Função para carregar todos os dados de forma otimizada
  const loadAllData = useCallback(async (establishmentId) => {
    setLoading(true);
    // Usa Promise.all para buscar tudo em paralelo
    const [professionalsData, clientsData, productsData] = await Promise.all([
      fetchData('professionals', establishmentId),
      fetchData('clients', establishmentId),
      fetchData('products', establishmentId)
    ]);
    setData({ equipe: professionalsData, clientes: clientsData, produtos: productsData });
    setLoading(false);
  }, []);

  // Efeito que busca os dados iniciais ao carregar a página
  useEffect(() => {
    const establishmentData = localStorage.getItem('establishment');
    if (establishmentData) {
      const establishmentObject = JSON.parse(establishmentData);
      setEstablishment(establishmentObject);
      loadAllData(establishmentObject.id);
    }
  }, [loadAllData]);

  // Função de sucesso que atualiza a lista correta e fecha o modal
  const handleSuccess = async () => {
    if (establishment) {
      setLoading(true);
      // Busca novamente apenas os dados da aba ativa para otimizar
      const endpoint = ENDPOINTS[activeTab];
      const updatedData = await fetchData(endpoint, establishment.id);
      setData(prevData => ({ ...prevData, [activeTab]: updatedData }));
      setLoading(false);
    }
    setModalType(null);
  };

  const renderModal = () => {
    if (!modalType) return null;
    const commonProps = {
      establishmentId: establishment?.id,
      onSuccess: handleSuccess,
      closeModal: () => setModalType(null),
    };
    switch (modalType) {
      case 'equipe': return <ProfessionalFormModal {...commonProps} />;
      case 'clientes': return <ClientFormModal {...commonProps} />;
      case 'produtos': return <ProductFormModal {...commonProps} />;
      default: return null;
    }
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Bem-vindo, {establishment?.name || 'Carregando...'}!</h1>
        <p>Gerencie sua operação em um só lugar.</p>
      </header>
      <main className={styles.mainContent}>
        <div className={styles.sectionHeader}>
          <div className={styles.tabs}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? styles.activeTab : ''}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <motion.button onClick={() => setModalType(activeTab)} className={styles.addButton} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            + Adicionar
          </motion.button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {loading ? <p>Carregando dados...</p> : <List items={data[activeTab]} type={activeTab} />}
          </motion.div>
        </AnimatePresence>
      </main>
      <AnimatePresence>
        {modalType && <ModalContainer closeModal={() => setModalType(null)}>{renderModal()}</ModalContainer>}
      </AnimatePresence>
    </div>
  );
};

export default BemVindoPage;