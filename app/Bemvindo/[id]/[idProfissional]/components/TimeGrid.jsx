"use client";
import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AppointmentBlock from './AppointmentBlock';
import styles from '../Agenda.module.css';

/**
 * TimeGrid Component
 * Componente visual para renderizar a grade de horários.
 */
const TimeGrid = ({ weekDates, appointments, onSlotClick, onAppointmentClick }) => {
  
  const timeSlots = Array.from({ length: 13 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

  return (
    <div className={styles.timeGridContainer}>
      <div className={styles.timeColumn}>
        {timeSlots.map(time => (
          <div key={time} className={styles.timeSlotLabel}>
            {time}
          </div>
        ))}
      </div>

      <div className={styles.gridContent}>
        {/* Blindagem: Garante que o map não quebre se weekDates for nulo/undefined */}
        {(weekDates || []).map(date => {
          const dateString = format(date, 'yyyy-MM-dd');
          
          // Blindagem: Garante que o filter não quebre se appointments for nulo/undefined
          const appointmentsForDay = (appointments || []).filter(app => 
            format(new Date(app.start_time), 'yyyy-MM-dd') === dateString
          );

          return (
            <Droppable 
              droppableId={dateString} 
              key={dateString} 
              isDropDisabled={false} 
              isCombineEnabled={false}
              ignoreContainerClipping={false}
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={styles.dayColumn}
                  style={{
                    backgroundColor: snapshot.isDraggingOver ? 'rgba(109, 40, 217, 0.1)' : 'transparent',
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
                           <Draggable draggableId={String(appointmentInSlot.id)} index={0}>
                             {(provided) => (
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