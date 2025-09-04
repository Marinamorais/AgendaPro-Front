// marinamorais/agendapro-front/AgendaPro-Front-e89f19b6f1c85c2718d910d6f3e87d7772852553/app/Bemvindo/[id]/components/DashboardComponent.jsx

"use client";
import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useApi } from '../hooks/useApi';
import { api } from '../../../../service/api';
import styles from '../BemVindo.module.css';

// Importando os novos componentes do dashboard
import KpiGrid from './dashboard/KpiGrid';
import RevenueChart from './dashboard/RevenueChart';
import AppointmentsChart from './dashboard/AppointmentsChart';
import ServicesAnalysis from './dashboard/ServicesAnalysis';
import ProfessionalsLeaderboard from './dashboard/ProfessionalsLeaderboard';
import ClientsAtRisk from './dashboard/ClientsAtRisk';
import RecentActivity from './dashboard/RecentActivity';

const DashboardComponent = () => {
  const params = useParams();
  const establishmentId = params.id;
  const [period, setPeriod] = useState('monthly'); // monthly, weekly, daily

  const { data: dashboardData, loading, error } = useApi(
    () => api.dashboard.getData(establishmentId, period),
    [establishmentId, period]
  );

  if (loading) {
    return <div className={styles.loadingState}>Carregando o dashboard supremo...</div>;
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
    <div className={styles.dashboardRoot}>
      <div className={styles.dashboardHeader}>
        <h3>Dashboard Analítico</h3>
        <div className={styles.periodFilter}>
          <button onClick={() => setPeriod('daily')} className={period === 'daily' ? styles.active : ''}>Diário</button>
          <button onClick={() => setPeriod('weekly')} className={period === 'weekly' ? styles.active : ''}>Semanal</button>
          <button onClick={() => setPeriod('monthly')} className={period === 'monthly' ? styles.active : ''}>Mensal</button>
        </div>
      </div>
      
      <div className={styles.dashboardGrid}>
        <div className={styles.mainMetrics}>
          <KpiGrid kpis={dashboardData?.kpis} />
        </div>

        <div className={styles.revenueChartContainer}>
          <RevenueChart data={dashboardData?.charts?.revenue} />
        </div>

        <div className={styles.secondaryMetrics}>
            <AppointmentsChart data={dashboardData?.charts?.appointments} />
        </div>
        
        <div className={styles.upcomingAppointments}>
            <ServicesAnalysis data={dashboardData?.tables?.services} />
        </div>

        <div className={styles.antiChurn}>
            <ClientsAtRisk data={dashboardData?.tables?.clientsAtRisk} />
        </div>

        <div className={styles.leaderboards}>
            <ProfessionalsLeaderboard data={dashboardData?.tables?.professionalsLeaderboard} />
        </div>

        <div className={styles.recentActivity}>
            <RecentActivity data={dashboardData?.tables?.recentActivity} />
        </div>
      </div>
    </div>
  );
};

export default DashboardComponent;