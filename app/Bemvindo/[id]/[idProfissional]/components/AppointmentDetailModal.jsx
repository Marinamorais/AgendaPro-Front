// app/Bemvindo/[id]/[idProfissional]/components/AppointmentDetailModal.jsx
import React from 'react';
import styles from '../Agenda.module.css';
import { FaUser, FaPhone, FaTools, FaCalendarAlt, FaClock } from 'react-icons/fa';

export default function AppointmentDetailModal({ appointment, onClose, onUpdateStatus, onReschedule }) {
  if (!appointment) return null;

  const { client_name, client_phone, service_name, date, start_time, status } = appointment;

  const renderActions = () => {
    switch (status) {
      case 'Agendado':
        return (
          <>
            <button onClick={() => onUpdateStatus('Confirmado')} className={styles.confirmButton}>Confirmar</button>
            <button onClick={onReschedule} className={styles.rescheduleButton}>Reagendar</button>
            <button onClick={() => onUpdateStatus('Cancelado')} className={styles.cancelButton}>Cancelar</button>
          </>
        );
      case 'Confirmado':
        return (
          <>
            <button onClick={() => onUpdateStatus('Finalizado')} className={styles.finishButton}>Finalizar</button>
            <button onClick={onReschedule} className={styles.rescheduleButton}>Reagendar</button>
            <button onClick={() => onUpdateStatus('Cancelado')} className={styles.cancelButton}>Cancelar</button>
          </>
        );
      case 'Finalizado':
        return <p className={styles.statusLabel}>Este agendamento foi finalizado.</p>;
      case 'Cancelado':
        return <p className={styles.statusLabel}>Este agendamento foi cancelado.</p>;
      default:
        return null;
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}>×</button>
        <h2>Detalhes do Agendamento</h2>
        <div className={styles.detailList}>
          <div className={styles.detailItem}><FaUser /> <strong>Cliente:</strong> {client_name}</div>
          <div className={styles.detailItem}><FaPhone /> <strong>Telefone:</strong> {client_phone || 'Não informado'}</div>
          <div className={styles.detailItem}><FaTools /> <strong>Serviço:</strong> {service_name}</div>
          <div className={styles.detailItem}><FaCalendarAlt /> <strong>Data:</strong> {new Date(date).toLocaleDateString()}</div>
          <div className={styles.detailItem}><FaClock /> <strong>Hora:</strong> {start_time}</div>
          <div className={styles.detailItem}><strong>Status:</strong> <span className={`${styles.statusBadge} ${styles[status?.toLowerCase()]}`}>{status}</span></div>
        </div>
        <div className={styles.modalActions}>
          {renderActions()}
        </div>
      </div>
    </div>
  );
}