"use client";
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { format, parse } from 'date-fns';
import { api } from '../../../../../service/api';
import { useToast } from '../../contexts/ToastProvider';
import styles from '../Agenda.module.css';

// Schema de validação para o agendamento
const appointmentSchema = z.object({
  client_id: z.string().min(1, "Por favor, selecione um cliente."),
  service_id: z.string().min(1, "Por favor, selecione um serviço."),
  notes: z.string().optional(),
});

const NewAppointmentModal = ({ slot, onClose, onSave, establishmentId, professionalId }) => {
  const { addToast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(appointmentSchema),
  });

  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingDependencies, setLoadingDependencies] = useState(true);

  // Busca clientes e serviços quando o modal é aberto
  useEffect(() => {
    const fetchDependencies = async () => {
      setLoadingDependencies(true);
      try {
        const [clientsData, servicesData] = await Promise.all([
          api.get('clients', { establishment_id: establishmentId }),
          api.get('services', { establishment_id: establishmentId })
        ]);
        setClients(clientsData || []);
        setServices(servicesData || []);
      } catch (error) {
        addToast("Erro ao carregar dados para o agendamento.", 'error');
        console.error("Dependency fetch error:", error);
      } finally {
        setLoadingDependencies(false);
      }
    };
    fetchDependencies();
  }, [establishmentId, addToast]);

  const onSubmit = async (formData) => {
    if (!slot || !slot.date || !slot.time) {
      addToast("Erro: Dados de horário inválidos.", "error");
      return;
    }

    // Combina a data e a hora do slot em um objeto Date do JavaScript
    const dateTimeString = `${format(slot.date, 'yyyy-MM-dd')} ${slot.time}`;
    const startTime = parse(dateTimeString, 'yyyy-MM-dd HH:mm', new Date());

    // CORREÇÃO CENTRAL: Monta o payload exatamente como o backend espera
    const payload = {
      ...formData,
      client_id: parseInt(formData.client_id, 10),
      service_id: parseInt(formData.service_id, 10),
      professional_id: parseInt(professionalId, 10),
      establishment_id: parseInt(establishmentId, 10),
      start_time: startTime.toISOString(), // Envia a data e hora no formato ISO completo
      status: 'Agendado',
    };

    try {
      await onSave(payload); // Chama a função onSave passada pela página pai
    } catch (err) {
      // O erro já é tratado na página pai, que mostra o toast
      console.error("Falha ao salvar agendamento:", err);
    }
  };

  if (!slot) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <motion.div
        className={styles.modalContent}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Novo Agendamento</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        <p>Agendando para <strong>{format(slot.date, 'dd/MM/yyyy')}</strong> às <strong>{slot.time}</strong></p>
        
        {loadingDependencies ? <p>Carregando...</p> : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formGroup}>
              <label htmlFor="client_id">Cliente</label>
              <select id="client_id" {...register("client_id")} className={errors.client_id ? styles.inputError : styles.formSelect}>
                <option value="">Selecione um cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
              {errors.client_id && <p className={styles.errorMessage}>{errors.client_id.message}</p>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="service_id">Serviço</label>
              <select id="service_id" {...register("service_id")} className={errors.service_id ? styles.inputError : styles.formSelect}>
                <option value="">Selecione um serviço</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>)}
              </select>
              {errors.service_id && <p className={styles.errorMessage}>{errors.service_id.message}</p>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="notes">Observações</label>
              <textarea id="notes" {...register("notes")} rows="3" className={styles.formInput} />
            </div>

            <div className={styles.modalActions}>
              <button type="button" onClick={onClose} className={styles.secondaryButton}>Cancelar</button>
              <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar Agendamento'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default NewAppointmentModal;