"use client";
import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import AppointmentBlock from './AppointmentBlock';
import styles from '../Agenda.module.css';

/**
 * TimeGrid Component
 * * Componente supremo e blindado para renderizar a grade de horários da agenda.
 * Lida com a renderização de dias, horários e agendamentos, incluindo a funcionalidade
 * de arrastar e soltar (Drag and Drop).
 * * @param {Date[]} weekDates - Array com os 7 objetos Date da semana.
 * @param {object[]} appointments - Array com os agendamentos da semana.
 * @param {function} onSlotClick - Função chamada ao clicar em um horário vago.
 * @param {function} onAppointmentClick - Função chamada ao clicar em um agendamento existente.
 */
const TimeGrid = ({ weekDates, appointments, onSlotClick, onAppointmentClick }) => {
  
  // Gera os horários para a coluna da esquerda (de 8h às 20h)
  const timeSlots = Array.from({ length: 13 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);

  return (
    <div className={styles.timeGridContainer}>
      {/* Coluna Estática de Horários (Esquerda) */}
      <div className={styles.timeColumn}>
        {timeSlots.map(time => (
          <div key={time} className={styles.timeSlotLabel}>
            {time}
          </div>
        ))}
      </div>

      {/* Conteúdo Principal da Grade com os Dias da Semana */}
      <div className={styles.gridContent}>
        {/* BLINDAGEM: Garante que o map não quebre se weekDates for nulo/undefined */}
        {(weekDates || []).map(date => {
          const dateString = format(date, 'yyyy-MM-dd');
          
          // BLINDAGEM: Garante que o filter não quebre se appointments for nulo/undefined
          const appointmentsForDay = (appointments || []).filter(app => 
            format(new Date(app.start_time), 'yyyy-MM-dd') === dateString
          );

          return (
            // Componente Droppable para cada coluna de dia
            <Droppable 
              droppableId={dateString} 
              key={dateString} 
              isDropDisabled={false} 
              isCombineEnabled={false}
              // CORREÇÃO SUPREMA: Adiciona a propriedade que faltava
              ignoreContainerClipping={false}
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={styles.dayColumn}
                  // Feedback visual quando um item está sendo arrastado sobre a coluna
                  style={{
                    backgroundColor: snapshot.isDraggingOver ? 'rgba(109, 40, 217, 0.1)' : 'transparent',
                  }}
                >
                  <div className={styles.dayHeader}>
                    <div className={styles.dayName}>{format(date, 'EEE', { locale: ptBR })}</div>
                    <div className={styles.dayNumber}>{format(date, 'd')}</div>
                  </div>

                  {/* Renderiza cada slot de horário dentro do dia */}
                  {timeSlots.map(time => {
                    const appointmentInSlot = appointmentsForDay.find(app => format(new Date(app.start_time), 'HH:mm') === time);
                    
                    return (
                      <div
                        key={time}
                        className={styles.timeSlot}
                        // Permite clicar apenas se o slot estiver vago
                        onClick={() => !appointmentInSlot && onSlotClick(date, time)}
                      >
                        {appointmentInSlot && (
                           <Draggable draggableId={String(appointmentInSlot.id)} index={0}>
                             {(provided) => (
                               <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  // Permite clicar no agendamento para ver detalhes
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