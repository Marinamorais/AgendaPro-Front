// marinamorais/agendapro-front/AgendaPro-Front-e89f19b6f1c85c2718d910d6f3e87d7772852553/app/Bemvindo/[id]/components/dashboard/RecentActivity.jsx

import React from 'react';
import styles from '../../BemVindo.module.css';

const RecentActivity = ({ data }) => {
  return (
    <div className={styles.widgetCard}>
      <h4 className={styles.widgetTitle}>Atividade Recente</h4>
      <ul className={styles.activityList}>
        {data && data.length > 0 ? data.map(activity => (
          <li key={activity.id} className={styles.activityItem}>
            <div className={styles.activityIcon}>{activity.type === 'new_client' ? '👤' : '🗓️'}</div>
            <div className={styles.activityText}>
              <strong>{activity.title}</strong>
              <p>{activity.description}</p>
            </div>
            <div className={styles.activityTime}>{new Date(activity.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
          </li>
        )) : <p>Nenhuma atividade recente.</p>}
      </ul>
    </div>
  );
};

export default RecentActivity;