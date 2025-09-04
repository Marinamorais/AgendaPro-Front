// marinamorais/agendapro-front/AgendaPro-Front-e89f19b6f1c85c2718d910d6f3e87d7772852553/app/Bemvindo/[id]/components/dashboard/ProfessionalsLeaderboard.jsx

import React from 'react';
import styles from '../../BemVindo.module.css';

const ProfessionalsLeaderboard = ({ data }) => {
  return (
    <div className={styles.widgetCard}>
      <h4 className={styles.widgetTitle}>Ranking de Profissionais</h4>
      <div className={styles.leaderboardContainer}>
        <ul className={styles.leaderboardList}>
          {data && data.length > 0 ? data.map((prof, index) => (
            <li key={prof.id}>
              <span className={styles.rank}>{index + 1}</span>
              <span className={styles.name}>{prof.full_name}</span>
              <span className={styles.value}>{(prof.total_revenue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </li>
          )) : <p>Sem dados de performance.</p>}
        </ul>
      </div>
    </div>
  );
};

export default ProfessionalsLeaderboard;