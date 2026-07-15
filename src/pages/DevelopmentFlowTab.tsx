import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../store/AppContext';
import { CustomSelect } from '../components/CustomSelect';
import type { StatusDesenvolvimento } from '../types';
import styles from './NewRequestTab.module.css'; // Reusing base styles
import { Search, Check } from 'lucide-react';

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
  const [activePopupId, setActivePopupId] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

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
    const payload: Record<string, string> = { statusDesenvolvimento: newStatus };
    if (newStatus === 'CORRIGIDA') payload.situacao = 'CORRIGIDA';
    await updateRequest(id, payload);
    setActivePopupId(null);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setActivePopupId(null);
      }
    };
    if (activePopupId) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activePopupId]);

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
          <div className="card" style={{ padding: 0 }}>
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
                          <div style={{ position: 'relative' }}>
                            <span
                              className={`${styles.badge} ${statusBadgeClass(req.statusDesenvolvimento || '')}`}
                              style={{ cursor: 'pointer' }}
                              onClick={() => setActivePopupId(activePopupId === req.id ? null : req.id)}
                            >
                              {req.statusDesenvolvimento || '-'}
                            </span>
                            {activePopupId === req.id && (
                              <div
                                ref={popupRef}
                                onClick={e => e.stopPropagation()}
                                style={{
                                  position: 'absolute',
                                  top: '100%',
                                  left: 0,
                                  zIndex: 100,
                                  background: 'var(--bg-surface)',
                                  border: '1px solid var(--input-border)',
                                  borderRadius: '8px',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                                  minWidth: '200px',
                                  padding: '4px',
                                }}
                              >
                                {statusOptions.map(opt => (
                                  <button
                                    key={opt}
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(req.id, opt); }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      width: '100%',
                                      padding: '8px 12px',
                                      border: 'none',
                                      background: req.statusDesenvolvimento === opt ? 'var(--bg-hover)' : 'transparent',
                                      color: 'var(--text-main)',
                                      cursor: 'pointer',
                                      borderRadius: '6px',
                                      fontSize: '0.875rem',
                                      textAlign: 'left',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                                    onMouseLeave={e => { if (req.statusDesenvolvimento !== opt) e.currentTarget.style.background = 'transparent'; }}
                                  >
                                    <span className={`${styles.badge} ${statusBadgeClass(opt)}`}>{opt}</span>
                                    {req.statusDesenvolvimento === opt && <Check size={16} />}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
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
    </div>
  );
};

export default DevelopmentFlowTab;
