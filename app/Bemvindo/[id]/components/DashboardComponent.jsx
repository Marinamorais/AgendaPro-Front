"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../BemVindo.module.css';
import useApi from '../hooks/useApi';
import { api } from '../../../../service/api';

// Importa os novos componentes modulares do dashboard
import KpiGrid from './dashboard/KpiGrid';
import RevenueChart from './dashboard/RevenueChart';
import CancellationChart from './dashboard/CancellationChart';
import UpcomingAppointments from './dashboard/UpcomingAppointments';
import AntiChurnModule from './dashboard/AntiChurnModule';
import PerformanceLeaderboard from './dashboard/PerformanceLeaderboard';

const DashboardComponent = ({ establishmentId }) => {
  const [period, setPeriod] = useState('monthly'); // 'daily', 'weekly', 'monthly'

  const { data: dashboardData, loading, error } = useApi(
    () => api.getDashboardData(establishmentId, period),
    [establishmentId, period]
  );

  if (loading) {
    return <div className={styles.loadingState}>Carregando o universo do seu negócio...</div>;
  }

  if (error) {
    return <div className={styles.errorState}>Oops! Não foi possível carregar os dados do dashboard. Tente novamente. ({error})</div>;
  }

  return (
    <div className={styles.dashboardRoot}>
      <div className={styles.dashboardHeader}>
        <h3>Visão Geral</h3>
        <div className={styles.periodFilter}>
          <button onClick={() => setPeriod('daily')} className={period === 'daily' ? styles.active : ''}>Hoje</button>
          <button onClick={() => setPeriod('weekly')} className={period === 'weekly' ? styles.active : ''}>7 dias</button>
          <button onClick={() => setPeriod('monthly')} className={period === 'monthly' ? styles.active : ''}>Mês Atual</button>
        </div>
      </div>

      <AnimatePresence>
        <motion.div
          key={period}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {dashboardData && (
            <div className={styles.dashboardGrid}>
              <div className={styles.mainMetrics}>
                <KpiGrid kpis={dashboardData.kpis} />
              </div>
              <div className={styles.revenueChartContainer}>
                <RevenueChart data={dashboardData.charts.revenue} />
              </div>
              <div className={styles.secondaryMetrics}>
                <CancellationChart data={dashboardData.charts.cancellations} />
              </div>
              <div className={styles.upcomingAppointments}>
                <UpcomingAppointments initialData={dashboardData.tables.upcomingAppointments} establishmentId={establishmentId} />
              </div>
              <div className={styles.antiChurn}>
                <AntiChurnModule initialData={dashboardData.tables.antiChurn} establishmentId={establishmentId} />
              </div>
              <div className={styles.leaderboards}>
                 <PerformanceLeaderboard 
                    professionals={dashboardData.tables.topProfessionals}
                    services={dashboardData.tables.topServices}
                 />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DashboardComponent;