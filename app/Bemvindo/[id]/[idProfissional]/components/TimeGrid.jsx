// app/Bemvindo/[id]/[idProfissional]/components/TimeGrid.jsx
import React, { useState, useEffect } from 'react';
import { format, addDays, getDay, parseISO, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styles from '../Agenda.module.css';
import AppointmentBlock from './AppointmentBlock';

const TimeGrid = ({ weekStart, appointments, absences, onAppointmentClick }) => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const timeSlots = Array.from({ length: (22 - 7) * 2 }, (_, i) => {
        const hour = 7 + Math.floor(i / 2);
        const minute = (i % 2) * 30;
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    });

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Atualiza a cada minuto
        return () => clearInterval(timer);
    }, []);

    const timeIndicatorPosition = () => {
        const now = currentTime;
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0);
        const minutesPast = differenceInMinutes(now, startOfDay);
        return (minutesPast / ((22 - 7) * 60)) * 100;
    };
    
    return (
        <div className={styles.timeGridContainer}>
            <div className={styles.timeGrid}>
                <div className={styles.corner}></div>
                {days.map(day => (
                    <div key={day.toString()} className={styles.dayHeader}>
                        <span>{format(day, 'EEE', { locale: ptBR })}</span>
                        <strong>{format(day, 'd')}</strong>
                    </div>
                ))}
                
                {timeSlots.map(time => (
                    <React.Fragment key={time}>
                        <div className={styles.timeSlotLabel}>{time}</div>
                        {days.map(day => <div key={`${day.toString()}-${time}`} className={styles.timeSlot}></div>)}
                    </React.Fragment>
                ))}
                
                {/* Posiciona os Agendamentos */}
                {appointments.map(app => {
                    const appStart = parseISO(app.start_time);
                    const dayIndex = getDay(appStart) === 0 ? 6 : getDay(appStart) - 1; // Ajusta para semana começando na segunda
                    
                    return (
                        <AppointmentBlock
                            key={app.id}
                            appointment={app}
                            dayIndex={dayIndex}
                            onClick={() => onAppointmentClick(app)}
                        />
                    );
                })}
                
                {/* Indicador de Hora Atual */}
                <div 
                    className={styles.timeIndicator} 
                    style={{ top: `${timeIndicatorPosition()}%` }}
                />
            </div>
        </div>
    );
};

export default TimeGrid;