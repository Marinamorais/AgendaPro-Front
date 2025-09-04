"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { format, parseISO, isPast } from 'date-fns';
import { FaUser, FaTools, FaClock, FaCheckCircle, FaTimesCircle, FaDollarSign, FaHourglassHalf } from 'react-icons/fa';
import styles from '../Agenda.module.css';

// Configuração central para mapear status a estilos e ícones
const STATUS_CONFIG = {
  'Pendente': { className: styles.statusPendente, Icon: FaHourglassHalf, label: 'Pendente' },
  'Agendado': { className: styles.statusAgendado, Icon: FaClock, label: 'Agendado' },
  'Em Andamento': { className: styles.statusEmAndamento, Icon: FaHourglassHalf, label: 'Em Atendimento' },
  'Feito': { className: styles.statusFeito, Icon: FaCheckCircle, label: 'Feito' },
  'Cancelado': { className: styles.statusCancelado, Icon: FaTimesCircle, label: 'Cancelado' },
  // Status padrão para qualquer outro caso
  default: { className: styles.statusAgendado, Icon: FaClock, label: 'Agendado' }
};


const AppointmentBlock = ({ appointment }) => {
  if (!appointment) return null;

  // Desestruturação dos dados do agendamento, incluindo os objetos aninhados
  const { id, start_time, service, client, status } = appointment;

  // Extrai informações com segurança, com fallbacks para evitar erros
  const clientName = client?.full_name || 'Cliente não identificado';
  const serviceName = service?.name || 'Serviço não especificado';
  const duration = service?.duration_minutes || 60;

  const startTimeObj = parseISO(start_time);
  
  // Lógica de status dinâmico
  let currentStatusKey = status || 'Agendado';
  // Se o status for pendente e o horário já passou, trata como cancelado visualmente.
  if (currentStatusKey === 'Pendente' && isPast(startTimeObj)) {
    currentStatusKey = 'Cancelado';
  }
  
  const { className, Icon, label } = STATUS_CONFIG[currentStatusKey] || STATUS_CONFIG.default;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`${styles.appointmentBlock} ${className}`}
      title={`${serviceName} com ${clientName} - ${label}`}
    >
      <div className={styles.appointmentHeader}>
        <Icon title={label} />
        <strong>{format(startTimeObj, 'HH:mm')}</strong>
      </div>
      <div className={styles.appointmentBody}>
        <div className={styles.appointmentInfo}>
          <FaUser />
          <span>{clientName}</span>
        </div>
        <div className={styles.appointmentInfo}>
          <FaTools />
          <span>{serviceName}</span>
        </div>
        <div className={styles.appointmentInfo}>
          <FaClock />
          <span>{duration} min</span>
        </div>
      </div>
    </motion.div>
  );
};

export default AppointmentBlock;