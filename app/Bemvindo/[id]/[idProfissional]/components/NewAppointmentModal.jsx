"use client";
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { FaUser, FaSearch, FaTools } from 'react-icons/fa';
import styles from '../Agenda.module.css';

/**
 * Modal para criar um novo agendamento.
 * Com busca de clientes e UI aprimorada.
 */
export default function NewAppointmentModal({
  slot,
  onClose,
  onSave,
  establishmentId,
  professionalId,
  clients = [],
  services = [],
  isLoading
}) {
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showClientList, setShowClientList] = useState(false);

  // Filtra os clientes em tempo real conforme o usuário digita
  const filteredClients = useMemo(() => {
    if (!searchTerm) return [];
    return clients.filter(client =>
      client.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5); // Limita a 5 resultados para melhor performance
  }, [searchTerm, clients]);

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setSearchTerm(client.full_name);
    setShowClientList(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient || !selectedServiceId) {
      alert('Por favor, selecione um cliente e um serviço.');
      return;
    }
    setIsSaving(true);
    
    // O backend espera o start_time como um objeto Date ou string ISO
    const startTime = parseISO(`${format(slot.date, 'yyyy-MM-dd')}T${slot.time}:00`);

    const payload = {
      establishment_id: establishmentId,
      professional_id: professionalId,
      client_id: selectedClient.id,
      service_id: selectedServiceId,
      start_time: startTime.toISOString(),
      status: 'Agendado',
    };

    try {
      await onSave(payload);
    } catch (error) {
      // O erro já é tratado na página principal
    } finally {
      setIsSaving(false);
    }
  };

  if (!slot) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <motion.div
        className={styles.modalContentV2}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeaderV2}>
          <h2 className={styles.modalTitleV2}>Novo Agendamento</h2>
          <p className={styles.modalSubtitleV2}>
            Para <strong>{format(slot.date, 'dd/MM/yyyy')}</strong> às <strong>{slot.time}</strong>
          </p>
          <button onClick={onClose} className={styles.closeButtonV2}>×</button>
        </div>
        
        {isLoading ? <div className={styles.centered}>Carregando...</div> : (
          <form onSubmit={handleSubmit} className={styles.modalForm}>
            <div className={styles.formGroupV2}>
              <label htmlFor="client_search"><FaUser /> Cliente</label>
              <div className={styles.searchContainer}>
                <FaSearch className={styles.searchIcon} />
                <input
                  id="client_search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedClient(null); // Limpa o cliente selecionado ao digitar
                    setShowClientList(true);
                  }}
                  onFocus={() => setShowClientList(true)}
                  placeholder="Digite para buscar..."
                  autoComplete="off"
                  className={styles.formInputV2}
                />
                {showClientList && filteredClients.length > 0 && (
                  <ul className={styles.suggestionsList}>
                    {filteredClients.map(client => (
                      <li key={client.id} onMouseDown={() => handleSelectClient(client)}>
                        {client.full_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className={styles.formGroupV2}>
              <label htmlFor="service_id"><FaTools /> Serviço</label>
              <select
                id="service_id"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                required
                className={styles.formSelectV2}
              >
                <option value="" disabled>Selecione um serviço</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} - R$ {service.price}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.modalActionsV2}>
              <button type="button" onClick={onClose} className={`${styles.modalButtonV2} ${styles.secondary}`} disabled={isSaving}>
                Cancelar
              </button>
              <button type="submit" className={`${styles.modalButtonV2} ${styles.primary}`} disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar Agendamento'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}