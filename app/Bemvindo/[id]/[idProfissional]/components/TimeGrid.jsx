"use client";
import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AppointmentBlock from './AppointmentBlock';
import styles from '../Agenda.module.css';

const TimeGrid = ({ weekDates, appointments, onSlotClick, onAppointmentClick }) => {
  // Gera os horários para a coluna da esquerda (de 8h às 20h)
  const timeSlots = Array.from({ length: 13 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

  return (
    <div className={styles.timeGridContainer}>
      {/* Coluna de Horários */}
      <div className={styles.timeColumn}>
        {timeSlots.map(time => (
          <div key={time} className={styles.timeSlotLabel}>
            {time}
          </div>
        ))}
      </div>

      {/* Conteúdo da Grade (Dias da Semana) */}
      <div className={styles.gridContent}>
        {(weekDates || []).map(date => {
          const dateString = format(date, 'yyyy-MM-dd');
          const appointmentsForDay = (appointments || []).filter(app => format(new Date(app.start_time), 'yyyy-MM-dd') === dateString);

          return (
            // CORREÇÃO: Adicionamos a propriedade isCombineEnabled={false}
            <Droppable 
              droppableId={dateString} 
              key={dateString} 
              isDropDisabled={false} 
              isCombineEnabled={false}
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={styles.dayColumn}
                  style={{
                    backgroundColor: snapshot.isDraggingOver ? '#e0e7ff' : '#fff',
                  }}
                >
                  <div className={styles.dayHeader}>
                    <div className={styles.dayName}>{format(date, 'EEE', { locale: ptBR })}</div>
                    <div className={styles.dayNumber}>{format(date, 'd')}</div>
                  </div>

                  {timeSlots.map(time => {
                    const appointmentInSlot = appointmentsForDay.find(app => format(new Date(app.start_time), 'HH:mm') === time);
                    return (
                      <div
                        key={time}
                        className={styles.timeSlot}
                        onClick={() => !appointmentInSlot && onSlotClick(date, time)}
                      >
                        {appointmentInSlot && (
                           <Draggable draggableId={appointmentInSlot.id.toString()} index={0}>
                             {(provided, snapshot) => (
                               <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => onAppointmentClick(appointmentInSlot)}
                               >
                                  <AppointmentBlock appointment={appointmentInSlot} />
                               </div>
                             )}
                           </Draggable>
                        )}
                      </div>
                    );
                  })}
                   {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </div>
  );
};

export default TimeGrid;