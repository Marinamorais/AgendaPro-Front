// marinamorais/agendapro-front/AgendaPro-Front-e89f19b6f1c85c2718d910d6f3e87d7772852553/app/Bemvindo/[id]/components/dashboard/ClientsAtRisk.jsx

import React from 'react';
import styles from '../../BemVindo.module.css';

const ClientsAtRisk = ({ data }) => {
    return (
        <div className={styles.widgetCard}>
            <h4 className={styles.widgetTitle}>Clientes em Risco</h4>
            <p className={styles.widgetSubtitle}>Clientes valiosos que não agendam há mais de 45 dias.</p>
            <div className={styles.widgetTableWrapper}>
                <table className={styles.widgetTable}>
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Última Visita</th>
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.length > 0 ? data.map(client => (
                            <tr key={client.id}>
                                <td>{client.full_name}</td>
                                <td>{new Date(client.last_appointment).toLocaleDateString()}</td>
                                <td><button className={styles.widgetButton}>Reativar</button></td>
                            </tr>
                        )) : (
                            <tr><td colSpan="3">Nenhum cliente em risco no momento.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClientsAtRisk;