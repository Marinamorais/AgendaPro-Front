import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from '../../BemVindo.module.css';

const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{`Dia: ${label}`}</p>
        <p className={styles.tooltipIntro} style={{ color: '#82ca9d' }}>{`Receita: ${formatCurrency(payload[0].value)}`}</p>
        <p className={styles.tooltipIntro} style={{ color: '#ff7373' }}>{`Perdido: ${formatCurrency(payload[1].value)}`}</p>
      </div>
    );
  }
  return null;
};

const RevenueChart = ({ data }) => {
  return (
    <div className={styles.chartWrapper}>
        <h4>Receita por Período</h4>
        <ResponsiveContainer width="100%" height={300}>
        <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barGap={6}
        >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(value) => `R$ ${value/1000}k`} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(240, 240, 240, 0.5)' }}/>
            <Legend />
            <Bar dataKey="Receita" stackId="a" fill="#82ca9d" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Perdido" stackId="a" fill="#ff7373" radius={[4, 4, 0, 0]} />
        </BarChart>
        </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;