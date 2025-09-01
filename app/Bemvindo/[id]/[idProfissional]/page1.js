"use client";
import React, { useState, useEffect, useCallback, useMemo, use } from 'react';
import { startOfWeek, endOfWeek, addWeeks, subWeeks } from 'date-fns';
import styles from './Agenda.module.css';
import AgendaHeader from './components/AgendaHeader';
import TimeGrid from './components/TimeGrid';
import AppointmentDetailModal from './components/AppointmentDetailModal';

// Simulação do serviço da API (coloque isso em um arquivo api.js se preferir)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const fetchData = async (endpoint, params) => {
    const token = localStorage.getItem('authToken');
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${apiUrl}/${endpoint}?${queryString}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error(`Falha ao buscar ${endpoint}`);
    return response.json();
};

const ProfessionalAgendaPage = ({ params }) => {
    // CORREÇÃO: Usa React.use() para resolver os parâmetros
    const resolvedParams = use(params);
    const { idProfissional } = resolvedParams;
    
    // Estado para a data atual que ancora a nossa semana
    const [currentDate, setCurrentDate] = useState(new Date());
    
    // Estados para os dados
    const [appointments, setAppointments] = useState([]);
    const [absences, setAbsences] = useState([]);
    const [professional, setProfessional] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Estado para o modal de detalhes
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // Calcula o início e o fim da semana com base na data atual
    const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]); // Começa na Segunda-feira
    const weekEnd = useMemo(() => endOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);

    // Função para buscar todos os dados da semana
    const fetchWeekData = useCallback(async () => {
        setLoading(true);
        try {
            const startDateISO = weekStart.toISOString().split('T')[0];
            const endDateISO = weekEnd.toISOString().split('T')[0];

            // Busca profissional, agendamentos e ausências em paralelo
            const [profData, appData, absenceData] = await Promise.all([
                fetchData(`professionals/${idProfissional}`, {}),
                fetchData('appointments', { 
                    professional_id: idProfissional,
                    startDate: startDateISO,
                    endDate: endDateISO
                }),
                fetchData('absences', {
                    professional_id: idProfissional,
                    startDate: startDateISO,
                    endDate: endDateISO
                })
            ]);
            
            setProfessional(profData);
            setAppointments(appData);
            setAbsences(absenceData);

        } catch (error) {
            console.error("Erro ao carregar dados da agenda:", error);
            alert("Não foi possível carregar os dados da agenda.");
        } finally {
            setLoading(false);
        }
    }, [idProfissional, weekStart, weekEnd]);

    // Efeito que recarrega os dados sempre que a semana muda
    useEffect(() => {
        if (idProfissional) {
            fetchWeekData();
        }
    }, [idProfissional, fetchWeekData]);

    // Funções de navegação
    const goToNextWeek = () => setCurrentDate(current => addWeeks(current, 1));
    const goToPreviousWeek = () => setCurrentDate(current => subWeeks(current, 1));
    const goToToday = () => setCurrentDate(new Date());

    return (
        <div className={styles.agendaContainer}>
            <AgendaHeader
                professionalName={professional?.full_name}
                weekStart={weekStart}
                onNextWeek={goToNextWeek}
                onPreviousWeek={goToPreviousWeek}
                onToday={goToToday}
            />
            {loading ? (
                <div className={styles.loading}>Carregando agenda...</div>
            ) : (
                <TimeGrid
                    weekStart={weekStart}
                    appointments={appointments}
                    absences={absences}
                    onAppointmentClick={setSelectedAppointment}
                />
            )}
            
            {selectedAppointment && (
                <AppointmentDetailModal
                    appointment={selectedAppointment}
                    onClose={() => setSelectedAppointment(null)}
                    onStatusChange={fetchWeekData} // Recarrega os dados se o status mudar
                />
            )}
        </div>
    );
};

export default ProfessionalAgendaPage;