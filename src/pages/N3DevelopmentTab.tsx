import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import { CustomSelect } from '../components/CustomSelect';
import styles from './NewRequestTab.module.css'; // Reusing some base styles
import { Save, Trash2 } from 'lucide-react';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../firebase/config';

const N3DevelopmentTab: React.FC = () => {
  const { requests, updateRequest } = useAppContext();
  
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [numeroDesk, setNumeroDesk] = useState('');
  const [filtroOsDesk, setFiltroOsDesk] = useState('');
  const [filtroDesk, setFiltroDesk] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState('');
  const [filtroTitulo, setFiltroTitulo] = useState('');

  // Requests without N3 link yet
  const availableRequests = requests.filter(req => req.situacao === 'NOVO' && !req.numeroDesk);
  const n3Requests = requests.filter(req => req.numeroDesk);

  const filteredN3 = n3Requests.filter(req => {
    if (filtroOsDesk && !(req.numeroOSDesk ?? '').toLowerCase().includes(filtroOsDesk.toLowerCase())) return false;
    if (filtroDesk && !req.numeroDesk.toLowerCase().includes(filtroDesk.toLowerCase())) return false;
    if (filtroEmpresa && !req.licencaEmpresa.toLowerCase().includes(filtroEmpresa.toLowerCase())) return false;
    if (filtroTitulo && !req.titulo.toLowerCase().includes(filtroTitulo.toLowerCase())) return false;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestId || !numeroDesk) {
      alert('Preencha os campos obrigatórios.');
      return;
    }
    
    await updateRequest(selectedRequestId, { 
      numeroDesk,
      situacao: 'ABERTA',
      statusDesenvolvimento: 'EM ANALISE'
    });
    
    setSelectedRequestId('');
    setNumeroDesk('');
  };

  const handleRemoveFromN3 = async (id: string) => {
    await updateDoc(doc(db, 'requests', id), {
      numeroDesk: deleteField(),
      statusDesenvolvimento: deleteField(),
      situacao: 'NOVO'
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
        
        {/* Filters */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className={styles.formGrid} style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="input-group">
              <label>Nº O.S Desk</label>
              <input type="text" value={filtroOsDesk} onChange={e => setFiltroOsDesk(e.target.value)} className="input" placeholder="Filtrar..." />
            </div>
            <div className="input-group">
              <label>Nº Desk</label>
              <input type="text" value={filtroDesk} onChange={e => setFiltroDesk(e.target.value)} className="input" placeholder="Filtrar..." />
            </div>
            <div className="input-group">
              <label>Empresa</label>
              <input type="text" value={filtroEmpresa} onChange={e => setFiltroEmpresa(e.target.value)} className="input" placeholder="Filtrar..." />
            </div>
            <div className="input-group">
              <label>Título</label>
              <input type="text" value={filtroTitulo} onChange={e => setFiltroTitulo(e.target.value)} className="input" placeholder="Filtrar..." />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'clip' }}>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Cód. Suporte</th>
                  <th>Nº O.S Desk</th>
                  <th>Número DESK</th>
                  <th>Empresa</th>
                  <th>Título</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredN3.length === 0 ? (
                  <tr><td colSpan={6} style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>Nenhuma solicitação no N3.</td></tr>
                ) : (
                  filteredN3.map(req => (
                    <tr key={req.id}>
                      <td><strong>{req.codigo}</strong></td>
                      <td>{req.numeroOSDesk || '-'}</td>
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
