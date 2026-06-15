import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { CustomSelect } from '../components/CustomSelect';
import styles from './NewRequestTab.module.css';

const CompletedRequestsTab: React.FC = () => {
  const { requests } = useAppContext();
  
  const [filterSituacao, setFilterSituacao] = useState<string>('TODAS');
  const [filterEmpresa, setFilterEmpresa] = useState<string>('');

  // Includes CORRIGIDA, FINALIZADA in support status
  const completedRequests = requests.filter(req => 
    req.situacao === 'CORRIGIDA' || req.situacao === 'FINALIZADA'
  );

  const filteredRequests = completedRequests.filter(req => {
    if (filterSituacao !== 'TODAS' && req.situacao !== filterSituacao) return false;
    if (filterEmpresa && !req.licencaEmpresa.toLowerCase().includes(filterEmpresa.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <h1 className="title-1">Solicitações Concluídas</h1>
        <p className="text-muted">Histórico de solicitações finalizadas e corrigidas.</p>
      </div>

      <div className="card">
        <div className={styles.formGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="input-group">
            <label>Situação</label>
            <CustomSelect
              value={filterSituacao}
              onChange={setFilterSituacao}
              options={[
                { value: '', label: 'TODAS' },
                { value: 'FINALIZADA', label: 'FINALIZADA' },
                { value: 'REJEITADA', label: 'REJEITADA' }
              ]}
            />
          </div>
          <div className="input-group">
            <label>Licença - Empresa</label>
            <input type="text" value={filterEmpresa} onChange={e => setFilterEmpresa(e.target.value)} className="input" placeholder="Buscar..." />
          </div>
        </div>
      </div>

      <div className={styles.gridSection}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Cód. Sup.</th>
                  <th>Empresa</th>
                  <th>O.S Desk</th>
                  <th>Nº DESK</th>
                  <th>Sistema</th>
                  <th>Solicitante</th>
                  <th>Status</th>
                  <th>Detalhe (Versão/Motivo)</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr><td colSpan={8} style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>Nenhum histórico encontrado.</td></tr>
                ) : (
                  filteredRequests.map(req => (
                    <tr key={req.id}>
                      <td><strong>{req.codigo}</strong></td>
                      <td>{req.licencaEmpresa}</td>
                      <td>{req.numeroOSDesk || '-'}</td>
                      <td>{req.numeroDesk || '-'}</td>
                      <td>{req.sistema}</td>
                      <td>{req.solicitante}</td>
                      <td>
                        <span className={`${styles.badge} ${styles['badge-' + req.situacao.toLowerCase()]}`}>
                          {req.situacao}
                        </span>
                      </td>
                      <td>
                        {req.statusDesenvolvimento === 'CORRIGIDA' && <span className="text-muted">Versão: {req.versaoCorrecao}</span>}
                        {req.statusDesenvolvimento === 'REJEITADA' && <span className="text-muted" style={{color: 'var(--status-critical)'}}>{req.motivoRejeicao}</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletedRequestsTab;
