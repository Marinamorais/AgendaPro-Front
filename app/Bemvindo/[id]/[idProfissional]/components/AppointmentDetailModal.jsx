// app/Bemvindo/[id]/[idProfissional]/components/AppointmentDetailModal.jsx
import React from 'react';
import styles from '../Agenda.module.css';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AppointmentDetailModal = ({ appointment, onClose, onStatusChange }) => {
    // ... aqui você adicionaria a lógica para mudar o status
    
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className={styles.closeButton}>×</button>
                <h2>Detalhes do Agendamento</h2>
                <p><strong>Cliente:</strong> {appointment.client?.full_name}</p>
                <p><strong>Serviço:</strong> {appointment.service?.name}</p>
                <p><strong>Data:</strong> {format(parseISO(appointment.start_time), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                <p><strong>Status:</strong> <span className={`${styles.statusBadge} ${styles[appointment.status.toLowerCase()]}`}>{appointment.status}</span></p>
                <p><strong>Recurso:</strong> {appointment.asset?.name || "Nenhum"}</p>
                <p><strong>Preço:</strong> R$ {appointment.service?.price}</p>
                <div className={styles.modalActions}>
                    {/* Botões para mudar status iriam aqui */}
                    <button>Confirmar</button>
                    <button>Marcar como Concluído</button>
                </div>
            </div>
        </div>
    );
};

export default AppointmentDetailModal;