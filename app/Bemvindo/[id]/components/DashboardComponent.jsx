"use client";

/**
 * @module components/DashboardComponent
 * @description Componente principal que renderiza a visão geral do negócio,
 * orquestrando a exibição de KPIs, gráficos e tabelas de dados.
 */

// Importações de dependências do React e Framer Motion para animações.
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Importação de estilos CSS Module para escopo local.
import styles from '../BemVindo.module.css';

// Importações de Hooks e Serviços.
// CORREÇÃO: Importamos `useApi` com chaves {} porque agora é uma exportação nomeada.
import { useApi } from '../hooks/useApi'; 
import { api } from '../../../../service/api';


// Importação de subcomponentes do Dashboard para modularização e clareza.
// Cada componente é especializado em exibir uma parte específica do dashboard.
import KpiGrid from './dashboard/KpiGrid';
import RevenueChart from './dashboard/RevenueChart';
import CancellationChart from './dashboard/CancellationChart';
import UpcomingAppointments from './dashboard/UpcomingAppointments';
import AntiChurnModule from './dashboard/AntiChurnModule';
import PerformanceLeaderboard from './dashboard/PerformanceLeaderboard';

/**
 * Componente de estado de carregamento.
 * Exibido enquanto os dados do dashboard estão sendo buscados da API.
 * Melhora a experiência do usuário (UX) ao fornecer feedback visual.
 * @returns {JSX.Element}
 */
const LoadingState = () => (
  <div className={styles.loadingState}>
    <div className={styles.spinner}></div>
    <p>Carregando o universo do seu negócio...</p>
    <p>Estamos compilando insights e métricas para você.</p>
  </div>
);

/**
 * Componente de estado de erro.
 * Exibido se a chamada à API falhar, informando o usuário sobre o problema.
 * @param {{ error: string }} props - As propriedades do componente.
 * @returns {JSX.Element}
 */
const ErrorState = ({ error }) => (
  <div className={styles.errorState}>
    <h3>Oops! Algo deu errado.</h3>
    <p>Não foi possível carregar os dados do dashboard no momento.</p>
    <p className={styles.errorMessageDetail}>Detalhe do erro: {error}</p>
    <button onClick={() => window.location.reload()} className={styles.primaryButton}>Tentar Novamente</button>
  </div>
);

/**
 * Componente principal da página de Dashboard.
 * @param {{ establishmentId: string }} props - ID do estabelecimento para buscar os dados.
 * @returns {JSX.Element}
 */
const DashboardComponent = ({ establishmentId }) => {
  // Estado para controlar o período de tempo selecionado (diário, semanal, mensal).
  const [period, setPeriod] = useState('monthly');

  // Utiliza o hook customizado `useApi` para buscar os dados do dashboard.
  // A lógica de loading, data e error é abstraída pelo hook.
  // A chamada da API é re-executada automaticamente se `establishmentId` ou `period` mudarem.
  const { data: dashboardData, loading, error } = useApi(
    () => api.getDashboardData(establishmentId, period),
    [establishmentId, period]
  );

  // Renderização condicional baseada no estado da chamada da API.
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  // Renderização principal quando os dados foram carregados com sucesso.
  return (
    <div className={styles.dashboardRoot}>
      {/* Cabeçalho com título e filtro de período */}
      <div className={styles.dashboardHeader}>
        <h3>Visão Geral</h3>
        <div className={styles.periodFilter}>
          <button onClick={() => setPeriod('daily')} className={period === 'daily' ? styles.active : ''}>Hoje</button>
          <button onClick={() => setPeriod('weekly')} className={period === 'weekly' ? styles.active : ''}>7 dias</button>
          <button onClick={() => setPeriod('monthly')} className={period === 'monthly' ? styles.active : ''}>Mês Atual</button>
        </div>
      </div>

      {/* Animação na troca de período para uma transição suave. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={period} // A chave `key` informa ao Framer Motion que o componente mudou.
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Garante que `dashboardData` não é nulo antes de tentar renderizar os subcomponentes. */}
          {dashboardData && (
            // Grid layout para organizar os componentes do dashboard.
            <div className={styles.dashboardGrid}>
              
              {/* Seção de métricas principais (KPIs) */}
              <div className={styles.mainMetrics}>
                <KpiGrid kpis={dashboardData.kpis} />
              </div>

              {/* Seção do gráfico de receita */}
              <div className={styles.revenueChartContainer}>
                <RevenueChart data={dashboardData.charts.revenue} />
              </div>

              {/* Seção do gráfico de cancelamentos */}
              <div className={styles.secondaryMetrics}>
                <CancellationChart data={dashboardData.charts.cancellations} />
              </div>

              {/* Tabela de próximos agendamentos */}
              <div className={styles.upcomingAppointments}>
                <UpcomingAppointments initialData={dashboardData.tables.upcomingAppointments} establishmentId={establishmentId} />
              </div>

              {/* Módulo de Anti-Churn (clientes em risco) */}
              <div className={styles.antiChurn}>
                <AntiChurnModule initialData={dashboardData.tables.antiChurn} establishmentId={establishmentId} />
              </div>

              {/* Leaderboards de performance */}
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
// FIM DO ARQUIVO