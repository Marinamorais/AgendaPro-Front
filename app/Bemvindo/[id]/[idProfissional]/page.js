"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAgenda } from './hooks/useAgenda';
import { getWeekDays, generateTimeSlots } from './utils/dateUtils'; // Supondo que você tenha ou crie este utilitário

import AgendaHeader from './components/AgendaHeader';
import TimeGrid from './components/TimeGrid';
import NewAppointmentModal from './components/NewAppointmentModal';
import AppointmentDetailModal from './components/AppointmentDetailModal';
import styles from './Agenda.module.css';

// --- Função utilitária para gerar as datas da semana ---
// Você pode mover isso para um arquivo separado como 'utils/dateUtils.js' se preferir
const getWeekDates = (currentDate) => {
  const startOfWeek = new Date(currentDate);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Ajusta para a semana começar na segunda-feira
  startOfWeek.setDate(diff);

  return Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });
};


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
  
  // Hooks para controlar os modais
  const [isNewAppointmentModalOpen, setNewAppointmentModalOpen] = React.useState(false);
  const [selectedSlot, setSelectedSlot] = React.useState(null);
  const [selectedAppointment, setSelectedAppointment] = React.useState(null);

  // CORREÇÃO: Calculamos as datas da semana aqui
  const weekDates = getWeekDates(currentDate);

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

  if (loading) {
    return <div className={styles.centered}>Carregando agenda...</div>;
  }

  if (error) {
    return <div className={styles.centeredError}>{error}</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.agendaContainer}>
        <AgendaHeader
          professionalName={professionalName}
          currentDate={currentDate}
          onNextWeek={() => changeWeek('next')}
          onPrevWeek={() => changeWeek('prev')}
          onToday={goToToday}
        />
        
        <main className={styles.mainContent}>
          {/* CORREÇÃO: Passamos a prop 'weekDates' para o TimeGrid */}
          <TimeGrid
            weekDates={weekDates}
            appointments={appointments}
            onSlotClick={handleSlotClick}
            onAppointmentClick={handleAppointmentClick}
          />
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
    </DndProvider>
  );
}