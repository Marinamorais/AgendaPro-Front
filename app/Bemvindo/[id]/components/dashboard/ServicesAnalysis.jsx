// marinamorais/agendapro-front/AgendaPro-Front-e89f19b6f1c85c2718d910d6f3e87d7772852553/app/Bemvindo/[id]/components/dashboard/ServicesAnalysis.jsx

import React from 'react';
import styles from '../../BemVindo.module.css';

const ServicesAnalysis = ({ data }) => {
  return (
    <div className={styles.widgetCard}>
      <h4 className={styles.widgetTitle}>Serviços Mais Populares</h4>
      <div className={styles.leaderboardContainer}>
        <ul className={styles.leaderboardList}>
          {data && data.length > 0 ? data.map((service, index) => (
            <li key={service.id}>
              <span className={styles.rank}>{index + 1}</span>
              <span className={styles.name}>{service.name}</span>
              <span className={styles.value}>{service.count}</span>
            </li>
          )) : <p>Sem dados de serviços.</p>}
        </ul>
      </div>
    </div>
  );
};

export default ServicesAnalysis;