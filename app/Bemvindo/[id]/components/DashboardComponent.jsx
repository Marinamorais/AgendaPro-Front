"use client";

import React from 'react';
import { motion } from 'framer-motion';
import styles from '../BemVindo.module.css';

// --- Ícones (Poderiam ser de uma biblioteca como react-icons) ---
const ChartIcon = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M12 20V10"></path><path d="M18 20V4"></path><path d="M6 20V16"></path></svg>;
const PieChartIcon = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>;
const UsersIcon = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const PackageIcon = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
const DollarSignIcon = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;

// Componente para um Card de KPI individual
const KpiCard = ({ title, value, icon, loading }) => (
    <div className={styles.kpiCard}>
        <div className={styles.kpiIcon}>{icon}</div>
        <div className={styles.kpiInfo}>
            <h2 className={styles.kpiTitle}>{title}</h2>
            {loading ? (
                <div className={styles.skeletonText} style={{ width: '80px', height: '36px' }} />
            ) : (
                <p className={styles.kpiValue}>{value}</p>
            )}
        </div>
    </div>
);

// Componente para um Placeholder de Gráfico/Tabela
const ChartPlaceholder = ({ title, icon, children }) => (
    <div className={styles.chartPlaceholder}>
        <div className={styles.placeholderHeader}>
            {icon}
            <h3>{title}</h3>
        </div>
        <div className={styles.placeholderContent}>
            {children}
        </div>
    </div>
);


const DashboardComponent = ({ data, loading }) => {
  // Dados simulados para a "Fila de Espera", como na imagem de referência
  const waitingListData = [
      { id: 1, client: 'Ana Souza', service: 'Qualquer', attempts: '0', notified: false },
      { id: 2, client: 'Bruno Lima', service: 'Qualquer', attempts: '1', notified: true },
      { id: 3, client: 'Carla M.', service: 'Teste', attempts: '0', notified: false },
  ];
  
  // Dados simulados para "Próximos Agendamentos"
  const nextAppointmentsData = [
      { id: 1, time: '09:00', client: 'Fernanda', service: 'Corte + Escova', payment: 'Pendente', status: 'Cancelado' },
      { id: 2, time: '10:30', client: 'Beatriz', service: 'Coloração', payment: 'Pago', status: 'Confirmado' },
      { id: 3, time: '12:00', client: 'Carlos', service: 'Hidratação', payment: 'Pago', status: 'Confirmado' },
  ];

  return (
    <motion.div 
        className={styles.dashboardGrid}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
    >
        {/* Seção de KPIs Principais */}
        <div className={styles.kpiGrid}>
            <KpiCard title="Clientes Ativos" value={data.clientes?.length || 0} icon={<UsersIcon />} loading={loading} />
            <KpiCard title="Profissionais" value={data.profissionais?.length || 0} icon={<UsersIcon />} loading={loading} />
            <KpiCard title="Produtos" value={data.produtos?.length || 0} icon={<PackageIcon />} loading={loading} />
            <KpiCard title="Faturamento (Mês)" value="R$ --,--" icon={<DollarSignIcon />} loading={loading} />
        </div>

        {/* Seção de Gráficos e Análises */}
        <div className={styles.analyticsGrid}>
            <ChartPlaceholder title="Receita por Semana" icon={<ChartIcon />}>
                <p>(Visualização de gráfico em breve)</p>
                <div className={styles.mockChartBars}>
                    <div style={{ height: '60%' }}></div>
                    <div style={{ height: '80%' }}></div>
                    <div style={{ height: '50%' }}></div>
                    <div style={{ height: '70%' }}></div>
                    <div style={{ height: '90%' }}></div>
                </div>
            </ChartPlaceholder>
            <ChartPlaceholder title="Cancelamentos por Motivos" icon={<PieChartIcon />}>
                <p>(Visualização de gráfico em breve)</p>
                <div className={styles.mockChartPie}></div>
            </ChartPlaceholder>
        </div>

        {/* Seção de Tabelas e Listas */}
        <div className={styles.tablesGrid}>
            <div className={styles.tableCard}>
                <h3 className={styles.tableTitle}>Fila de Espera</h3>
                <table className={styles.dashboardTable}>
                    <thead>
                        <tr><th>Cliente</th><th>Serviço</th><th>Ação</th></tr>
                    </thead>
                    <tbody>
                        {waitingListData.map(item => (
                            <tr key={item.id}>
                                <td>{item.client}</td>
                                <td>{item.service}</td>
                                <td><button className={styles.tableButton}>Notificar</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className={styles.tableCard}>
                <h3 className={styles.tableTitle}>Próximos Agendamentos (Hoje)</h3>
                <table className={styles.dashboardTable}>
                    <thead>
                        <tr><th>Hora</th><th>Cliente</th><th>Serviço</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                        {nextAppointmentsData.map(item => (
                            <tr key={item.id}>
                                <td>{item.time}</td>
                                <td>{item.client}</td>
                                <td>{item.service}</td>
                                <td><span className={`${styles.statusBadge} ${styles[item.status.toLowerCase()]}`}>{item.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </motion.div>
  );
};

export default DashboardComponent;