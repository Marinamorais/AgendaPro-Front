// marinamorais/agendapro-front/AgendaPro-Front-e89f19b6f1c85c2718d910d6f3e87d7772852553/app/Bemvindo/[id]/components/dashboard/AppointmentsChart.jsx

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from '../../BemVindo.module.css';

const AppointmentsChart = ({ data }) => {
  return (
    <div className={styles.chartWrapper}>
        <h4>Agendamentos no Período</h4>
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="agendamentos" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};

export default AppointmentsChart;