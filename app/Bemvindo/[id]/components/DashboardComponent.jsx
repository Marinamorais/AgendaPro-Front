"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import styles from '../BemVindo.module.css';
import useApi from '../hooks/useApi';
import { api } from '../../../../service/api';

// --- Ícones (Poderiam ser de uma biblioteca como react-icons) ---
const UsersIcon = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const PackageIcon = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
const DollarSignIcon = () => <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;

const KpiCard = ({ title, value, icon, loading, isCurrency = false }) => (
    <div className={styles.kpiCard}>
        <div className={styles.kpiIcon}>{icon}</div>
        <div className={styles.kpiInfo}>
            <h2 className={styles.kpiTitle}>{title}</h2>
            {loading ? (
                <div className={styles.skeletonText} style={{ width: '80px', height: '36px' }} />
            ) : (
                <p className={styles.kpiValue}>
                    {isCurrency ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : value}
                </p>
            )}
        </div>
    </div>
);

const DashboardComponent = ({ establishmentId }) => {
    // Hook para buscar as métricas principais do dashboard
    const { data: metrics, loading: metricsLoading } = useApi(
        () => api.getDashboardMetrics(establishmentId),
        [establishmentId]
    );

    // Hook para buscar os próximos agendamentos (a partir de hoje)
    const { data: appointments, loading: appointmentsLoading } = useApi(() => {
        const today = new Date().toISOString().split('T')[0];
        return api.getAppointments({ establishment_id: establishmentId, startDate: today });
    }, [establishmentId]);

    return (
        <motion.div 
            className={styles.dashboardGrid}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Seção de KPIs Principais com dados reais */}
            <div className={styles.kpiGrid}>
                <KpiCard title="Clientes Ativos" value={metrics?.totalClients ?? 0} icon={<UsersIcon />} loading={metricsLoading} />
                <KpiCard title="Profissionais" value={metrics?.totalProfessionals ?? 0} icon={<UsersIcon />} loading={metricsLoading} />
                <KpiCard title="Produtos" value={metrics?.totalProducts ?? 0} icon={<PackageIcon />} loading={metricsLoading} />
                <KpiCard title="Faturamento Total" value={metrics?.totalRevenue ?? 0} icon={<DollarSignIcon />} loading={metricsLoading} isCurrency={true} />
            </div>

            {/* Seção de Tabelas e Listas com dados reais */}
            <div className={styles.tablesGrid}>
                <div className={styles.tableCard}>
                    <h3 className={styles.tableTitle}>Últimos Clientes Cadastrados</h3>
                    {metricsLoading ? <p>Carregando...</p> : (
                        <table className={styles.dashboardTable}>
                            <thead>
                                <tr><th>Nome</th><th>Email</th></tr>
                            </thead>
                            <tbody>
                                {metrics?.recentClients?.map(client => (
                                    <tr key={client.id}>
                                        <td>{client.full_name}</td>
                                        <td>{client.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className={styles.tableCard}>
                    <h3 className={styles.tableTitle}>Próximos Agendamentos</h3>
                    {appointmentsLoading ? <p>Carregando...</p> : (
                        <table className={styles.dashboardTable}>
                            <thead>
                                <tr><th>Data/Hora</th><th>Cliente</th><th>Serviço</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {appointments?.sort((a, b) => new Date(a.start_time) - new Date(b.start_time)).slice(0, 5).map(app => (
                                    <tr key={app.id}>
                                        <td>{format(parseISO(app.start_time), "dd/MM 'às' HH:mm", { locale: ptBR })}</td>
                                        <td>{app.client_name}</td>
                                        <td>{app.service_name}</td>
                                        <td><span className={`${styles.statusBadge} ${styles[app.status?.toLowerCase()]}`}>{app.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default DashboardComponent;