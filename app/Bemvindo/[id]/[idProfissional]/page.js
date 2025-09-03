"use client";
import React from 'react';
import { useParams } from 'next/navigation';
// CORREÇÃO: Importamos o DragDropContext
import { DragDropContext } from 'react-beautiful-dnd';
import { useAgenda } from './hooks/useAgenda';
import { getWeekDays } from './utils/dateUtils';

import AgendaHeader from './components/AgendaHeader';
import TimeGrid from './components/TimeGrid';
import NewAppointmentModal from './components/NewAppointmentModal';
import AppointmentDetailModal from './components/AppointmentDetailModal';
import styles from './Agenda.module.css';

export default function AgendaProfissionalPage() {
  const params = useParams();
  const establishmentId = params.id;
  const professionalId = params.idProfissional;

  const {
    currentDate,
    appointments,
    professionalName,
    loading,
    error,
    changeWeek,
    goToToday,
    refreshAgenda,
    createAppointment,
    updateAppointmentStatus,
  } = useAgenda(establishmentId, professionalId);
  
  const [isNewAppointmentModalOpen, setNewAppointmentModalOpen] = React.useState(false);
  const [selectedSlot, setSelectedSlot] = React.useState(null);
  const [selectedAppointment, setSelectedAppointment] = React.useState(null);

  const weekDates = getWeekDays(currentDate);

  const handleSlotClick = (date, time) => {
    setSelectedSlot({ date, time });
    setNewAppointmentModalOpen(true);
  };
  
  const handleAppointmentClick = (appointment) => {
      setSelectedAppointment(appointment);
  };

  const handleCloseNewAppointmentModal = () => {
    setNewAppointmentModalOpen(false);
    setSelectedSlot(null);
  };
  
  const handleCloseDetailModal = () => {
      setSelectedAppointment(null);
  };

  /**
   * Função para lidar com o final de uma ação de arrastar.
   * @param {object} result - O objeto com o resultado da ação.
   */
  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    // Se o item for solto fora de uma área válida, não faz nada
    if (!destination) {
      return;
    }

    // Se o item for solto no mesmo lugar, não faz nada
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    console.log('Agendamento movido!');
    console.log('ID do Agendamento:', draggableId);
    console.log('Coluna de Origem:', source.droppableId);
    console.log('Coluna de Destino:', destination.droppableId);
    
    // TODO: Adicionar lógica para atualizar o agendamento na API
    // Ex: updateAppointmentTime(draggableId, destination.droppableId);
  };


  if (loading) {
    return <div className={styles.centered}>Carregando agenda...</div>;
  }

  if (error) {
    return <div className={styles.centeredError}>{error}</div>;
  }

  return (
    // Removido o DndProvider que não é o correto para esta biblioteca
    <div className={styles.agendaContainer}>
      <AgendaHeader
        professionalName={professionalName}
        currentDate={currentDate}
        onNextWeek={() => changeWeek('next')}
        onPrevWeek={() => changeWeek('prev')}
        onToday={goToToday}
      />
      
      <main className={styles.mainContent}>
        {/* CORREÇÃO: Adicionamos o DragDropContext envolvendo o TimeGrid */}
        <DragDropContext onDragEnd={onDragEnd}>
          <TimeGrid
            weekDates={weekDates}
            appointments={appointments}
            onSlotClick={handleSlotClick}
            onAppointmentClick={handleAppointmentClick}
          />
        </DragDropContext>
      </main>

      {isNewAppointmentModalOpen && selectedSlot && (
        <NewAppointmentModal
          isOpen={isNewAppointmentModalOpen}
          onClose={handleCloseNewAppointmentModal}
          slotInfo={selectedSlot}
          establishmentId={establishmentId}
          professionalId={professionalId}
          onAppointmentCreated={refreshAgenda}
          createAppointment={createAppointment}
        />
      )}
      
      {selectedAppointment && (
        <AppointmentDetailModal
          isOpen={!!selectedAppointment}
          onClose={handleCloseDetailModal}
          appointment={selectedAppointment}
          onStatusChange={async (newStatus) => {
              await updateAppointmentStatus(selectedAppointment.id, newStatus);
              handleCloseDetailModal();
          }}
        />
      )}
    </div>
  );
}