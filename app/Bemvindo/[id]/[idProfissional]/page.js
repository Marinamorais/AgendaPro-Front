"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DragDropContext } from 'react-beautiful-dnd';
import { useAgenda } from './hooks/useAgenda';
import { useToast } from '../contexts/ToastProvider';
import { api } from '../../../../service/api';
import { getWeekDays } from './utils/dateUtils';

import AgendaHeader from './components/AgendaHeader';
import TimeGrid from './components/TimeGrid';
import NewAppointmentModal from './components/NewAppointmentModal';
import AppointmentDetailModal from './components/AppointmentDetailModal';
import styles from './Agenda.module.css';

export default function AgendaProfissionalPage() {
  const params = useParams();
  const { addToast } = useToast();
  const establishmentId = params.id;
  const professionalId = params.idProfissional;

  const {
    currentDate,
    appointments,
    professionalName,
    loading: agendaLoading,
    error: agendaError,
    changeWeek,
    goToToday,
    refreshAgenda
  } = useAgenda(establishmentId, professionalId);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Estados para carregar dependências (clientes e serviços)
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [dependenciesLoading, setDependenciesLoading] = useState(true);

  // Busca os dados necessários para o modal de agendamento
  const fetchDependencies = useCallback(async () => {
    if (!establishmentId) return;
    setDependenciesLoading(true);
    try {
      const [clientsData, servicesData] = await Promise.all([
        api.clients.getAll({ establishment_id: establishmentId }),
        api.services.getAll({ establishment_id: establishmentId })
      ]);
      setClients(clientsData || []);
      setServices(servicesData || []);
    } catch (err) {
      addToast(`Erro ao carregar clientes e serviços: ${err.message}`, 'error');
    } finally {
      setDependenciesLoading(false);
    }
  }, [establishmentId, addToast]);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  const handleCreateAppointment = useCallback(async (payload) => {
    try {
      // CORREÇÃO: Usando o método correto 'api.appointments.create'
      await api.appointments.create(payload);
      addToast('Agendamento criado com sucesso!', 'success');
      refreshAgenda();
      setSelectedSlot(null);
    } catch (err) {
      addToast(`Erro ao criar agendamento: ${err.message}`, 'error');
      throw err;
    }
  }, [addToast, refreshAgenda]);

  const handleUpdateStatus = useCallback(async (appointmentId, newStatus) => {
    try {
       // CORREÇÃO: Usando o método correto 'api.appointments.update' e a rota de status
      await api.appointments.update(`${appointmentId}/status`, { status: newStatus });
      addToast('Status atualizado com sucesso!', 'success');
      refreshAgenda();
      setSelectedAppointment(null);
    } catch (err) {
      addToast(`Erro ao atualizar status: ${err.message}`, 'error');
    }
  }, [addToast, refreshAgenda]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    addToast('Funcionalidade de arrastar e soltar em desenvolvimento.', 'info');
  };
  
  const isLoading = agendaLoading || dependenciesLoading;

  if (isLoading) return <div className={styles.centered}>Carregando agenda...</div>;
  if (agendaError) return <div className={styles.centeredError}>{agendaError}</div>;

  return (
    <div className={styles.agendaContainer}>
      <AgendaHeader
        professionalName={professionalName}
        currentDate={currentDate}
        onNextWeek={() => changeWeek('next')}
        onPrevWeek={() => changeWeek('prev')}
        onToday={goToToday}
      />

      <main className={styles.mainContent}>
        <DragDropContext onDragEnd={onDragEnd}>
          <TimeGrid
            weekDates={getWeekDays(currentDate)}
            appointments={appointments}
            onSlotClick={(date, time) => setSelectedSlot({ date, time })}
            onAppointmentClick={setSelectedAppointment}
          />
        </DragDropContext>
      </main>

      {selectedSlot && (
        <NewAppointmentModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onSave={handleCreateAppointment}
          establishmentId={establishmentId}
          professionalId={professionalId}
          clients={clients}
          services={services}
          isLoading={dependenciesLoading}
        />
      )}

      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onUpdateStatus={(newStatus) => handleUpdateStatus(selectedAppointment.id, newStatus)}
          onReschedule={() => addToast('Funcionalidade de reagendamento em desenvolvimento.', 'info')}
        />
      )}
    </div>
  );
}