"use client";
import React, { useEffect, useState, useRef } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import styles from '../Agenda.module.css';
import AppointmentBlock from './AppointmentBlock';

const TimeIndicator = () => {
  const [top, setTop] = useState(0);
  const indicatorRef = useRef(null);

  useEffect(() => {
    const updatePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      // Converte hora atual em minutos desde o início do dia (7h)
      const totalMinutes = hours * 60 + minutes;
      const minutesFromStart = totalMinutes - (7 * 60); // 7h = 420 min
      // Calcula a posição. Cada minuto corresponde a 1px de altura
      const newTop = minutesFromStart;
      if (indicatorRef.current) {
        indicatorRef.current.style.top = `${newTop}px`;
      }
    };
    
    updatePosition();
    const interval = setInterval(updatePosition, 60000); // Atualiza a cada minuto
    return () => clearInterval(interval);
  }, []);

  return <div ref={indicatorRef} className={styles.timeIndicator}></div>;
};

export default function TimeGrid({ weekDates, appointments, onBlockClick, onEmptySlotClick }) {
  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7h às 21h

  const handleColumnClick = (e, date) => {
      if (e.target.classList.contains(styles.dayColumn)) {
          const rect = e.target.getBoundingClientRect();
          const clickY = e.clientY - rect.top;
          
          const hour = Math.floor(clickY / 60) + 7;
          const minute = Math.floor(((clickY % 60) / 60) * 2) * 30; // Arredonda para 00 ou 30
          
          const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
          onEmptySlotClick(date, time);
      }
  };

  return (
    <div className={styles.timeGrid}>
      <div className={styles.hoursColumn}>
        {hours.map(hour => (
          <div key={hour} className={styles.hourLabel}>{`${hour}:00`}</div>
        ))}
      </div>
      <div className={styles.gridContent}>
        {weekDates.map(date => {
          const dateString = date.toISOString().split('T')[0];
          return (
            <Droppable droppableId={dateString} key={dateString}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`${styles.dayColumn} ${snapshot.isDraggingOver ? styles.draggingOver : ''}`}
                  onClick={(e) => handleColumnClick(e, date)}
                >
                  <TimeIndicator />
                  {appointments
                    .filter(app => app.date === dateString)
                    .map((app, index) => (
                      <AppointmentBlock
                        key={app.id}
                        appointment={app}
                        index={index}
                        onBlockClick={onBlockClick}
                      />
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </div>
  );
}