import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import styles from './NewRequestTab.module.css';
import type { SupportRequest } from '../types';
import { CustomSelect } from '../components/CustomSelect';
import { Save } from 'lucide-react';

const DevelopmentConclusionTab: React.FC = () => {
  const { requests, updateRequest } = useAppContext();
  
  const [filterStatus, setFilterStatus] = useState<string>('TODAS');
  const [filterEmpresa, setFilterEmpresa] = useState<string>('');

  // Local state to manage form fields for specific requests being edited
  const [editForms, setEditForms] = useState<Record<string, {
    versaoCorrecao?: string;
    changeLog?: string;
    sistemaAtualizado?: string; // "SIM" | "NÃO"
    motivoRejeicao?: string;
  }>>({});

  const handleEditChange = (id: string, field: string, value: string) => {
    setEditForms(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value
      }
    }));
  };

  const handleVersionMask = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    let masked = '';
    for (let i = 0; i < val.length; i++) {
      if (i > 0 && i % 2 === 0) masked += '.';
      masked += val[i];
    }
    handleEditChange(id, 'versaoCorrecao', masked);
  };

  const handleSaveConclusao = (req: SupportRequest) => {
    const form = editForms[req.id];
    if (!form) return;

    if (req.statusDesenvolvimento === 'CORRIGIDA') {
      const isUpdated = form.sistemaAtualizado === 'SIM';
      
      updateRequest(req.id, {
        versaoCorrecao: form.versaoCorrecao,
        changeLog: form.changeLog,
        sistemaAtualizado: isUpdated,
        situacao: isUpdated ? 'FINALIZADA' : req.situacao,
        statusDesenvolvimento: 'CORRIGIDA'
      });
      alert('Conclusão salva com sucesso!');
    } else if (req.statusDesenvolvimento === 'REJEITADA') {
      updateRequest(req.id, {
        motivoRejeicao: form.motivoRejeicao,
        situacao: 'FINALIZADA',
        statusDesenvolvimento: 'REJEITADA'
      });
      alert('Rejeição salva com sucesso!');
    }
  };

  // Filter requests that reached conclusion phase
  const conclusionRequests = requests.filter(req => 
    req.numeroDesk && (req.statusDesenvolvimento === 'CORRIGIDA' || req.statusDesenvolvimento === 'REJEITADA')
  );

  const filteredRequests = conclusionRequests.filter(req => {
    if (filterStatus !== 'TODAS' && req.statusDesenvolvimento !== filterStatus) return false;
    if (filterEmpresa && !req.licencaEmpresa.toLowerCase().includes(filterEmpresa.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <h1 className="title-1">Conclusão DESENVOLVIMENTO</h1>
        <p className="text-muted">Finalize solicitações corrigidas ou rejeitadas pelo desenvolvimento.</p>
      </div>

      <div className="card">
        <div className={styles.formGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="input-group">
            <label>Status</label>
            <CustomSelect
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: '', label: 'TODOS' },
                { value: 'CORRIGIDA', label: 'CORRIGIDA' },
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
        {filteredRequests.length === 0 ? (
          <div className="card text-center" style={{ padding: '3rem', color: 'var(--text-muted)' }}>
            Nenhuma solicitação aguardando conclusão com os filtros atuais.
          </div>
        ) : (
          <div className="flex-col gap-4">
            {filteredRequests.map(req => {
              const isCorrigida = req.statusDesenvolvimento === 'CORRIGIDA';
              const isRejeitada = req.statusDesenvolvimento === 'REJEITADA';
              const form = editForms[req.id] || {};

              return (
                <div key={req.id} className="card">
                  <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--input-border)', paddingBottom: '1rem' }}>
                    <div className="flex gap-4 items-center">
                      <span className="title-2" style={{margin: 0}}>OS {req.codigo}</span>
                      <span className={`${styles.badge} ${styles['badge-' + req.statusDesenvolvimento?.toLowerCase().replace(' ', '')]}`}>
                        {req.statusDesenvolvimento}
                      </span>
                    </div>
                    <div className="text-muted" style={{fontSize: '0.875rem'}}>
                      <strong>DESK:</strong> {req.numeroDesk} &nbsp;|&nbsp; 
                      <strong>Empresa:</strong> {req.licencaEmpresa} &nbsp;|&nbsp; 
                      <strong>Sistema:</strong> {req.sistema}
                    </div>
                  </div>
                  
                  <div className={styles.formGrid}>
                    {isCorrigida && (
                      <>
                        <div className="input-group">
                          <label>Versão de Correção*</label>
                          <input 
                            type="text" 
                            className="input"
                            value={form.versaoCorrecao ?? req.versaoCorrecao ?? ''} 
                            onChange={(e) => handleVersionMask(e, req.id)}
                            placeholder="Ex: 04.12.00.00"
                          />
                        </div>
                        <div className="input-group">
                          <label>Sistema Atualizado?*</label>
                          <CustomSelect
                            value={form.sistemaAtualizado ?? (req.sistemaAtualizado ? 'SIM' : 'NAO')}
                            onChange={(val) => handleEditChange(req.id, 'sistemaAtualizado', val)}
                            options={[
                              { value: '', label: 'Selecione...' },
                              { value: 'SIM', label: 'SIM' },
                              { value: 'NAO', label: 'NÃO' }
                            ]}
                          />
                        </div>
                        <div className="input-group" style={{ gridColumn: 'span 4' }}>
                          <label>Change Log*</label>
                          <textarea 
                            className="textarea" 
                            rows={3}
                            value={form.changeLog ?? req.changeLog ?? ''}
                            onChange={(e) => handleEditChange(req.id, 'changeLog', e.target.value)}
                          />
                        </div>
                      </>
                    )}

                    {isRejeitada && (
                      <div className="input-group" style={{ gridColumn: 'span 4' }}>
                        <label>Motivo da Rejeição*</label>
                        <textarea 
                          className="textarea" 
                          rows={3}
                          value={form.motivoRejeicao ?? req.motivoRejeicao ?? ''}
                          onChange={(e) => handleEditChange(req.id, 'motivoRejeicao', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end" style={{ marginTop: '1rem' }}>
                    <button onClick={() => handleSaveConclusao(req)} className="btn btn-primary">
                      <Save size={18} /> Salvar e Finalizar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DevelopmentConclusionTab;
