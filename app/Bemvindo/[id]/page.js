"use client";

// Imports
import { useRouter } from 'next/navigation'; 
import React, { useEffect, useState, useReducer, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './BemVindo.module.css';
import { fetchData, deleteData } from '../../../service/api';
import ProfessionalFormModal from './components/ProfessionalFormModal';
import ClientFormModal from './components/ClientFormModal';
import ProductFormModal from './components/ProductFormModal';
import List from './components/List';
import ModalContainer from './components/ModalContainer';
import DashboardComponent from './components/DashboardComponent'; // Novo componente de dashboard

// Constantes e Reducer
const TABS = {
  dashboard: { label: 'Dashboard', endpoint: null }, // Aba do Dashboard
  profissionais: { label: 'Profissionais', endpoint: 'professionals' }, // Renomeado de 'equipe'
  clientes: { label: 'Clientes', endpoint: 'clients' },
  produtos: { label: 'Produtos', endpoint: 'products' },
};

const initialState = {
  establishment: null,
  data: { profissionais: [], clientes: [], produtos: [] }, // Renomeado de 'equipe'
  loading: true,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload };
    case 'SET_ESTABLISHMENT':
      return { ...state, establishment: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      throw new Error();
  }
}

// Componente Principal
const BemVindoPage = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [modalType, setModalType] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // A aba inicial agora é o dashboard
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const { establishment, data, loading } = state;

  const loadAllData = useCallback(async (establishmentId) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const [professionalsData, clientsData, productsData] = await Promise.all([
        fetchData('professionals', establishmentId),
        fetchData('clients', establishmentId),
        fetchData('products', establishmentId)
      ]);
      dispatch({ type: 'FETCH_SUCCESS', payload: { profissionais: professionalsData, clientes: clientsData, produtos: productsData } });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', payload: error.message });
    }
  }, []);

  useEffect(() => {
    const establishmentData = localStorage.getItem('establishment');
    if (establishmentData) {
      const establishmentObject = JSON.parse(establishmentData);
      dispatch({ type: 'SET_ESTABLISHMENT', payload: establishmentObject });
      loadAllData(establishmentObject.id);
    }
  }, [loadAllData]);

  const handleSuccess = useCallback(() => {
    if (establishment) loadAllData(establishment.id);
    setModalType(null);
    setEditingItem(null);
  }, [establishment, loadAllData]);
  
  const handleEdit = useCallback((item) => {
    setEditingItem(item);
    setModalType(activeTab);
  }, [activeTab]);

  const handleDelete = useCallback(async (id) => {
    const endpoint = TABS[activeTab].endpoint;
    if (!endpoint) return;

    const item = data[activeTab].find(i => i.id === id);
    const itemName = item?.full_name || item?.name || 'item';
    
    if (window.confirm(`Tem certeza que deseja deletar "${itemName}"?`)) {
      try {
        await deleteData(endpoint, id);
        if (establishment) loadAllData(establishment.id);
      } catch (error) {
        alert(error.message);
      }
    }
  }, [activeTab, data, establishment, loadAllData]);

  const handleProfessionalSelect = useCallback((professionalId) => {
    if (establishment?.id && professionalId) {
      router.push(`/Bemvindo/${establishment.id}/${professionalId}`);
    }
  }, [establishment?.id, router]);

  const filteredData = useMemo(() => {
    if (activeTab === 'dashboard' || !searchTerm) {
      return data[activeTab] || [];
    }
    return data[activeTab].filter(item =>
      (item.full_name || item.name).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, data, activeTab]);

  const renderModal = () => {
    if (!modalType || modalType === 'dashboard') return null;
    const commonProps = {
      establishmentId: establishment?.id,
      onSuccess: handleSuccess,
      closeModal: () => { setModalType(null); setEditingItem(null); },
      initialData: editingItem,
    };
    switch (modalType) {
      case 'profissionais': return <ProfessionalFormModal {...commonProps} />;
      case 'clientes': return <ClientFormModal {...commonProps} />;
      case 'produtos': return <ProductFormModal {...commonProps} />;
      default: return null;
    }
  };
  
  const renderContent = () => {
    if (loading) return <p>Carregando dados...</p>;
    if (activeTab === 'dashboard') {
        return <DashboardComponent data={data} loading={loading} />;
    }
    return (
        <List 
            items={filteredData} 
            type={activeTab} 
            onEdit={handleEdit} 
            onDelete={handleDelete}
            onSelect={activeTab === 'profissionais' ? handleProfessionalSelect : null}
        />
    );
  };

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Bem-vindo, {establishment?.name || 'Carregando...'}!</h1>
        <p>Este é o seu centro de comando. Decisões inteligentes começam aqui.</p>
      </header>
      
      <main className={styles.mainContent}>
        <div className={styles.sectionHeader}>
          <div className={styles.tabs}>
            {Object.keys(TABS).map(tabKey => (
              <button key={tabKey} onClick={() => setActiveTab(tabKey)} className={activeTab === tabKey ? styles.activeTab : ''}>
                {TABS[tabKey].label}
              </button>
            ))}
          </div>
          {activeTab !== 'dashboard' && (
            <>
              <div className={styles.searchWrapper}>
                 <input type="text" placeholder={`Buscar em ${TABS[activeTab].label}...`} className={styles.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <motion.button onClick={() => { setEditingItem(null); setModalType(activeTab); }} className={styles.addButton} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                + Adicionar
              </motion.button>
            </>
          )}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      <AnimatePresence>
        {modalType && <ModalContainer closeModal={() => { setModalType(null); setEditingItem(null); }}>{renderModal()}</ModalContainer>}
      </AnimatePresence>
    </div>
  );
};

export default BemVindoPage;