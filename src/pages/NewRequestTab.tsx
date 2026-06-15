import React, { useState } from 'react';
import { useAppContext } from '../store/AppContext';
import type { SupportRequest, Prioridade, Sistema, Motivo } from '../types';
import { CustomSelect } from '../components/CustomSelect';
import styles from './NewRequestTab.module.css';
import { Save, Download, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const NewRequestTab: React.FC = () => {
  const { requests, addRequest, deleteRequest } = useAppContext();
  
  // Local state for the form
  const [formData, setFormData] = useState({
    situacao: 'ABERTA' as SupportRequest['situacao'],
    titulo: '',
    prioridade: 'MÉDIA' as Prioridade,
    sistema: 'STOR' as Sistema,
    motivo: 'Bugs' as Motivo,
    licencaEmpresa: '',
    numeroOSDesk: '',
    solicitante: 'SUPORTE',
    versaoTestada: '',
    versaoCliente: '',
    breveResumo: '',
    processo: '',
    observacaoComplementar: '',
    bancoDados: '',
    imagens: '',
    numeroDesk: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVersionMask = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    let masked = '';
    for (let i = 0; i < val.length; i++) {
      if (i > 0 && i % 2 === 0) masked += '.';
      masked += val[i];
    }
    setFormData(prev => ({ ...prev, [e.target.name]: masked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.licencaEmpresa || !formData.versaoTestada) {
      alert('Por favor preencha os campos obrigatórios (Título, Empresa, Versão)');
      return;
    }
    
    addRequest({
      ...formData,
      data: format(new Date(), 'dd/MM/yyyy')
    });
    
    // Reset partially (keeping some defaults)
    setFormData({
      ...formData,
      titulo: '',
      licencaEmpresa: '',
      numeroOSDesk: '',
      breveResumo: '',
      processo: '',
      observacaoComplementar: '',
      bancoDados: '',
      imagens: ''
    });
  };

  const handleExportTXT = (req: SupportRequest) => {
    const content = `Título: ${req.titulo}
Prioridade: ${req.prioridade}
Sistema: ${req.sistema}
Motivo: ${req.motivo}

_____________________________________________________________________


Cliente: ${req.licencaEmpresa}
Versão Cliente: ${req.versaoCliente}
Versão Testasda: ${req.versaoTestada}

${req.breveResumo}
Motivo: ${req.motivo}

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

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <h1 className="title-1">Nova Solicitação de Suporte</h1>
        <p className="text-muted">Crie e gerencie chamados de suporte N2.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          {/* Row 1 */}
          <div className="input-group">
            <label>Situação</label>
            <CustomSelect
              value={formData.situacao}
              onChange={(val) => setFormData({...formData, situacao: val as SupportRequest['situacao']})}
              options={[
                { value: 'ABERTA', label: 'ABERTA' },
                { value: 'CORRIGIDA', label: 'CORRIGIDA' },
                { value: 'FINALIZADA', label: 'FINALIZADA' }
              ]}
            />
          </div>
          <div className="input-group">
            <label>Data</label>
            <input type="text" value={format(new Date(), 'dd/MM/yyyy')} disabled className="input" />
          </div>
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label>Título*</label>
            <input type="text" name="titulo" value={formData.titulo} onChange={handleInputChange} className="input" required />
          </div>

          {/* Row 2 */}
          <div className="input-group">
            <label>Prioridade</label>
            <CustomSelect
              value={formData.prioridade}
              onChange={(val) => setFormData({...formData, prioridade: val as Prioridade})}
              options={[
                { value: 'CRÍTICA', label: 'CRÍTICA' },
                { value: 'ALTA', label: 'ALTA' },
                { value: 'MÉDIA', label: 'MÉDIA' },
                { value: 'BAIXA', label: 'BAIXA' },
                { value: 'MÍNIMA', label: 'MÍNIMA' }
              ]}
            />
          </div>
          <div className="input-group">
            <label>Sistema</label>
            <CustomSelect
              value={formData.sistema}
              onChange={(val) => setFormData({...formData, sistema: val as Sistema})}
              options={[
                { value: 'STOR', label: 'STOR' },
                { value: 'AGRO', label: 'AGRO' }
              ]}
            />
          </div>
          <div className="input-group">
            <label>Motivo</label>
            <CustomSelect
              value={formData.motivo}
              onChange={(val) => setFormData({...formData, motivo: val as Motivo})}
              options={[
                { value: 'Bugs', label: 'Bugs' },
                { value: 'Regulatório', label: 'Regulatório' },
                { value: 'Melhoria do Cliente', label: 'Melhoria do Cliente' },
                { value: 'Melhoria da Stor', label: 'Melhoria da Stor' }
              ]}
            />
          </div>
          <div className="input-group">
            <label>Licença - Empresa*</label>
            <input type="text" name="licencaEmpresa" value={formData.licencaEmpresa} onChange={handleInputChange} placeholder="Ex: 1967 - AVANT TECNOLOGIA" className="input" required />
          </div>

          {/* Row 3 */}
          <div className="input-group">
            <label>Número da O.S Desk</label>
            <input type="text" name="numeroOSDesk" value={formData.numeroOSDesk} onChange={handleInputChange} className="input" />
          </div>
          <div className="input-group">
            <label>Solicitante</label>
            <input type="text" name="solicitante" value={formData.solicitante} onChange={handleInputChange} className="input" />
          </div>
          <div className="input-group">
            <label>Versão Testada*</label>
            <input type="text" name="versaoTestada" value={formData.versaoTestada} onChange={handleVersionMask} placeholder="Ex: 04.09.05.05" className="input" required />
          </div>
          <div className="input-group">
            <label>Versão Cliente</label>
            <input type="text" name="versaoCliente" value={formData.versaoCliente} onChange={handleVersionMask} placeholder="Ex: 04.11.00.00" className="input" />
          </div>

          {/* Row 4: Full width */}
          <div className="input-group" style={{ gridColumn: 'span 4' }}>
            <label>Breve Resumo</label>
            <input type="text" name="breveResumo" value={formData.breveResumo} onChange={handleInputChange} className="input" />
          </div>
          
          <div className="input-group" style={{ gridColumn: 'span 4' }}>
            <label>Processo</label>
            <textarea name="processo" value={formData.processo} onChange={handleInputChange} className="textarea" rows={4}></textarea>
          </div>
          
          <div className="input-group" style={{ gridColumn: 'span 4' }}>
            <label>Observação Complementar</label>
            <textarea name="observacaoComplementar" value={formData.observacaoComplementar} onChange={handleInputChange} className="textarea" rows={2}></textarea>
          </div>

          {/* Paths */}
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label>Banco de Dados (Caminho da Pasta)</label>
            <input type="text" name="bancoDados" value={formData.bancoDados} onChange={handleInputChange} placeholder="\\192.168.15.101\NasFtp\..." className="input" />
          </div>
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label>Imagens (Caminho da Pasta)</label>
            <input type="text" name="imagens" value={formData.imagens} onChange={handleInputChange} placeholder="\\192.168.15.101\NasFtp\..." className="input" />
          </div>

          <div className={styles.formActions} style={{ gridColumn: 'span 4' }}>
            <button type="submit" className="btn btn-primary">
              <Save size={18} /> Salvar Solicitação
            </button>
          </div>
        </form>
      </div>

      <div className={styles.gridSection}>
        <h2 className="title-2" style={{marginTop: '2rem'}}>Lançamentos</h2>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr><td colSpan={7} style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>Nenhum registro encontrado.</td></tr>
                ) : (
                  requests.map(req => (
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
                      <td>
                        <div className="flex gap-2">
                          <button className={styles.iconBtn} title="Editar (Em breve)">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => deleteRequest(req.id)} className={`${styles.iconBtn} ${styles.danger}`} title="Excluir">
                            <Trash2 size={16} />
                          </button>
                          <button onClick={() => handleExportTXT(req)} className={styles.iconBtn} title="Exportar TXT">
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

export default NewRequestTab;
