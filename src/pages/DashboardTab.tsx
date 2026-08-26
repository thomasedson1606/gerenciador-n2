import React, { useMemo } from 'react';
import { useAppContext } from '../store/AppContext';
import styles from './NewRequestTab.module.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { LayoutDashboard, AlertTriangle, CheckCircle2, Clock, CircleDot, Flame } from 'lucide-react';

const COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f97316', '#ef4444', '#06b6d4', '#eab308', '#ec4899'];
const PRIORITY_COLORS: Record<string, string> = {
  'CRÍTICA': '#ef4444',
  'ALTA': '#f97316',
  'MÉDIA': '#eab308',
  'BAIXA': '#3b82f6',
  'MÍNIMA': '#6b7280'
};

const kpiCardStyle = (borderColor: string): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '1.25rem 1.5rem',
  borderLeft: `4px solid ${borderColor}`,
});

const kpiNumberStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: 700,
  lineHeight: 1,
  color: 'var(--text-main)',
};

const kpiLabelStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--text-muted)',
  marginTop: '0.25rem',
};

const chartTooltipStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--input-border)',
  borderRadius: '8px',
  fontSize: '0.8125rem',
};

const DashboardTab: React.FC = () => {
  const { requests } = useAppContext();

  const kpis = useMemo(() => {
    const total = requests.length;
    const novas = requests.filter(r => r.situacao === 'NOVO').length;
    const abertas = requests.filter(r => r.situacao === 'ABERTA').length;
    const emDev = requests.filter(r => r.statusDesenvolvimento === 'EM DESENVOLVIMENTO' || r.statusDesenvolvimento === 'EM ANALISE').length;
    const corrigidas = requests.filter(r => r.situacao === 'CORRIGIDA').length;
    const finalizadas = requests.filter(r => r.situacao === 'FINALIZADA').length;
    const rejeitadas = requests.filter(r => r.statusDesenvolvimento === 'REJEITADA').length;
    const criticas = requests.filter(r => r.prioridade === 'CRÍTICA').length;
    const atualizadas = requests.filter(r => r.sistemaAtualizado === true).length;
    const taxaFinalizacao = total > 0 ? ((finalizadas / total) * 100).toFixed(1) : '0';
    return { total, novas, abertas, emDev, corrigidas, finalizadas, rejeitadas, criticas, atualizadas, taxaFinalizacao };
  }, [requests]);

  const situationData = useMemo(() => {
    const counts = requests.reduce((acc, req) => {
      acc[req.situacao] = (acc[req.situacao] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [requests]);

  const priorityData = useMemo(() => {
    const counts = requests.reduce((acc, req) => {
      acc[req.prioridade] = (acc[req.prioridade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [requests]);

  const motivoData = useMemo(() => {
    const counts = requests.reduce((acc, req) => {
      acc[req.motivo] = (acc[req.motivo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [requests]);

  const systemData = useMemo(() => {
    const counts = requests.reduce((acc, req) => {
      acc[req.sistema] = (acc[req.sistema] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [requests]);

  const devStatusData = useMemo(() => {
    const counts = requests.reduce((acc, req) => {
      const status = req.statusDesenvolvimento || 'SEM STATUS';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [requests]);

  const monthlyData = useMemo(() => {
    const counts: Record<string, { total: number; finalizadas: number }> = {};
    requests.forEach(req => {
      if (req.data) {
        const parts = req.data.split('/');
        if (parts.length === 3) {
          const key = `${parts[1]}/${parts[2]}`;
          if (!counts[key]) counts[key] = { total: 0, finalizadas: 0 };
          counts[key].total += 1;
          if (req.situacao === 'FINALIZADA' || req.situacao === 'CORRIGIDA') {
            counts[key].finalizadas += 1;
          }
        }
      }
    });
    return Object.keys(counts)
      .sort((a, b) => {
        const [mA, yA] = a.split('/');
        const [mB, yB] = b.split('/');
        return (yA + mA).localeCompare(yB + mB);
      })
      .map(key => ({
        name: key,
        Total: counts[key].total,
        Concluídas: counts[key].finalizadas
      }));
  }, [requests]);

  const empresaData = useMemo(() => {
    const counts = requests.reduce((acc, req) => {
      const emp = req.licencaEmpresa || 'N/I';
      acc[emp] = (acc[emp] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [requests]);

  const requesterData = useMemo(() => {
    const counts = requests.reduce((acc, req) => {
      acc[req.solicitante] = (acc[req.solicitante] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [requests]);

  const rejectionData = useMemo(() => {
    const rejected = requests.filter(r => r.statusDesenvolvimento === 'REJEITADA');
    if (rejected.length === 0) return [];
    const counts = rejected.reduce((acc, req) => {
      const motivo = req.motivoRejeicao || 'Não informado';
      acc[motivo] = (acc[motivo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name: name.length > 30 ? name.slice(0, 30) + '...' : name, value }));
  }, [requests]);

  const priorityBarData = useMemo(() => {
    const order = ['CRÍTICA', 'ALTA', 'MÉDIA', 'BAIXA', 'MÍNIMA'];
    return order
      .filter(p => priorityData.some(d => d.name === p))
      .map(p => {
        const found = priorityData.find(d => d.name === p);
        return { name: p, value: found?.value || 0 };
      });
  }, [priorityData]);

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <h1 className="title-1"><LayoutDashboard size={24} /> Dashboard</h1>
        <p className="text-muted">Visão geral completa e métricas gerenciais das solicitações.</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={kpiCardStyle('#3b82f6')}>
          <CircleDot size={32} color="#3b82f6" />
          <div>
            <div style={kpiNumberStyle}>{kpis.total}</div>
            <div style={kpiLabelStyle}>Total Solicitações</div>
          </div>
        </div>
        <div className="card" style={kpiCardStyle('#f97316')}>
          <Clock size={32} color="#f97316" />
          <div>
            <div style={kpiNumberStyle}>{kpis.abertas + kpis.novas}</div>
            <div style={kpiLabelStyle}>Abertas / Novas</div>
          </div>
        </div>
        <div className="card" style={kpiCardStyle('#a855f7')}>
          <AlertTriangle size={32} color="#a855f7" />
          <div>
            <div style={kpiNumberStyle}>{kpis.emDev}</div>
            <div style={kpiLabelStyle}>Em Desenvolvimento</div>
          </div>
        </div>
        <div className="card" style={kpiCardStyle('#22c55e')}>
          <CheckCircle2 size={32} color="#22c55e" />
          <div>
            <div style={kpiNumberStyle}>{kpis.finalizadas}</div>
            <div style={kpiLabelStyle}>Finalizadas</div>
          </div>
        </div>
        <div className="card" style={kpiCardStyle('#ef4444')}>
          <Flame size={32} color="#ef4444" />
          <div>
            <div style={kpiNumberStyle}>{kpis.criticas}</div>
            <div style={kpiLabelStyle}>Prioridade Crítica</div>
          </div>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>{kpis.taxaFinalizacao}%</div>
          <div style={kpiLabelStyle}>Taxa de Finalização</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>{kpis.corrigidas}</div>
          <div style={kpiLabelStyle}>Corrigidas (Aguardando)</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>{kpis.rejeitadas}</div>
          <div style={kpiLabelStyle}>Rejeitadas</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#06b6d4' }}>{kpis.atualizadas}</div>
          <div style={kpiLabelStyle}>Sistemas Atualizados</div>
        </div>
      </div>

      {/* Charts Row 1: Situação + Prioridade */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <h2 className="title-2" style={{ marginBottom: '1rem' }}>Solicitações por Situação</h2>
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
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="title-2" style={{ marginBottom: '1rem' }}>Solicitações por Prioridade</h2>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={priorityBarData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" allowDecimals={false} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'var(--bg-hover)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {priorityBarData.map((entry) => (
                    <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Motivos + Status Desenvolvimento */}
      <div className="grid grid-cols-2 gap-4" style={{ marginTop: '1rem' }}>
        <div className="card">
          <h2 className="title-2" style={{ marginBottom: '1rem' }}>Solicitações por Motivo</h2>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={motivoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {motivoData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="title-2" style={{ marginBottom: '1rem' }}>Status do Desenvolvimento</h2>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={devStatusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" allowDecimals={false} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'var(--bg-hover)' }} />
                <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 3: Sistema + Tendência Mensal */}
      <div className="grid grid-cols-2 gap-4" style={{ marginTop: '1rem' }}>
        <div className="card">
          <h2 className="title-2" style={{ marginBottom: '1rem' }}>Solicitações por Sistema</h2>
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={systemData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" allowDecimals={false} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'var(--bg-hover)' }} />
                <Bar dataKey="value" fill="var(--primary-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="title-2" style={{ marginBottom: '1rem' }}>Tendência Mensal</h2>
          <div style={{ height: 300, width: '100%' }}>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer>
                <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'var(--bg-hover)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Concluídas" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                Sem dados de período disponíveis.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 4: Top Empresas + Top Solicitantes */}
      <div className="grid grid-cols-2 gap-4" style={{ marginTop: '1rem' }}>
        <div className="card">
          <h2 className="title-2" style={{ marginBottom: '1rem' }}>Top 10 Empresas</h2>
          <div style={{ height: 350, width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={empresaData} layout="vertical" margin={{ top: 10, right: 30, left: 120, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" />
                <XAxis type="number" stroke="var(--text-muted)" allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" width={110} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'var(--bg-hover)' }} />
                <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="title-2" style={{ marginBottom: '1rem' }}>Top 10 Solicitantes</h2>
          <div style={{ height: 350, width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={requesterData} layout="vertical" margin={{ top: 10, right: 30, left: 120, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" />
                <XAxis type="number" stroke="var(--text-muted)" allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="var(--text-muted)" width={110} tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'var(--bg-hover)' }} />
                <Bar dataKey="value" fill="#a855f7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Rejection Reasons (conditional) */}
      {rejectionData.length > 0 && (
        <div className="grid gap-4" style={{ marginTop: '1rem' }}>
          <div className="card">
            <h2 className="title-2" style={{ marginBottom: '1rem' }}>Motivos de Rejeição</h2>
            <div style={{ height: 250, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={rejectionData} layout="vertical" margin={{ top: 10, right: 30, left: 200, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--input-border)" />
                  <XAxis type="number" stroke="var(--text-muted)" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" stroke="var(--text-muted)" width={190} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'var(--bg-hover)' }} />
                  <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardTab;
