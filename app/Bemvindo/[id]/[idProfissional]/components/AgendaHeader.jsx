"use client";
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styles from '../Agenda.module.css';

// CORREÇÃO: As props foram renomeadas para 'currentDate' e 'onPrevWeek'
// para corresponder exatamente ao que o componente pai (page.js) está enviando.
const AgendaHeader = ({ professionalName, currentDate, onNextWeek, onPrevWeek, onToday }) => {

    // Adicionamos uma verificação para garantir que 'currentDate' seja uma data válida antes de formatar.
    // Isso torna o componente mais resistente a erros.
    const formattedDate = currentDate ? format(currentDate, "MMMM 'de' yyyy", { locale: ptBR }) : "Carregando...";

    return (
        <header className={styles.agendaHeader}>
            <div className={styles.headerTitle}>
                <h1>Agenda de {professionalName}</h1>
                <span className={styles.currentMonth}>{formattedDate}</span>
            </div>
            <div className={styles.headerControls}>
                <button onClick={onPrevWeek} className={styles.navButton}>Anterior</button>
                <button onClick={onToday} className={styles.todayButton}>Hoje</button>
                <button onClick={onNextWeek} className={styles.navButton}>Próxima</button>
            </div>
        </header>
    );
};

export default AgendaHeader;