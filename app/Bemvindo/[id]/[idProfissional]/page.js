"use client";
import React from 'react'; // Adicionado import completo do React
import { startOfWeek, endOfWeek, addWeeks, subWeeks, format } from 'date-fns';
import styles from './Agenda.module.css';
import AgendaHeader from './components/AgendaHeader';
import TimeGrid from './components/TimeGrid';
import AppointmentDetailModal from './components/AppointmentDetailModal';
import { fetchData } from '../../../../service/api';

const initialState = {
    professional: null,
    appointments: [],
    absences: [],
    loading: true,
    error: null,
};

function agendaReducer(state, action) {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, loading: true, error: null };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                loading: false,
                professional: action.payload.professional ?? state.professional,
                appointments: action.payload.appointments ?? state.appointments,
                absences: action.payload.absences ?? state.absences,
            };
        case 'FETCH_ERROR':
            return { ...state, loading: false, error: action.payload };
        default:
            throw new Error(`Ação desconhecida: ${action.type}`);
    }
}

const ProfessionalAgendaPage = ({ params }) => {
    // CORREÇÃO APLICADA AQUI:
    const { idProfissional } = React.use(params);

    const [state, dispatch] = React.useReducer(agendaReducer, initialState);
    const { professional, appointments, absences, loading, error } = state;
    
    const [currentDate, setCurrentDate] = React.useState(new Date());
    const [selectedAppointment, setSelectedAppointment] = React.useState(null);

    const weekStart = React.useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
    const weekEnd = React.useMemo(() => endOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);

    // Efeito para buscar dados estáticos do profissional apenas uma vez
    React.useEffect(() => {
        const fetchProfessionalData = async () => {
            try {
                const profData = await fetchData(`professionals/${idProfissional}`);
                dispatch({ type: 'FETCH_SUCCESS', payload: { professional: profData } });
            } catch (err) {
                dispatch({ type: 'FETCH_ERROR', payload: "Não foi possível carregar os dados do profissional." });
            }
        };

        if (idProfissional) {
            fetchProfessionalData();
        }
    }, [idProfissional]);

    // Efeito para buscar os dados dinâmicos da semana (agendamentos, ausências)
    const fetchWeekData = React.useCallback(async () => {
        dispatch({ type: 'FETCH_START' });
        try {
            const startDateISO = format(weekStart, 'yyyy-MM-dd');
            const endDateISO = format(weekEnd, 'yyyy-MM-dd');

            const [appData, absenceData] = await Promise.all([
                fetchData('appointments', { professional_id: idProfissional, startDate: startDateISO, endDate: endDateISO }),
                fetchData('absences', { professional_id: idProfissional, startDate: startDateISO, endDate: endDateISO })
            ]);
            
            dispatch({ type: 'FETCH_SUCCESS', payload: { appointments: appData, absences: absenceData } });
        } catch (err) {
            dispatch({ type: 'FETCH_ERROR', payload: "Não foi possível carregar os agendamentos." });
        }
    }, [idProfissional, weekStart, weekEnd]);
    
    React.useEffect(() => {
        if (idProfissional) {
            fetchWeekData();
        }
    }, [idProfissional, fetchWeekData]);

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
            {loading && <div className={styles.loading}>Carregando agenda...</div>}
            
            {error && !loading && <div className={styles.error}>{error}</div>}
            
            {!loading && !error && (
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
                    onStatusChange={fetchWeekData}
                />
            )}
        </div>
    );
};

export default ProfessionalAgendaPage;