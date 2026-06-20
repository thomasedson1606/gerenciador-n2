import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';
import type { SupportRequest, Prioridade, Sistema, Motivo } from '../types';
import { CustomSelect } from '../components/CustomSelect';
import styles from './NewRequestTab.module.css';
import { Save, X } from 'lucide-react';
import { format } from 'date-fns';

const INITIAL_FORM = {
  data: format(new Date(), 'dd/MM/yyyy'),
  situacao: 'NOVO' as SupportRequest['situacao'],
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
  subpasta: '',
  nomeArquivo: '',
  subpastaImagens: '',
  numeroDesk: ''
};

const NewRequestTab: React.FC = () => {
  const { addRequest, updateRequest } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const resetForm = () => {
    setFormData({ ...INITIAL_FORM, data: format(new Date(), 'dd/MM/yyyy') });
    setEditingId(null);
    navigate('/', { replace: true, state: {} });
  };

  useEffect(() => {
    const state = location.state as { editingRequest?: SupportRequest } | null;
    if (state?.editingRequest) {
      const req = state.editingRequest;
      // Try to extract subpasta and nomeArquivo from existing bancoDados
      let subpasta = '';
      let nomeArquivo = '';
      let subpastaImagens = '';
      if (req.bancoDados) {
        const parts = req.bancoDados.split('\\');
        if (parts.length >= 2) {
          nomeArquivo = parts[parts.length - 1];
          subpasta = parts[parts.length - 2];
        }
      }
      if (req.imagens) {
        const parts = req.imagens.split('\\');
        if (parts.length >= 2) subpastaImagens = parts[parts.length - 2];
      }
      setFormData({ ...INITIAL_FORM,
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
        subpasta,
        nomeArquivo,
        subpastaImagens,
        numeroDesk: req.numeroDesk
      });
      setEditingId(req.id);
    }
  }, [location.state]);

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
    
    const prefix = `\\\\192.168.15.101\\NasFtp\\CLIENTES\\STOR\\`;
    const bancoDados = formData.subpasta || formData.nomeArquivo
      ? `${prefix}${formData.licencaEmpresa}\\${formData.subpasta}\\${formData.nomeArquivo}`
      : formData.bancoDados;
    const imagens = formData.subpastaImagens
      ? `${prefix}${formData.licencaEmpresa}\\${formData.subpastaImagens}\\`
      : formData.imagens;

    const dataToSave = {
      data: formData.data,
      situacao: formData.situacao,
      titulo: formData.titulo,
      prioridade: formData.prioridade,
      sistema: formData.sistema,
      motivo: formData.motivo,
      licencaEmpresa: formData.licencaEmpresa,
      numeroOSDesk: formData.numeroOSDesk,
      solicitante: formData.solicitante,
      versaoTestada: formData.versaoTestada,
      versaoCliente: formData.versaoCliente,
      breveResumo: formData.breveResumo,
      processo: formData.processo,
      observacaoComplementar: formData.observacaoComplementar,
      bancoDados,
      imagens,
      numeroDesk: formData.numeroDesk,
    };

    if (editingId) {
      await updateRequest(editingId, dataToSave);
    } else {
      await addRequest(dataToSave);
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
                { value: 'NOVO', label: 'NOVO' },
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
          <div className="input-group" style={{ gridColumn: 'span 1' }}>
            <label>Subpasta (Ex: "OS 12160 - Erro ISW")</label>
            <input type="text" name="subpasta" value={formData.subpasta} onChange={handleInputChange} className="input" placeholder="Nome da subpasta..." />
          </div>
          <div className="input-group" style={{ gridColumn: 'span 1' }}>
            <label>Nome do Arquivo .rar</label>
            <input type="text" name="nomeArquivo" value={formData.nomeArquivo} onChange={handleInputChange} className="input" placeholder="Ex: BKP 17062026 2022.rar" />
          </div>
          <div className="input-group" style={{ gridColumn: 'span 1' }}>
            <label>Subpasta Imagens</label>
            <input type="text" name="subpastaImagens" value={formData.subpastaImagens} onChange={handleInputChange} className="input" placeholder="Ex: OS 12160 - Erro ISW" />
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
