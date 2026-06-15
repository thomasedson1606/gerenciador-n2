import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { CustomSelect } from '../components/CustomSelect';
import type { StatusDesenvolvimento } from '../types';
import styles from './NewRequestTab.module.css'; // Reusing base styles
import { Search } from 'lucide-react';

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
  
  const [hasQueried, setHasQueried] = useState(false);

  const n3Requests = requests.filter(req => req.numeroDesk);
  
  const filteredRequests = n3Requests.filter(req => {
    if (!hasQueried) return false;
    if (filterStatus && req.statusDesenvolvimento !== filterStatus) return false;
    if (filterSistema && req.sistema !== filterSistema) return false;
    if (filterEmpresa && !req.licencaEmpresa.toLowerCase().includes(filterEmpresa.toLowerCase())) return false;
    return true;
  });

  const handleConsultar = () => {
    setHasQueried(true);
  };

  const handleStatusChange = (id: string, newStatus: StatusDesenvolvimento) => {
    updateRequest(id, { statusDesenvolvimento: newStatus });
  };

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <h1 className="title-1">Fluxo Desenvolvimento</h1>
        <p className="text-muted">Acompanhe e altere o status das solicitações em desenvolvimento.</p>
      </div>

      <div className="card">
        <div className={styles.formGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', alignItems: 'end' }}>
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
                    <th>Sistema</th>
                    <th>Solicitante</th>
                    <th>Status Desenvolvimento</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length === 0 ? (
                    <tr><td colSpan={6} style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>Nenhuma solicitação encontrada.</td></tr>
                  ) : (
                    filteredRequests.map(req => (
                      <tr key={req.id}>
                        <td><strong>{req.codigo}</strong></td>
                        <td>{req.licencaEmpresa}</td>
                        <td>{req.numeroDesk}</td>
                        <td>{req.sistema}</td>
                        <td>{req.solicitante}</td>
                        <td>
                          <CustomSelect
                            value={req.statusDesenvolvimento || ''}
                            onChange={(val) => handleStatusChange(req.id, val as StatusDesenvolvimento)}
                            options={statusOptions.map(opt => ({ value: opt, label: opt }))}
                          />
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
