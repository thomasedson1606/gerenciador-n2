import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import type { SupportRequest, Prioridade, Sistema, Motivo } from '../types';
import { CustomSelect } from '../components/CustomSelect';
import styles from './NewRequestTab.module.css';
import { Save, X } from 'lucide-react';
import { format } from 'date-fns';

const INITIAL_FORM = {
  data: format(new Date(), 'dd/MM/yyyy'),
  situacao: 'ABERTA' as SupportRequest['situacao'],
  titulo: '',
  prioridade: 'MÉDIA' as Prioridade,
  sistema: 'STOR' as Sistema,
  motivo: 'Bugs' as Motivo,
  licencaEmpresa: '',
  numeroOSDesk: '',
  solicitante: '',
  versaoTestada: '',
  versaoCliente: '',
  breveResumo: '',
  processo: '',
  observacaoComplementar: '',
  bancoDados: '',
  imagens: '',
  numeroDesk: ''
};

const NewRequestTab: React.FC = () => {
  const { addRequest, updateRequest } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const bancoInputRef = useRef<HTMLInputElement>(null);
  const imagensInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFormData({ ...INITIAL_FORM, data: format(new Date(), 'dd/MM/yyyy') });
    setEditingId(null);
    navigate('/', { replace: true, state: {} });
  };

  useEffect(() => {
    const state = location.state as { editingRequest?: SupportRequest } | null;
    if (state?.editingRequest) {
      const req = state.editingRequest;
      setFormData({
        data: req.data,
        situacao: req.situacao,
        titulo: req.titulo,
        prioridade: req.prioridade,
        sistema: req.sistema,
        motivo: req.motivo,
        licencaEmpresa: req.licencaEmpresa,
        numeroOSDesk: req.numeroOSDesk,
        solicitante: req.solicitante,
        versaoTestada: req.versaoTestada,
        versaoCliente: req.versaoCliente,
        breveResumo: req.breveResumo,
        processo: req.processo,
        observacaoComplementar: req.observacaoComplementar,
        bancoDados: req.bancoDados,
        imagens: req.imagens,
        numeroDesk: req.numeroDesk
      });
      setEditingId(req.id);
    }
  }, [location.state]);

  useEffect(() => {
    const el = imagensInputRef.current;
    if (el) (el as HTMLInputElement & { webkitdirectory: boolean }).webkitdirectory = true;
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'data') {
      handleDateMask(e as React.ChangeEvent<HTMLInputElement>);
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateMask = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    let masked = '';
    for (let i = 0; i < val.length; i++) {
      if (i === 2 || i === 4) masked += '/';
      masked += val[i];
    }
    setFormData(prev => ({ ...prev, data: masked }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.licencaEmpresa || !formData.versaoTestada) {
      alert('Por favor preencha os campos obrigatórios (Título, Empresa, Versão)');
      return;
    }
    
    if (editingId) {
      await updateRequest(editingId, formData);
    } else {
      await addRequest(formData);
    }
    
    resetForm();
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
            <input type="text" name="data" value={formData.data} onChange={handleInputChange} className="input" />
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
            <input type="text" name="solicitante" value={formData.solicitante} onChange={handleInputChange} placeholder="Ex: Suporte" className="input" />
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
            <label>Banco de Dados (Arquivo .rar)</label>
            <div style={{ display: 'flex', gap: 4 }}>
              <input
                type="text"
                name="bancoDados"
                value={formData.bancoDados}
                onChange={handleInputChange}
                onPaste={(e) => {
                  const text = e.clipboardData.getData('text');
                  if (text) {
                    e.preventDefault();
                    setFormData(prev => ({ ...prev, bancoDados: text }));
                  }
                }}
                placeholder="Nenhum arquivo ou caminho mapeado"
                className="input"
                style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}
              />
              <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }} title="Selecionar arquivo .rar" onClick={() => bancoInputRef.current?.click()}>
                Importar .RAR
              </button>
            </div>
            <input ref={bancoInputRef} type="file" accept=".rar" style={{ display: 'none' }} onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const path = `\\\\192.168.15.101\\NasFtp\\CLIENTES\\STOR\\MAPA_LOCAL\\${file.name}`;
                setFormData(prev => ({ ...prev, bancoDados: path }));
              }
            }} />
          </div>
          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label>Imagens (Pasta)</label>
            <div style={{ display: 'flex', gap: 4 }}>
              <input
                type="text"
                name="imagens"
                value={formData.imagens}
                onChange={handleInputChange}
                onPaste={(e) => {
                  const text = e.clipboardData.getData('text');
                  if (text) {
                    e.preventDefault();
                    setFormData(prev => ({ ...prev, imagens: text }));
                  }
                }}
                placeholder="Nenhum diretório ou caminho mapeado"
                className="input"
                style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.8rem' }}
              />
              <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }} title="Selecionar pasta" onClick={() => imagensInputRef.current?.click()}>
                Selecionar Pasta
              </button>
            </div>
            <input ref={imagensInputRef} type="file" multiple style={{ display: 'none' }} onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) {
                const path = `\\\\192.168.15.101\\NasFtp\\CLIENTES\\STOR\\MAPA_LOCAL\\OS_IMAGENS_ANEXADAS\\`;
                setFormData(prev => ({ ...prev, imagens: path }));
              }
            }} />
          </div>

          <div className={styles.formActions} style={{ gridColumn: 'span 4' }}>
            <button type="submit" className="btn btn-primary">
              <Save size={18} /> {editingId ? 'Atualizar Solicitação' : 'Salvar Solicitação'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                <X size={18} /> Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRequestTab;
