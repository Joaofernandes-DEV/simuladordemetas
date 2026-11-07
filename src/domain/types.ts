/** Etapa do funil depois do contato (ex.: agendamento, comparecimento, matrícula). A última é a meta. */
export interface Etapa {
  id: string;
  nome: string;
}

/** Taxa de conversão da etapa anterior para esta, de 0 a 1. `null` = não preenchida. */
export type Taxas = Record<string, number | null>;

export interface Cenario {
  id: string;
  nome: string;
  taxas: Taxas;
}

export type ModoContagem = 'seg-sex' | 'seg-sab' | 'corridos';

export interface Prazo {
  /** Datas no formato AAAA-MM-DD, ambas incluídas. */
  inicio: string | null;
  fim: string | null;
  modo: ModoContagem;
  /** Folgas e feriados dentro do período, digitados pelo usuário. */
  folgas: number;
}

export interface Simulacao {
  versao: 1;
  meta: number | null;
  prazo: Prazo;
  contatosFeitos: number | null;
  capacidadeDiaria: number | null;
  etapas: Etapa[];
  cenarios: Cenario[];
}

export type TipoAviso = 'incompleto' | 'inviavel' | 'info';

export interface Aviso {
  tipo: TipoAviso;
  mensagem: string;
}

export interface QuantidadeEtapa {
  etapaId: string;
  nome: string;
  necessario: number;
}

export interface ResultadoCenario {
  cenarioId: string;
  nome: string;
  /** `true` quando todos os números puderam ser calculados e nada é inviável. */
  viavel: boolean;
  avisos: Aviso[];
  /** Quantidade necessária em cada etapa, na ordem do funil (a última é a meta). */
  etapas: QuantidadeEtapa[] | null;
  contatosTotal: number | null;
  contatosRestantes: number | null;
  dias: number | null;
  contatosPorDia: number | null;
}
