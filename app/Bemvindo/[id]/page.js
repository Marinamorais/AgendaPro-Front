"use client";
import React, { useEffect, useState, useReducer, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import styles from './BemVindo.module.css';

// 1. IMPORTAÇÃO CENTRALIZADA: Agora importamos tudo do nosso serviço de API.
import { 
  getProfessionals, 
  getClients, 
  getProducts, 
  deleteData 
} from '../../../services/api'; // Ajuste o caminho para o seu api.js

import ProfessionalFormModal from './components/ProfessionalFormModal';
import ClientFormModal from './components/ClientFormModal';
import ProductFormModal from './components-ProductFormModal';
import List from './components/List';
import ModalContainer from './components/ModalContainer';

const TABS = {
  equipe: { label: 'Equipe', endpoint: 'professionals' },
  clientes: { label: 'Clientes', endpoint: 'clients' },
  produtos: { label: 'Produtos', endpoint: 'products' },
};

// ... (O reducer e initialState continuam os mesmos)

const BemVindoPage = () => {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [modalType, setModalType] = useState(null);
  const [activeTab, setActiveTab] = useState('equipe');
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { establishment, data, loading } = state;

  // 2. LÓGICA DE BUSCA REATORADA: Agora usa as funções específicas do api.js
  const loadAllData = useCallback(async (establishmentId) => {
    dispatch({ type: 'FETCH_START' });
    try {
      const [professionalsData, clientsData, productsData] = await Promise.all([
        getProfessionals(establishmentId),
        getClients(establishmentId),
        getProducts(establishmentId)
      ]);
      // Os dados já vêm prontos do axios, não precisa de .json()
      dispatch({ 
        type: 'FETCH_SUCCESS', 
        payload: { equipe: professionalsData.data, clientes: clientsData.data, produtos: productsData.data } 
      });
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
    } else {
        // Se não encontrar dados do estabelecimento, redireciona para o login
        router.push('/');
    }
  }, [loadAllData, router]);

  const handleSuccess = () => {
    if (establishment) loadAllData(establishment.id);
    setModalType(null);
    setEditingItem(null);
  };
  
  const handleEdit = (item) => {
    setEditingItem(item);
    setModalType(activeTab);
  };

  const handleDelete = async (id) => {
    const endpoint = TABS[activeTab].endpoint;
    const item = data[activeTab].find(i => i.id === id);
    const itemName = item?.full_name || item?.name || 'item';
    
    if (window.confirm(`Tem certeza que deseja deletar "${itemName}"?`)) {
      try {
        await deleteData(endpoint, id);
        if (establishment) loadAllData(establishment.id);
      } catch (error) {
        alert(error.response?.data?.message || 'Falha ao deletar.');
      }
    }
  };

  const handleSelectProfessional = (professionalId) => {
    if (establishment) {
      router.push(`/Bemvindo/${establishment.id}/${professionalId}`);
    }
  };

  // ... (filteredData e renderModal continuam os mesmos)

  return (
    <div className={styles.dashboard}>
      {/* ... (O JSX do Header, KPIs, Main, Abas, Busca e Modal continuam exatamente os mesmos) ... */}
      {/* ... A única diferença é que agora o List recebe onSelect dinamicamente ... */}

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
          {loading ? <p>Carregando dados...</p> : 
            <List 
              items={filteredData} 
              type={activeTab} 
              onEdit={handleEdit} 
              onDelete={handleDelete}
              onSelect={activeTab === 'equipe' ? handleSelectProfessional : null}
            />
          }
        </motion.div>
      </AnimatePresence>
      
      {/* ... (Restante do JSX) ... */}
    </div>
  );
};

export default BemVindoPage;