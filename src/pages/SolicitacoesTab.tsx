import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import type { SupportRequest } from '../types';
import { CustomSelect } from '../components/CustomSelect';
import styles from './NewRequestTab.module.css';
import { Download, Edit2, Trash2 } from 'lucide-react';

const handleExportTXT = (req: SupportRequest) => {
  const content = `Título: ${req.titulo}
Prioridade: ${req.prioridade}
Sistema: ${req.sistema}
Motivo: ${req.motivo}

_____________________________________________________________________


Cliente: ${req.licencaEmpresa}
Versão Cliente: ${req.versaoCliente}
Versão Testada: ${req.versaoTestada}

${req.breveResumo}

Processo:
${req.processo}

Observação Complementar: ${req.observacaoComplementar}

Banco de dados
${req.bancoDados}

Imagens
${req.imagens}`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `OS_${req.codigo}_${req.licencaEmpresa}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
};

const SolicitacoesTab: React.FC = () => {
  const { requests, deleteRequest } = useAppContext();
  const navigate = useNavigate();

  const [filterDataInicio, setFilterDataInicio] = useState('');
  const [filterDataFim, setFilterDataFim] = useState('');
  const [filterSituacao, setFilterSituacao] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');
  const [filterSistema, setFilterSistema] = useState('');
  const [filterOSDesk, setFilterOSDesk] = useState('');

  const filteredRequests = requests.filter(req => {
    if (filterDataInicio && req.data < filterDataInicio) return false;
    if (filterDataFim && req.data > filterDataFim) return false;
    if (filterSituacao && req.situacao !== filterSituacao) return false;
    if (filterEmpresa && !req.licencaEmpresa.toLowerCase().includes(filterEmpresa.toLowerCase())) return false;
    if (filterSistema && req.sistema !== filterSistema) return false;
    if (filterOSDesk && !req.numeroOSDesk.toLowerCase().includes(filterOSDesk.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <h1 className="title-1">Solicitações</h1>
        <p className="text-muted">Consulte e gerencie todas as solicitações cadastradas.</p>
      </div>

      <div className="card">
        <div className={styles.formGrid} style={{ gridTemplateColumns: 'repeat(6, 1fr)', alignItems: 'end' }}>
          <div className="input-group">
            <label>Data Início</label>
            <input type="text" value={filterDataInicio} onChange={e => setFilterDataInicio(e.target.value)} className="input" placeholder="dd/MM/yyyy" />
          </div>
          <div className="input-group">
            <label>Data Fim</label>
            <input type="text" value={filterDataFim} onChange={e => setFilterDataFim(e.target.value)} className="input" placeholder="dd/MM/yyyy" />
          </div>
          <div className="input-group">
            <label>Situação</label>
            <CustomSelect
              value={filterSituacao}
              onChange={setFilterSituacao}
              options={[
                { value: '', label: 'TODAS' },
                { value: 'NOVO', label: 'NOVO' },
                { value: 'ABERTA', label: 'ABERTA' },
                { value: 'CORRIGIDA', label: 'CORRIGIDA' },
                { value: 'FINALIZADA', label: 'FINALIZADA' }
              ]}
            />
          </div>
          <div className="input-group">
            <label>Empresa</label>
            <input type="text" value={filterEmpresa} onChange={e => setFilterEmpresa(e.target.value)} className="input" placeholder="Buscar..." />
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
            <label>O.S Desk</label>
            <input type="text" value={filterOSDesk} onChange={e => setFilterOSDesk(e.target.value)} className="input" placeholder="Número" />
          </div>
        </div>
      </div>

      <div className={styles.gridSection}>
        <div className="card" style={{ padding: 0, overflow: 'clip' }}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Cód.</th>
                  <th>Data</th>
                  <th>Situação</th>
                  <th>Título</th>
                  <th>Empresa</th>
                  <th>Sistema</th>
                  <th>O.S Desk</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr><td colSpan={8} style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>Nenhum registro encontrado.</td></tr>
                ) : (
                  filteredRequests.map(req => (
                    <tr key={req.id}>
                      <td><strong>{req.codigo}</strong></td>
                      <td>{req.data}</td>
                      <td>
                        <span className={`${styles.badge} ${styles['badge-' + req.situacao.toLowerCase()]}`}>
                          {req.situacao}
                        </span>
                      </td>
                      <td>{req.titulo}</td>
                      <td>{req.licencaEmpresa}</td>
                      <td>{req.sistema}</td>
                      <td>{req.numeroOSDesk || '-'}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate('/', { state: { editingRequest: req } })}
                            className={styles.iconBtn}
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={async () => { await deleteRequest(req.id); }}
                            className={`${styles.iconBtn} ${styles.danger}`}
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button
                            onClick={() => handleExportTXT(req)}
                            className={styles.iconBtn}
                            title="Exportar TXT"
                          >
                            <Download size={16} />
                          </button>
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
    </div>
  );
};

export default SolicitacoesTab;
