"use client";
import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { DragDropContext } from 'react-beautiful-dnd';
import styles from "./Agenda.module.css";

// Hooks e Componentes
import { useAgenda } from "./hooks/useAgenda";
import AgendaHeader from "./components/AgendaHeader";
import TimeGrid from "./components/TimeGrid";
import AppointmentDetailModal from "./components/AppointmentDetailModal";
import NewAppointmentModal from "./components/NewAppointmentModal";
import { useToast } from "../contexts/ToastProvider"; // Usando o Toast que criamos antes

const LoadingComponent = () => <div className={styles.loadingOverlay}>Carregando Agenda...</div>;
const ErrorComponent = ({ error }) => <div className={styles.errorOverlay}>{error}</div>;

export default function Agenda() {
  const params = useParams();
  const { id: establishmentId, idProfissional: professionalId } = params;
  const { showToast } = useToast();

  const {
    currentDate,
    appointments,
    loading,
    error,
    changeDate,
    updateAppointmentStatus,
    moveAppointment,
    createAppointment
  } = useAgenda(establishmentId, professionalId);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newAppointmentSlot, setNewAppointmentSlot] = useState(null); // { date, time }

  const handleUpdateStatus = async (newStatus) => {
    const success = await updateAppointmentStatus(selectedAppointment.id, newStatus);
    if (success) {
      showToast(`Agendamento ${newStatus.toLowerCase()}!`, "success");
      setSelectedAppointment(null);
    } else {
      showToast("Erro ao atualizar status.", "error");
    }
  };
  
  const handleCreateAppointment = async (data) => {
      const success = await createAppointment({ ...data, professional_id: professionalId, establishment_id: establishmentId });
      if (success) {
          showToast("Agendamento criado com sucesso!", "success");
          setNewAppointmentSlot(null);
      } else {
          showToast("Erro ao criar agendamento.", "error");
      }
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    // TODO: Implementar a lógica de conversão do droppableId para data/hora
    const newDate = currentDate; // Placeholder
    const newTime = destination.droppableId; // Placeholder

    const success = moveAppointment(draggableId, newDate, newTime);
    if (success) {
      showToast("Agendamento reagendado com sucesso!", "success");
    } else {
      showToast("Não foi possível reagendar neste horário.", "error");
    }
  };

  const weekDates = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }, [currentDate]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.agendaContainer}>
        <AgendaHeader currentDate={currentDate} onDateChange={changeDate} professionalName="Profissional" />
        
        {loading && <LoadingComponent />}
        {error && <ErrorComponent error={error} />}

        <main className={styles.mainContent}>
          {!loading && !error && (
            <TimeGrid
              weekDates={weekDates}
              appointments={appointments}
              onBlockClick={setSelectedAppointment}
              onEmptySlotClick={(date, time) => setNewAppointmentSlot({ date, time })}
            />
          )}
        </main>

        {selectedAppointment && (
          <AppointmentDetailModal
            appointment={selectedAppointment}
            onClose={() => setSelectedAppointment(null)}
            onUpdateStatus={handleUpdateStatus}
            onReschedule={() => showToast("Use o Arrastar e Soltar para reagendar!", "info")}
          />
        )}

        {newAppointmentSlot && (
            <NewAppointmentModal
                slot={newAppointmentSlot}
                onClose={() => setNewAppointmentSlot(null)}
                onSave={handleCreateAppointment}
            />
        )}
      </div>
    </DragDropContext>
  );
}