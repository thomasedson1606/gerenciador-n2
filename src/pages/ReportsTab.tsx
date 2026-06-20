import React, { useState, useRef } from 'react';
import { useAppContext } from '../store/AppContext';
import { CustomSelect } from '../components/CustomSelect';
import styles from './NewRequestTab.module.css';
import { Search, FileText, Download, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

const ReportsTab: React.FC = () => {
  const { requests } = useAppContext();
  
  const [filterSistema, setFilterSistema] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterVersao, setFilterVersao] = useState<string>('');
  const [filterAtualizado, setFilterAtualizado] = useState<string>('');
  const [hasQueried, setHasQueried] = useState(false);
  
  const tableRef = useRef<HTMLTableElement>(null);

  const filteredRequests = requests.filter(req => {
    if (!hasQueried) return false;
    if (filterSistema && req.sistema !== filterSistema) return false;
    if (filterStatus && req.statusDesenvolvimento !== filterStatus && req.situacao !== filterStatus) return false;
    if (filterVersao && req.versaoCorrecao !== filterVersao) return false;
    if (filterAtualizado === 'SIM' && !req.sistemaAtualizado) return false;
    if (filterAtualizado === 'NAO' && req.sistemaAtualizado) return false;
    return true;
  });

  const handleConsultar = () => {
    setHasQueried(true);
  };

  const captureTable = async () => {
    if (!tableRef.current) return null;
    return html2canvas(tableRef.current, {
      backgroundColor: '#ffffff',
      scale: 2,
      onclone: (doc) => {
        const table = doc.querySelector('table');
        if (!table) return;
        table.style.color = '#000000';
        table.style.backgroundColor = '#ffffff';
        table.querySelectorAll('th, td').forEach(cell => {
          (cell as HTMLElement).style.color = '#000000';
          (cell as HTMLElement).style.backgroundColor = '#ffffff';
          (cell as HTMLElement).style.borderBottom = '1px solid #cccccc';
        });
        table.querySelectorAll('th').forEach(th => {
          (th as HTMLElement).style.color = '#000000';
          (th as HTMLElement).style.fontWeight = '600';
        });
      }
    });
  };

  const handleExportPDF = async () => {
    const canvas = await captureTable();
    if (!canvas) return;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 5;

    const pxPerMm = canvas.width / pdfWidth;
    const totalPages = Math.ceil(canvas.height / (pxPerMm * (pageHeight - margin * 2)));

    for (let i = 0; i < totalPages; i++) {
      if (i > 0) pdf.addPage();

      const yStartPx = i * pxPerMm * (pageHeight - margin * 2);
      const sliceHeightPx = Math.min(pxPerMm * (pageHeight - margin * 2), canvas.height - yStartPx);

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = sliceHeightPx;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) ctx.drawImage(canvas, 0, yStartPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

      const sliceData = tempCanvas.toDataURL('image/png');
      const sliceHeightMm = sliceHeightPx / pxPerMm;
      pdf.addImage(sliceData, 'PNG', 0, margin, pdfWidth, sliceHeightMm);
    }

    pdf.save('relatorio-n2.pdf');
  };

  const handleExportImage = async () => {
    const canvas = await captureTable();
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'relatorio-n2.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleExportExcel = (type: 'xlsx' | 'xls' | 'csv') => {
    const ws = XLSX.utils.json_to_sheet(filteredRequests.map(req => ({
      'Licença - Empresa': req.licencaEmpresa,
      'Solicitante': req.solicitante,
      'Sistema': req.sistema,
      'Número DESK': req.numeroDesk || '-',
      'Número da O.S Desk': req.numeroOSDesk || '-',
      'Versão de Correção': req.versaoCorrecao || '-',
      'Atualizado': req.sistemaAtualizado ? 'SIM' : 'NÃO'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
    XLSX.writeFile(wb, `relatorio-n2.${type}`);
  };

  return (
    <div className="animate-fade-in">
      <div className={styles.header}>
        <h1 className="title-1">Relatórios</h1>
        <p className="text-muted">Extraia dados analíticos e exporte em múltiplos formatos.</p>
      </div>

      <div className="card">
        <div className={styles.formGrid} style={{ gridTemplateColumns: 'repeat(5, 1fr)', alignItems: 'end' }}>
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
            <label>Status</label>
            <CustomSelect
              value={filterStatus}
              onChange={setFilterStatus}
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
            <label>Versão Corrigida</label>
            <input type="text" value={filterVersao} onChange={e => setFilterVersao(e.target.value)} className="input" placeholder="Ex: 04.12.00.00" />
          </div>
          <div className="input-group">
            <label>Atualizado</label>
            <CustomSelect
              value={filterAtualizado}
              onChange={setFilterAtualizado}
              options={[
                { value: '', label: 'TODOS' },
                { value: 'SIM', label: 'SIM' },
                { value: 'NAO', label: 'NÃO' }
              ]}
            />
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
          <div className="flex justify-between items-center" style={{marginBottom: '1rem'}}>
            <h2 className="title-2" style={{margin: 0}}>Resultados</h2>
            <div className="flex gap-2">
              <button onClick={handleExportPDF} className="btn btn-secondary"><FileText size={16}/> PDF</button>
              <button onClick={() => handleExportExcel('xlsx')} className="btn btn-secondary"><FileSpreadsheet size={16}/> XLSX</button>
              <button onClick={() => handleExportExcel('xls')} className="btn btn-secondary"><FileSpreadsheet size={16}/> XLS</button>
              <button onClick={() => handleExportExcel('csv')} className="btn btn-secondary"><Download size={16}/> CSV</button>
              <button onClick={handleExportImage} className="btn btn-secondary"><ImageIcon size={16}/> IMAGEM</button>
            </div>
          </div>
          
          <div className="card" style={{ padding: 0, overflow: 'clip' }}>
            <div className={styles.tableResponsive}>
              <table className={styles.table} ref={tableRef}>
                <thead>
                  <tr>
                    <th>Licença - Empresa</th>
                    <th>Solicitante (Suporte)</th>
                    <th>Sistema</th>
                    <th>Número DESK</th>
                    <th>O.S Desk</th>
                    <th>Versão de Correção</th>
                    <th>Atualizado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length === 0 ? (
                    <tr><td colSpan={7} style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>Nenhum dado encontrado para os filtros selecionados.</td></tr>
                  ) : (
                    filteredRequests.map(req => (
                      <tr key={req.id}>
                        <td>{req.licencaEmpresa}</td>
                        <td>{req.solicitante}</td>
                        <td>{req.sistema}</td>
                        <td>{req.numeroDesk || '-'}</td>
                        <td>{req.numeroOSDesk || '-'}</td>
                        <td>{req.versaoCorrecao || '-'}</td>
                        <td>{req.sistemaAtualizado ? 'SIM' : 'NÃO'}</td>
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

export default ReportsTab;
