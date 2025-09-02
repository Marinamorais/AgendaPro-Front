import React from 'react';
import styles from '../../BemVindo.module.css';

const AntiChurnModule = ({ initialData }) => {
  return (
    <div className={styles.widgetCard}>
      <h4 className={styles.widgetTitle}>Módulo Anti-Evasão</h4>
      <p className={styles.widgetSubtitle}>Clientes valiosos que não retornam há mais de 45 dias.</p>
      <div className={styles.widgetTableWrapper}>
        <table className={styles.widgetTable}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Total Gasto</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {initialData && initialData.length > 0 ? initialData.map(client => (
              <tr key={client.id}>
                <td>{client.full_name}</td>
                <td>{(client.earned_income || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
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

export default AntiChurnModule;