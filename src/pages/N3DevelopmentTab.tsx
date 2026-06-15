import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { CustomSelect } from '../components/CustomSelect';
import styles from './NewRequestTab.module.css'; // Reusing some base styles
import { Save, Trash2 } from 'lucide-react';

const N3DevelopmentTab: React.FC = () => {
  const { requests, updateRequest } = useAppContext();
  
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [numeroDesk, setNumeroDesk] = useState('');

  // Filter requests that are open and don't have a dev desk number yet
  const availableRequests = requests.filter(req => req.situacao === 'ABERTA' && !req.numeroDesk);
  const n3Requests = requests.filter(req => req.numeroDesk);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId || !numeroDesk) {
      alert('Preencha os campos obrigatórios.');
      return;
    }
    
    updateRequest(selectedRequestId, { 
      numeroDesk,
      statusDesenvolvimento: 'EM ANALISE' // Default status when moving to N3
    });
    
    setSelectedRequestId('');
    setNumeroDesk('');
  };

  const handleRemoveFromN3 = (id: string) => {
    updateRequest(id, { 
      numeroDesk: undefined,
      statusDesenvolvimento: undefined 
    });
  };

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <h1 className="title-1">N3 / Desenvolvimento</h1>
        <p className="text-muted">Acompanhe as solicitações abertas para o setor de desenvolvimento.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className={styles.formGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="input-group">
            <label>Solicitação de Suporte*</label>
            <CustomSelect 
              value={selectedRequestId} 
              onChange={setSelectedRequestId} 
              options={availableRequests.map(req => ({
                value: req.id,
                label: `OS ${req.codigo} - ${req.titulo} (${req.licencaEmpresa})`
              }))}
              placeholder="Selecione uma solicitação aberta..."
            />
          </div>
          
          <div className="input-group">
            <label>Número DESK*</label>
            <input 
              type="text" 
              value={numeroDesk} 
              onChange={e => setNumeroDesk(e.target.value)} 
              className="input" 
              placeholder="Ex: DSK-5012"
              required 
            />
          </div>

          <div className={styles.formActions} style={{ gridColumn: 'span 2' }}>
            <button type="submit" className="btn btn-primary">
              <Save size={18} /> Salvar no N3
            </button>
          </div>
        </form>
      </div>

      <div className={styles.gridSection}>
        <h2 className="title-2" style={{marginTop: '2rem'}}>Solicitações em Desenvolvimento</h2>
        <div className="card" style={{ padding: 0, overflow: 'clip' }}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Cód. Suporte</th>
                  <th>Número DESK</th>
                  <th>Empresa</th>
                  <th>Título</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {n3Requests.length === 0 ? (
                  <tr><td colSpan={5} style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>Nenhuma solicitação no N3.</td></tr>
                ) : (
                  n3Requests.map(req => (
                    <tr key={req.id}>
                      <td><strong>{req.codigo}</strong></td>
                      <td><strong>{req.numeroDesk}</strong></td>
                      <td>{req.licencaEmpresa}</td>
                      <td>{req.titulo}</td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => handleRemoveFromN3(req.id)} className={`${styles.iconBtn} ${styles.danger}`} title="Remover do N3">
                            <Trash2 size={16} />
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

export default N3DevelopmentTab;
