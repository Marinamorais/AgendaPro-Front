"use client";
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { api } from '../../../../../service/api';
import styles from '../Agenda.module.css';

const NewAppointmentModal = ({ isOpen, onClose, slotInfo, establishmentId, professionalId, onAppointmentCreated }) => {
  // Estado para os dados do formulário
  const [clientId, setClientId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('Agendado');

  // Estado para armazenar as listas de clientes e serviços
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  
  // Estado de carregamento e erro para os dropdowns
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Efeito para buscar os dados da API quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          // Promise.all para buscar ambos os dados em paralelo
          const [clientsResponse, servicesResponse] = await Promise.all([
            api.get('clients', { establishment_id: establishmentId }),
            api.get('services', { establishment_id: establishmentId })
          ]);
          setClients(clientsResponse || []);
          setServices(servicesResponse || []);
        } catch (err) {
          console.error("Erro ao buscar clientes ou serviços:", err);
          setError("Não foi possível carregar os dados. Tente novamente.");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isOpen, establishmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientId || !serviceId) {
        alert('Por favor, selecione um cliente e um serviço.');
        return;
    }

    const selectedService = services.find(s => s.id === parseInt(serviceId));

    const appointmentData = {
      client_id: parseInt(clientId),
      service_id: parseInt(serviceId),
      professional_id: parseInt(professionalId),
      establishment_id: parseInt(establishmentId),
      start_time: `${format(slotInfo.date, 'yyyy-MM-dd')}T${slotInfo.time}:00`,
      // A duração pode vir do serviço selecionado
      duration: selectedService?.duration || 60, 
      status,
      notes,
    };

    try {
      await api.create('appointments', appointmentData);
      onAppointmentCreated(); // Atualiza a agenda
      onClose(); // Fecha o modal
    } catch (error) {
      alert(`Erro ao criar agendamento: ${error.message}`);
    }
  };

  if (!isOpen) {
    return null;
  }
  
  // Formata a data e hora para exibição no título
  const formattedDateTime = `${format(slotInfo.date, 'dd/MM/yyyy')} às ${slotInfo.time}`;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Novo Agendamento</h2>
          <span>{formattedDateTime}</span>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          {loading && <p>Carregando clientes e serviços...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          
          {!loading && !error && (
            <>
              <div className={styles.formGroup}>
                <label htmlFor="client">Cliente</label>
                <select
                  id="client"
                  className={styles.formSelect}
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                >
                  <option value="" disabled>Selecione um cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="service">Serviço</label>
                <select
                  id="service"
                  className={styles.formSelect}
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  required
                >
                  <option value="" disabled>Selecione um serviço</option>
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - R$ {service.price}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="notes">Observações</label>
                <textarea
                  id="notes"
                  className={styles.formInput}
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </>
          )}

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.secondaryButton}>
              Cancelar
            </button>
            <button type="submit" className={styles.primaryButton} disabled={loading}>
              Salvar Agendamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAppointmentModal;