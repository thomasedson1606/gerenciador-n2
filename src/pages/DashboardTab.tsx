import React, { useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import styles from './NewRequestTab.module.css';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f97316', '#ef4444'];

const DashboardTab: React.FC = () => {
  const { requests } = useAppContext();

  // Prepare data for Situation Chart
  const situationData = useMemo(() => {
    const counts = requests.reduce((acc, req) => {
      acc[req.situacao] = (acc[req.situacao] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [requests]);

  // Prepare data for System Chart
  const systemData = useMemo(() => {
    const counts = requests.reduce((acc, req) => {
      acc[req.sistema] = (acc[req.sistema] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [requests]);

  // Prepare data for Solicitante Chart
  const requesterData = useMemo(() => {
    const counts = requests.reduce((acc, req) => {
      acc[req.solicitante] = (acc[req.solicitante] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [requests]);

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <h1 className="title-1">Dashboard</h1>
        <p className="text-muted">Visão geral e métricas das solicitações.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Gráfico de Situação */}
        <div className="card">
          <h2 className="title-2" style={{marginBottom: '1rem'}}>Solicitações por Situação</h2>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={situationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {situationData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Sistema */}
        <div className="card">
          <h2 className="title-2" style={{marginBottom: '1rem'}}>Solicitações por Sistema</h2>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={systemData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" allowDecimals={false} />
                <Tooltip cursor={{fill: 'var(--bg-hover)'}} contentStyle={{backgroundColor: 'var(--bg-surface)', borderColor: 'var(--input-border)'}} />
                <Bar dataKey="value" fill="var(--primary-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Solicitante */}
        <div className="card" style={{gridColumn: 'span 2'}}>
          <h2 className="title-2" style={{marginBottom: '1rem'}}>Solicitações por Solicitante</h2>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={requesterData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" />
                <XAxis type="number" stroke="var(--text-muted)" allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" />
                <Tooltip cursor={{fill: 'var(--bg-hover)'}} contentStyle={{backgroundColor: 'var(--bg-surface)', borderColor: 'var(--input-border)'}} />
                <Bar dataKey="value" fill="#a855f7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
