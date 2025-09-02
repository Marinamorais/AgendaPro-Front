"use client";
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import styles from "../Agenda.module.css";
import { FaCheck, FaTimes, FaDollarSign, FaClock } from 'react-icons/fa';

export default function AppointmentBlock({ appointment, index, onBlockClick }) {
  const { id, start_time, duration_minutes, client_name, service_name, status } = appointment;

  const [hours, minutes] = start_time.split(":").map(Number);
  const topPosition = (hours * 60 + minutes) - (7 * 60); // Posição em minutos a partir das 7h
  const blockHeight = duration_minutes; // 1 minuto = 1px

  const statusConfig = {
    Agendado: { className: styles.agendado, Icon: FaClock, label: "Agendado" },
    Confirmado: { className: styles.confirmado, Icon: FaCheck, label: "Confirmado" },
    Finalizado: { className: styles.finalizado, Icon: FaDollarSign, label: "Finalizado" },
    Cancelado: { className: styles.cancelado, Icon: FaTimes, label: "Cancelado" },
  };

  const currentStatus = statusConfig[status] || statusConfig['Agendado'];

  return (
    <Draggable draggableId={String(id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`${styles.appointmentBlock} ${currentStatus.className} ${snapshot.isDragging ? styles.isDragging : ''}`}
          style={{
            top: `${topPosition}px`,
            height: `${blockHeight}px`,
            ...provided.draggableProps.style,
          }}
          onClick={() => onBlockClick(appointment)}
          title={`${service_name} com ${client_name} - ${currentStatus.label}`}
        >
          <div className={styles.appointmentContent}>
            <div className={styles.appointmentHeader}>
              <currentStatus.Icon className={styles.statusIcon} />
              <span className={styles.appointmentTime}>{start_time}</span>
            </div>
            <p className={styles.serviceName}>{service_name}</p>
            <p className={styles.clientName}>{client_name}</p>
          </div>
        </div>
      )}
    </Draggable>
  );
}