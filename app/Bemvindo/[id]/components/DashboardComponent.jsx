"use client";
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useApi } from '../hooks/useApi';
import { api } from '../../../../service/api';

import KpiGrid from './dashboard/KpiGrid';
import RevenueChart from './dashboard/RevenueChart';
import UpcomingAppointments from './dashboard/UpcomingAppointments';
import styles from '../BemVindo.module.css';

const DashboardComponent = () => {
  const params = useParams();
  const establishmentId = params.id;
  const [period, setPeriod] = useState('monthly');

  // CORREÇÃO: A chamada foi atualizada para a nova estrutura modular.
  // api.getDashboardData(...) se torna api.dashboard.getData(...)
  const { data: dashboardData, loading, error } = useApi(
    () => api.dashboard.getData(establishmentId, period),
    [establishmentId, period]
  );

  if (loading) {
    return <div className={styles.loadingState}>Carregando dados do dashboard...</div>;
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <h2>Oops! Algo deu errado.</h2>
        <p>Não foi possível carregar os dados do dashboard no momento.</p>
        <p><strong>Detalhe do erro:</strong> {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardGrid}>
      <div className={styles.dashboardHeader}>
        <h1>Dashboard</h1>
        <div className={styles.periodSelector}>
          {/* Lógica para mudar o período */}
        </div>
      </div>
      
      {/* Renderiza os componentes do dashboard com os dados recebidos */}
      <KpiGrid kpis={dashboardData?.kpis} />
      <RevenueChart data={dashboardData?.charts?.revenue} />
      <UpcomingAppointments data={dashboardData?.tables?.upcomingAppointments} />
    </div>
  );
};

export default DashboardComponent;