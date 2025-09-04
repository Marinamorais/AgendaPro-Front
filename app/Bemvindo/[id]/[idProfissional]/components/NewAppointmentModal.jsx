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

// Schema de validação Zod: Um contrato que os dados DEVEM seguir.
const appointmentSchema = z.object({
  client_id: z.string().uuid("Por favor, selecione um cliente válido."),
  service_id: z.string().uuid("Por favor, selecione um serviço válido."),
  notes: z.string().optional(),
});

/**
 * Modal para criar um novo agendamento.
 * Blindado, robusto e com validação de dados de nível supremo.
 */
const NewAppointmentModal = ({ slot, onClose, onSave, establishmentId, professionalId }) => {
  const { addToast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(appointmentSchema),
  });

  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingDependencies, setLoadingDependencies] = useState(true);

  // Busca clientes e serviços de forma segura quando o modal é aberto.
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
        addToast("Erro fatal: Não foi possível carregar clientes e serviços.", 'error');
        onClose(); // Fecha o modal se os dados essenciais não puderem ser carregados
      } finally {
        setLoadingDependencies(false);
      }
    };
    fetchDependencies();
  }, [establishmentId, addToast, onClose]);

  const onSubmit = async (formData) => {
    // Validação extra para garantir que o slot de horário é válido.
    if (!slot?.date || !slot.time) {
      addToast("Erro: Dados de horário inválidos.", "error");
      return;
    }

    // Combina data e hora para criar um objeto Date e depois o formato ISO 8601.
    const startTime = parse(
      `${format(slot.date, 'yyyy-MM-dd')} ${slot.time}`, 
      'yyyy-MM-dd HH:mm', 
      new Date()
    );

    // --- A CORREÇÃO SUPREMA ---
    // Construção do payload sem parseInt, garantindo que os UUIDs sejam strings.
    // Apenas os campos esperados pela API são enviados.
    const payload = {
      client_id: formData.client_id,
      service_id: formData.service_id,
      notes: formData.notes,
      professional_id: professionalId,
      establishment_id: establishmentId,
      start_time: startTime.toISOString(),
      // O backend cuidará do status, end_time e duration.
    };

    try {
      await onSave(payload); // Chama a função da página pai, que tem o try/catch
    } catch (err) {
      // O erro já é exibido pelo toast na página pai.
      // O 'catch' aqui impede o modal de fechar em caso de falha.
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
        <p className={styles.modalSubtitle}>
          Para: <strong>{format(slot.date, 'dd/MM/yyyy')}</strong> às <strong>{slot.time}</strong>
        </p>
        
        {loadingDependencies ? <p>Carregando dados...</p> : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.formGroup}>
              <label htmlFor="client_id">Cliente</label>
              <select id="client_id" {...register("client_id")} className={errors.client_id ? styles.inputError : styles.formSelect}>
                <option value="">Selecione um cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
              {errors.client_id && <p className={styles.errorMessage}>{errors.client_id.message}</p>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="service_id">Serviço</label>
              <select id="service_id" {...register("service_id")} className={errors.service_id ? styles.inputError : styles.formSelect}>
                <option value="">Selecione um serviço...</option>
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
};

export default NewAppointmentModal;