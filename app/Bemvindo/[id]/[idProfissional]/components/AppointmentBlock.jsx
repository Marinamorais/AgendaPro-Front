// app/Bemvindo/[id]/[idProfissional]/components/AppointmentBlock.jsx
import React from 'react';
import { parseISO, differenceInMinutes, getHours, getMinutes } from 'date-fns';
import styles from '../Agenda.module.css';

const AppointmentBlock = ({ appointment, dayIndex, onClick }) => {
    const start = parseISO(appointment.start_time);
    const end = parseISO(appointment.end_time);
    
    // Calcula a posição e a altura do bloco
    const startHour = getHours(start);
    const startMinute = getMinutes(start);
    const top = ((startHour - 7) * 60 + startMinute) / ((22 - 7) * 60) * 100;
    const duration = differenceInMinutes(end, start);
    const height = (duration / ((22 - 7) * 60)) * 100;

    const statusClass = styles[appointment.status.toLowerCase()] || '';

    return (
        <div
            className={`${styles.appointmentBlock} ${statusClass}`}
            style={{
                gridColumn: dayIndex + 2,
                top: `${top}%`,
                height: `${height}%`
            }}
            onClick={onClick}
        >
            <strong>{appointment.client?.full_name || "Cliente"}</strong>
            <span>{appointment.service?.name || "Serviço"}</span>
            <small>{appointment.asset?.name || ""}</small>
        </div>
    );
};

export default AppointmentBlock;