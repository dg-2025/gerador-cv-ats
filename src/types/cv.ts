export interface DadosPessoais {
  nome: string;
  email: string;
  telefone: string;
  linkedin?: string;
  portfolio?: string;
}

export interface Experiencia {
  empresa: string;
  periodo: string;
  cargo: string;
  bullets: string[];
}

export interface Projeto {
  nome: string;
  tech: string;
  descricao: string;
}

export interface CurriculoData {
  tituloVaga: string;
  dadosPessoais: DadosPessoais;
  resumo: string;
  experiencias: Experiencia[];
  projetos?: Projeto[];
  formacao: string[];
  certificacoes?: string[];
  habilidades: string;
  idiomas?: string;
}