import React from 'react';
import { motion } from 'framer-motion';
import styles from '../../BemVindo.module.css';

const formatCurrency = (value) => (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const KpiCard = ({ title, value, detail, trend, delay }) => (
  <motion.div 
    className={styles.kpiCardV2}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
  >
    <span className={styles.kpiTitle}>{title}</span>
    <span className={styles.kpiValue}>{value}</span>
    <span className={styles.kpiDetail}>{detail}</span>
  </motion.div>
);

const KpiGrid = ({ kpis }) => {
  if (!kpis) return null;

  const { totalRevenue, totalAppointments, occupancy, lostRevenue, avgTicket } = kpis;

  const kpiItems = [
    { title: "Faturamento no Período", value: formatCurrency(totalRevenue), detail: `${totalAppointments} agendamentos` },
    { title: "Tempo Ocioso", value: `${100 - occupancy}%`, detail: "Meta: < 10%" },
    { title: "Receita Perdida", value: formatCurrency(lostRevenue), detail: "Cancelamentos e Faltas" },
    { title: "Ticket Médio", value: formatCurrency(avgTicket), detail: "Valor por cliente" },
  ];

  return (
    <div className={styles.kpiGridV2}>
      {kpiItems.map((item, index) => (
        <KpiCard key={item.title} {...item} delay={index} />
      ))}
    </div>
  );
};

export default KpiGrid;