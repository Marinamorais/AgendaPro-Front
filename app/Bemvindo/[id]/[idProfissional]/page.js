"use client";

/**
 * @module BemVindo/[id]/[idProfissional]/Page
 * @description Página da agenda de um profissional específico.
 * Esta página também é "filha" do novo `layout.js`, então ela também pode
 * usar o `useToast()` sem medo de erros.
 */

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';

import styles from './Agenda.module.css';
// Agora podemos usar o hook de notificações aqui também!
import { useToast } from '../contexts/ToastProvider';
import { useAgenda } from './hooks/useAgenda'; // O hook que criamos para a lógica da agenda

// --- Componentes da Agenda ---
import AgendaHeader from './components/AgendaHeader';
import TimeGrid from './components/TimeGrid';
import AppointmentDetailModal from './components/AppointmentDetailModal';
import NewAppointmentModal from './components/NewAppointmentModal';

const LoadingComponent = () => <div className={styles.loadingOverlay}>Carregando Agenda...</div>;
const ErrorComponent = ({ error }) => <div className={styles.errorOverlay}>{error}</div>;

export default function ProfessionalAgendaPage() {
    const params = useParams();
    const { id: establishmentId, idProfissional: professionalId } = params;
    const { addToast } = useToast(); // FUNCIONA!

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
    const [newAppointmentSlot, setNewAppointmentSlot] = useState(null);

    const handleUpdateStatus = async (newStatus) => {
        if (!selectedAppointment) return;
        const success = await updateAppointmentStatus(selectedAppointment.id, newStatus);
        if (success) {
            addToast(`Agendamento ${newStatus.toLowerCase()} com sucesso!`, 'success');
            setSelectedAppointment(null);
        } else {
            addToast('Erro ao atualizar status. Tente novamente.', 'error');
        }
    };
    
    const handleCreateAppointment = async (data) => {
        const success = await createAppointment({ ...data, professional_id: professionalId, establishment_id: establishmentId });
        if (success) {
            addToast("Agendamento criado com sucesso!", "success");
            setNewAppointmentSlot(null);
        } else {
            addToast("Erro ao criar agendamento.", "error");
        }
    };

    const weekDates = useMemo(() => {
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        return Array.from({ length: 7 }, (_, i) => {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            return date;
        });
    }, [currentDate]);

    return (
        <div className={styles.agendaContainer}>
            <AgendaHeader
                professionalName={"Carregando..."} // Idealmente viria de um hook ou API
                weekStart={weekDates[0]}
                onNextWeek={() => changeDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}
                onPreviousWeek={() => changeDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}
                onToday={() => changeDate(new Date())}
            />
            
            {loading && <LoadingComponent />}
            {error && <ErrorComponent error={error} />}

            <main className={styles.mainContent}>
                {!loading && !error && (
                    <TimeGrid
                        weekStart={weekDates[0]}
                        appointments={appointments}
                        onAppointmentClick={setSelectedAppointment}
                        onEmptySlotClick={(date, time) => setNewAppointmentSlot({ date, time })}
                    />
                )}
            </main>

            <AnimatePresence>
                {selectedAppointment && (
                    <AppointmentDetailModal
                        appointment={selectedAppointment}
                        onClose={() => setSelectedAppointment(null)}
                        onStatusChange={handleUpdateStatus}
                    />
                )}

                {newAppointmentSlot && (
                    <NewAppointmentModal
                        slot={newAppointmentSlot}
                        onClose={() => setNewAppointmentSlot(null)}
                        onSave={handleCreateAppointment}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};