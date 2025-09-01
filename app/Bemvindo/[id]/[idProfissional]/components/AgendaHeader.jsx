// app/Bemvindo/[id]/[idProfissional]/components/AgendaHeader.jsx
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styles from '../Agenda.module.css';

const AgendaHeader = ({ professionalName, weekStart, onNextWeek, onPreviousWeek, onToday }) => {
    const formattedDate = format(weekStart, "MMMM 'de' yyyy", { locale: ptBR });
    
    return (
        <header className={styles.agendaHeader}>
            <div className={styles.headerTitle}>
                <h1>Agenda Semanal</h1>
                <h2>{professionalName || "Carregando..."}</h2>
            </div>
            <div className={styles.headerNav}>
                <button onClick={onPreviousWeek}>&lt;</button>
                <button onClick={onToday} className={styles.todayButton}>Hoje</button>
                <button onClick={onNextWeek}>&gt;</button>
                <span className={styles.dateDisplay}>{formattedDate}</span>
            </div>
        </header>
    );
};

export default AgendaHeader;