import React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styles from '../../BemVindo.module.css';

const UpcomingAppointments = ({ initialData }) => {
    return (
        <div className={styles.widgetCard}>
            <h4 className={styles.widgetTitle}>Próximos Agendamentos (Hoje)</h4>
            <div className={styles.widgetTableWrapper}>
                <table className={styles.widgetTable}>
                    <thead>
                        <tr>
                            <th>Hora</th>
                            <th>Cliente</th>
                            <th>Serviço</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {initialData && initialData.length > 0 ? initialData.map(app => (
                            <tr key={app.id}>
                                <td>{format(parseISO(app.start_time), 'HH:mm', { locale: ptBR })}</td>
                                <td>{app.client_name}</td>
                                <td>{app.service_name}</td>
                                <td><span className={`${styles.statusBadge} ${styles[app.status?.toLowerCase()]}`}>{app.status}</span></td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4">Nenhum agendamento para hoje.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UpcomingAppointments;