"use client";
import React, { useState, useCallback } from 'react';
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

/**
 * Página principal da Agenda, atuando como o "Controlador".
 * Orquestra o estado, as chamadas de API e a renderização dos componentes.
 */
export default function AgendaProfissionalPage() {
  const params = useParams();
  const { addToast } = useToast();
  const establishmentId = params.id;
  const professionalId = params.idProfissional;

  // O hook agora só fornece dados e controle de data.
  const { currentDate, appointments, professionalName, loading, error, changeWeek, goToToday, refreshAgenda } = useAgenda(establishmentId, professionalId);
  
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // --- LÓGICA DE API CENTRALIZADA AQUI ---

  const handleCreateAppointment = useCallback(async (payload) => {
    try {
      await api.create('appointments', payload);
      addToast('Agendamento criado com sucesso!', 'success');
      refreshAgenda(); // Recarrega os dados da agenda
      setSelectedSlot(null); // Fecha o modal
    } catch (err) {
      addToast(`Erro ao criar agendamento: ${err.message}`, 'error');
      throw err; // Lança o erro para o modal saber que falhou
    }
  }, [addToast, refreshAgenda]);

  const handleUpdateStatus = useCallback(async (appointmentId, newStatus) => {
    try {
      await api.update('appointments', appointmentId, { status: newStatus });
      addToast('Status atualizado com sucesso!', 'success');
      refreshAgenda();
      setSelectedAppointment(null); // Fecha o modal de detalhes
    } catch (err) {
      addToast(`Erro ao atualizar status: ${err.message}`, 'error');
    }
  }, [addToast, refreshAgenda]);

  const handleDragEnd = useCallback(async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId)) return;
    
    try {
      const appointmentId = draggableId;
      const newStartTime = `${destination.droppableId}T${source.droppableId.split(' ')[1]}:00`; // Lógica simplificada
      addToast('Função de arrastar ainda em desenvolvimento.', 'info');
      // Lógica de update da API viria aqui.
      // await api.update('appointments', appointmentId, { start_time: newStartTime });
      // refreshAgenda();
    } catch (err) {
      addToast(`Erro ao mover agendamento: ${err.message}`, 'error');
    }
  }, [addToast, refreshAgenda]);


  if (loading) return <div className={styles.centered}>Carregando agenda...</div>;
  if (error) return <div className={styles.centeredError}>{error}</div>;

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
        <DragDropContext onDragEnd={handleDragEnd}>
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
          onSave={handleCreateAppointment} // Passa a função de salvar correta
          establishmentId={establishmentId}
          professionalId={professionalId}
        />
      )}
      
      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onStatusChange={handleUpdateStatus}
        />
      )}
    </div>
  );
}