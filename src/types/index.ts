export type Prioridade = 'CRÍTICA' | 'ALTA' | 'MÉDIA' | 'BAIXA' | 'MÍNIMA';
export type Sistema = 'STOR' | 'AGRO';
export type Motivo = 'Bugs' | 'Regulatório' | 'Melhoria do Cliente' | 'Melhoria da Stor';
export type SituacaoSuporte = 'NOVO' | 'ABERTA' | 'CORRIGIDA' | 'FINALIZADA';
export type StatusDesenvolvimento = 'EM ANALISE' | 'EM DESENVOLVIMENTO' | 'CORRIGIDA' | 'REJEITADA' | 'FINALIZADA';

export interface SupportRequest {
  id: string; // Internal UUID
  codigo: string; // Generated registration number e.g. "1001"
  situacao: SituacaoSuporte;
  data: string; // Current date prefilled
  titulo: string;
  prioridade: Prioridade;
  sistema: Sistema;
  motivo: Motivo;
  licencaEmpresa: string;
  numeroOSDesk: string;
  solicitante: string;
  versaoTestada: string;
  versaoCliente: string;
  breveResumo: string;
  processo: string;
  observacaoComplementar: string;
  bancoDados: string;
  imagens: string;
  
  // N3/Development Fields
  numeroDesk: string;
  statusDesenvolvimento?: StatusDesenvolvimento;
  
  // Dev Conclusion Fields
  versaoCorrecao?: string;
  changeLog?: string;
  sistemaAtualizado?: boolean;
  motivoRejeicao?: string;
}
