import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { CustomSelect } from '../components/CustomSelect';
import type { StatusDesenvolvimento } from '../types';
import styles from './NewRequestTab.module.css';
import { Search, Check, X } from 'lucide-react';

const statusOptions: StatusDesenvolvimento[] = [
  'EM ANALISE', 
  'EM DESENVOLVIMENTO', 
  'CORRIGIDA', 
  'REJEITADA', 
  'FINALIZADA'
];

const DevelopmentFlowTab: React.FC = () => {
  const { requests, updateRequest } = useAppContext();
  
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSistema, setFilterSistema] = useState<string>('');
  const [filterEmpresa, setFilterEmpresa] = useState<string>('');
  const [filterDesk, setFilterDesk] = useState<string>('');
  const [filterOsDesk, setFilterOsDesk] = useState<string>('');
  
  const [hasQueried, setHasQueried] = useState(false);
  const [modalData, setModalData] = useState<{ id: string; current: string } | null>(null);

  const n3Requests = requests.filter(req => req.numeroDesk);
  
  const filteredRequests = n3Requests.filter(req => {
    if (!hasQueried) return false;
    if (filterStatus && req.statusDesenvolvimento !== filterStatus) return false;
    if (filterSistema && req.sistema !== filterSistema) return false;
    if (filterEmpresa && !req.licencaEmpresa.toLowerCase().includes(filterEmpresa.toLowerCase())) return false;
    if (filterDesk && !req.numeroDesk.toLowerCase().includes(filterDesk.toLowerCase())) return false;
    if (filterOsDesk && !(req.numeroOSDesk ?? '').toLowerCase().includes(filterOsDesk.toLowerCase())) return false;
    return true;
  });

  const handleConsultar = () => {
    setHasQueried(true);
  };

  const handleStatusChange = async (id: string, newStatus: StatusDesenvolvimento) => {
    try {
      const payload: Record<string, string> = { statusDesenvolvimento: newStatus };
      if (newStatus === 'CORRIGIDA') payload.situacao = 'CORRIGIDA';
      await updateRequest(id, payload);
      setModalData(null);
    } catch (err) {
      alert('Erro ao alterar status: ' + (err instanceof Error ? err.message : 'desconhecido'));
    }
  };

  const statusBadgeClass = (status: string) => {
    const key = status.replace(/ /g, '').toLowerCase();
    return styles['badge-' + key] || '';
  };

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <h1 className="title-1">Fluxo Desenvolvimento</h1>
        <p className="text-muted">Acompanhe e altere o status das solicitações em desenvolvimento.</p>
      </div>

      <div className="card">
        <div className={styles.formGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', alignItems: 'end' }}>
          <div className="input-group">
            <label>Status Desenvolvimento</label>
            <CustomSelect
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: '', label: 'TODAS' },
                { value: 'EM ANALISE', label: 'EM ANALISE' },
                { value: 'EM DESENVOLVIMENTO', label: 'EM DESENVOLVIMENTO' },
                { value: 'CORRIGIDA', label: 'CORRIGIDA' },
                { value: 'REJEITADA', label: 'REJEITADA' },
                { value: 'FINALIZADA', label: 'FINALIZADA' }
              ]}
            />
          </div>
          <div className="input-group">
            <label>Sistema</label>
            <CustomSelect
              value={filterSistema}
              onChange={setFilterSistema}
              options={[
                { value: '', label: 'TODOS' },
                { value: 'STOR', label: 'STOR' },
                { value: 'AGRO', label: 'AGRO' }
              ]}
            />
          </div>
          <div className="input-group">
            <label>Nº Desk</label>
            <input type="text" value={filterDesk} onChange={e => setFilterDesk(e.target.value)} className="input" placeholder="Filtrar..." />
          </div>
          <div className="input-group">
            <label>Nº O.S Desk</label>
            <input type="text" value={filterOsDesk} onChange={e => setFilterOsDesk(e.target.value)} className="input" placeholder="Filtrar..." />
          </div>
          <div className="input-group">
            <label>Licença - Empresa</label>
            <input type="text" value={filterEmpresa} onChange={e => setFilterEmpresa(e.target.value)} className="input" placeholder="Buscar..." />
          </div>
          <div className="input-group">
            <button onClick={handleConsultar} className="btn btn-primary">
              <Search size={18} /> Consultar
            </button>
          </div>
        </div>
      </div>

      {hasQueried && (
        <div className={styles.gridSection}>
          <div className="card" style={{ padding: 0, overflow: 'clip' }}>
            <div className={styles.tableResponsive}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Cód. Sup.</th>
                    <th>Empresa</th>
                    <th>Nº DESK</th>
                    <th>Nº O.S Desk</th>
                    <th>Sistema</th>
                    <th>Solicitante</th>
                    <th>Status Desenvolvimento</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length === 0 ? (
                    <tr><td colSpan={7} style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>Nenhuma solicitação encontrada.</td></tr>
                  ) : (
                    filteredRequests.map(req => (
                      <tr key={req.id}>
                        <td><strong>{req.codigo}</strong></td>
                        <td>{req.licencaEmpresa}</td>
                        <td>{req.numeroDesk}</td>
                        <td>{req.numeroOSDesk || '-'}</td>
                        <td>{req.sistema}</td>
                        <td>{req.solicitante}</td>
                        <td>
                          <span
                            className={`${styles.badge} ${statusBadgeClass(req.statusDesenvolvimento || '')}`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setModalData({ id: req.id, current: req.statusDesenvolvimento || '' })}
                          >
                            {req.statusDesenvolvimento || '-'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {modalData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
          }}
          onClick={() => setModalData(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '12px',
              padding: '8px',
              minWidth: '260px',
              boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 4px 0' }}>
              <button
                onClick={() => setModalData(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>
            {statusOptions.map(opt => (
              <button
                key={opt}
                onClick={() => handleStatusChange(modalData.id, opt)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 14px',
                  border: 'none',
                  background: modalData.current === opt ? 'var(--bg-hover)' : 'transparent',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  textAlign: 'left',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={e => { if (modalData.current !== opt) e.currentTarget.style.background = 'transparent'; }}
              >
                <span className={`${styles.badge} ${statusBadgeClass(opt)}`} style={{ fontSize: '0.8rem' }}>{opt}</span>
                {modalData.current === opt && <Check size={18} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DevelopmentFlowTab;
