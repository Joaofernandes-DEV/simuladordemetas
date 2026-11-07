import { describe, expect, it } from 'vitest';
import { adicionarEtapa, definirTaxa, removerEtapa, renomearEtapa } from './editar';
import { simulacaoExemplo } from './exemplo';
import { simular } from './simular';

const agora = new Date(2026, 10, 9); // 09/11/2026, segunda

describe('edição da simulação', () => {
  it('adiciona etapa antes da meta, com taxa vazia em todos os cenários', () => {
    const s = adicionarEtapa(simulacaoExemplo(agora), 'visita', 'Visita');
    expect(s.etapas.map((e) => e.id)).toEqual(['agendamento', 'comparecimento', 'visita', 'matricula']);
    expect(s.cenarios.every((c) => c.taxas.visita === null)).toBe(true);
    // Sem a taxa nova, cada cenário fica incompleto e pede a taxa pelo nome.
    expect(simular(s)[0]!.avisos).toContainEqual({ tipo: 'incompleto', mensagem: 'Falta a taxa da etapa "Visita".' });
  });

  it('remove etapa e a taxa dela, mas nunca a última que sobrou', () => {
    let s = removerEtapa(simulacaoExemplo(agora), 'comparecimento');
    expect(s.etapas.map((e) => e.id)).toEqual(['agendamento', 'matricula']);
    expect('comparecimento' in s.cenarios[0]!.taxas).toBe(false);
    s = removerEtapa(removerEtapa(s, 'agendamento'), 'matricula');
    expect(s.etapas).toHaveLength(1);
  });

  it('renomeia etapa e define taxa de um cenário só', () => {
    let s = renomearEtapa(simulacaoExemplo(agora), 'agendamento', 'Agenda');
    s = definirTaxa(s, 'otimista', 'agendamento', 0.55);
    expect(s.etapas[0]!.nome).toBe('Agenda');
    expect(s.cenarios[2]!.taxas.agendamento).toBe(0.55);
    expect(s.cenarios[1]!.taxas.agendamento).toBe(0.4);
  });

  it('não altera a simulação recebida', () => {
    const s = simulacaoExemplo(agora);
    const copia = structuredClone(s);
    adicionarEtapa(s, 'x');
    removerEtapa(s, 'agendamento');
    renomearEtapa(s, 'agendamento', 'y');
    definirTaxa(s, 'realista', 'agendamento', 0.9);
    expect(s).toEqual(copia);
  });
});

describe('exemplo fictício', () => {
  it('realista é o exemplo à mão; prazo final começa vazio', () => {
    const s = simulacaoExemplo(agora);
    expect(s.prazo).toEqual({ inicio: '2026-11-09', fim: null, modo: 'seg-sex', folgas: 0 });
    const r = simular(s);
    // Conservador: 10÷0,2=50; 50÷0,4=125; 125÷0,3=416,7→417. Otimista: 10÷0,3=33,3→34; 34÷0,6=56,7→57; 57÷0,5=114.
    expect(r.map((x) => x.contatosTotal)).toEqual([417, 200, 114]);
    expect(r.every((x) => x.contatosPorDia === null)).toBe(true);
  });
});
