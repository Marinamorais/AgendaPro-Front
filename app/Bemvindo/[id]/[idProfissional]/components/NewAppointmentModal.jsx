"use client";
import React, { useState } from 'react';
import styles from '../Agenda.module.css';

export default function NewAppointmentModal({ slot, onClose, onSave }) {
  const [formData, setFormData] = useState({
    client_name: '',
    service_name: '',
    duration_minutes: 30,
    date: slot.date,
    start_time: slot.time,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={styles.modalOverlay}>
      <form className={styles.modalContent} onSubmit={handleSubmit}>
        <button type="button" onClick={onClose} className={styles.closeButton}>×</button>
        <h2>Novo Agendamento</h2>
        <p>Agendando para {new Date(slot.date).toLocaleDateString()} às {slot.time}</p>
        
        <div className={styles.formGroup}>
          <label>Nome do Cliente</label>
          <input type="text" name="client_name" value={formData.client_name} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label>Serviço</label>
          <input type="text" name="service_name" value={formData.service_name} onChange={handleChange} required />
        </div>
        <div className={styles.formGroup}>
          <label>Duração (minutos)</label>
          <input type="number" name="duration_minutes" value={formData.duration_minutes} onChange={handleChange} required min="15" step="15" />
        </div>

        <div className={styles.modalActions}>
          <button type="submit" className={styles.saveButton}>Salvar Agendamento</button>
        </div>
      </form>
    </div>
  );
}