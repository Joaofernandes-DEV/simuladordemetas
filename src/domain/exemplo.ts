import { hojeISO } from './prazo';
import type { Etapa, Simulacao } from './types';

/**
 * VALORES FICTÍCIOS. Servem só para a tela não começar vazia; não são números reais
 * de nenhuma empresa nem referências de mercado. O realista é o exemplo conferido à mão.
 * O prazo final fica vazio de propósito: quem usa escolhe a data.
 */
export function simulacaoExemplo(agora: Date = new Date()): Simulacao {
  const etapas: Etapa[] = [
    { id: 'agendamento', nome: 'Agendamento' },
    { id: 'comparecimento', nome: 'Comparecimento' },
    { id: 'matricula', nome: 'Matrícula' },
  ];
  return {
    versao: 1,
    meta: 10,
    prazo: { inicio: hojeISO(agora), fim: null, modo: 'seg-sex', folgas: 0 },
    contatosFeitos: null,
    capacidadeDiaria: null,
    etapas,
    cenarios: [
      { id: 'conservador', nome: 'Conservador', taxas: { agendamento: 0.3, comparecimento: 0.4, matricula: 0.2 } },
      { id: 'realista', nome: 'Realista', taxas: { agendamento: 0.4, comparecimento: 0.5, matricula: 0.25 } },
      { id: 'otimista', nome: 'Otimista', taxas: { agendamento: 0.5, comparecimento: 0.6, matricula: 0.3 } },
    ],
  };
}

let seq = 0;
/** Id curto e único na sessão, para etapas novas. */
export function novoId(): string {
  seq += 1;
  return `etapa-${Date.now().toString(36)}-${seq}`;
}
