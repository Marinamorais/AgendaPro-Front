"use client";
import React from 'react';
import styles from '../BemVindo.module.css';

// Componente para a visualização do Dashboard.
// Reutiliza os cards de KPI e adiciona placeholders para futuros gráficos.
const DashboardComponent = ({ data, loading }) => {
  return (
    <div className={styles.dashboardContent}>
        <div className={styles.kpiGrid}>
            <div className={styles.kpiCard}><h2>Clientes Ativos</h2><p>{loading ? '...' : data.clientes.length}</p></div>
            <div className={styles.kpiCard}><h2>Profissionais</h2><p>{loading ? '...' : data.profissionais.length}</p></div>
            <div className={styles.kpiCard}><h2>Produtos</h2><p>{loading ? '...' : data.produtos.length}</p></div>
            <div className={styles.kpiCard}><h2>Faturamento (Mês)</h2><p>R$ --,--</p><span>(Em breve)</span></div>
        </div>
        <div className={styles.dashboardPlaceholder}>
            <div className={styles.chartPlaceholder}>
                <h3>Receita por Semana</h3>
                <p>(Gráfico em breve)</p>
            </div>
            <div className={styles.chartPlaceholder}>
                <h3>Cancelamentos por Motivo</h3>
                <p>(Gráfico em breve)</p>
            </div>
            <div className={styles.tablePlaceholder}>
                <h3>Próximos Agendamentos</h3>
                <p>(Tabela em breve)</p>
            </div>
        </div>
    </div>
  );
};

export default DashboardComponent;