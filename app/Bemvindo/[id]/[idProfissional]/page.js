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
 * Página principal da Agenda. Atua como o "Controlador Supremo".
 * Orquestra o estado, as chamadas de API e a renderização dos componentes.
 */
export default function AgendaProfissionalPage() {
  const params = useParams();
  const { addToast } = useToast();
  const establishmentId = params.id;
  const professionalId = params.idProfissional;

  // O hook agora é a nossa "Fonte da Verdade" para os dados da agenda.
  const { 
    currentDate, 
    appointments, 
    professionalName, 
    loading, 
    error, 
    changeWeek, 
    goToToday, 
    refreshAgenda // A função chave para a reatividade.
  } = useAgenda(establishmentId, professionalId);
  
  // Estados para controlar a visibilidade e os dados dos modais.
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // --- LÓGICA DE API CENTRALIZADA ---

  /**
   * Função suprema para criar um novo agendamento.
   * É passada para o modal, que apenas a executa com os dados do formulário.
   */
  const handleCreateAppointment = useCallback(async (payload) => {
    try {
      await api.create('appointments', payload);
      addToast('Agendamento criado com sucesso!', 'success');
      
      // A CORREÇÃO DEFINITIVA: Após o sucesso, comanda a atualização da agenda.
      refreshAgenda(); 
      
      setSelectedSlot(null); // Fecha o modal
    } catch (err) {
      addToast(`Erro ao criar agendamento: ${err.message}`, 'error');
      throw err; // Lança o erro para o modal saber que a operação falhou.
    }
  }, [addToast, refreshAgenda]);

  const handleUpdateStatus = useCallback(async (appointmentId, newStatus) => {
    try {
      await api.update('appointments', appointmentId, { status: newStatus });
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
    // Futura lógica de API para salvar a alteração viria aqui.
    // Ex: handleUpdateAppointmentTime(result.draggableId, result.destination.droppableId);
  };

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
        <DragDropContext onDragEnd={onDragEnd}>
          <TimeGrid
            weekDates={getWeekDays(currentDate)}
            appointments={appointments}
            onSlotClick={(date, time) => setSelectedSlot({ date, time })}
            onAppointmentClick={setSelectedAppointment}
          />
        </DragDropContext>
      </main>

      {/* O modal só é renderizado quando um slot é selecionado */}
      {selectedSlot && (
        <NewAppointmentModal
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onSave={handleCreateAppointment} // Passa a função de salvar, centralizada aqui.
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