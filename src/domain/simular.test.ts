import { describe, expect, it } from 'vitest';
import { simular } from './simular';
import type { Simulacao } from './types';

/** Valores de teste, fictícios. */
function base(): Simulacao {
  return {
    versao: 1,
    meta: 10,
    // 2026-11-09 (segunda) a 2026-12-04 (sexta) = 20 dias úteis.
    prazo: { inicio: '2026-11-09', fim: '2026-12-04', modo: 'seg-sex', folgas: 0 },
    contatosFeitos: null,
    capacidadeDiaria: null,
    etapas: [
      { id: 'ag', nome: 'Agendamento' },
      { id: 'co', nome: 'Comparecimento' },
      { id: 'ma', nome: 'Matrícula' },
    ],
    cenarios: [
      { id: 'c1', nome: 'Conservador', taxas: { ag: 0.2, co: 0.5, ma: 0.25 } },
      { id: 'c2', nome: 'Realista', taxas: { ag: 0.4, co: 0.5, ma: 0.25 } },
      { id: 'c3', nome: 'Otimista', taxas: { ag: 0.5, co: 0.8, ma: 0.5 } },
    ],
  };
}

describe('simular', () => {
  it('exemplo conferido à mão: 200 contatos em 20 dias = 10 por dia', () => {
    const r = simular(base())[1]!;
    expect(r).toMatchObject({ viavel: true, contatosTotal: 200, contatosRestantes: 200, dias: 20, contatosPorDia: 10 });
    expect(r.avisos).toEqual([]);
  });

  it('calcula os três cenários lado a lado', () => {
    // Conservador: 10/0,25=40; 40/0,5=80; 80/0,2=400. Otimista: 10/0,5=20; 20/0,8=25; 25/0,5=50.
    expect(simular(base()).map((r) => r.contatosTotal)).toEqual([400, 200, 50]);
    expect(simular(base()).map((r) => r.contatosPorDia)).toEqual([20, 10, 3]);
  });

  it('desconta contatos já feitos e folgas', () => {
    const s = base();
    s.contatosFeitos = 50;
    s.prazo.folgas = 5;
    const r = simular(s)[1]!;
    expect(r.contatosRestantes).toBe(150);
    expect(r.dias).toBe(15);
    expect(r.contatosPorDia).toBe(10);
  });

  it('dá 0 por dia quando os contatos feitos já cobrem o total', () => {
    const s = base();
    s.contatosFeitos = 250;
    const r = simular(s)[1]!;
    expect(r.contatosPorDia).toBe(0);
    expect(r.viavel).toBe(true);
    expect(r.avisos[0]?.tipo).toBe('info');
  });

  it('avisa quando passa da capacidade diária', () => {
    const s = base();
    s.capacidadeDiaria = 15;
    const [cons, real] = simular(s);
    expect(cons!.viavel).toBe(false);
    expect(cons!.avisos.some((a) => a.tipo === 'inviavel' && a.mensagem.includes('capacidade'))).toBe(true);
    expect(real!.viavel).toBe(true);
  });

  it('meta vazia deixa tudo incompleto, sem números', () => {
    const s = base();
    s.meta = null;
    const r = simular(s)[0]!;
    expect(r.viavel).toBe(false);
    expect(r.contatosTotal).toBeNull();
    expect(r.avisos).toContainEqual({ tipo: 'incompleto', mensagem: 'Falta a meta de matrículas.' });
  });

  it('meta não inteira ou zero é inviável', () => {
    for (const meta of [0, -3, 2.5]) {
      const s = base();
      s.meta = meta;
      expect(simular(s)[0]!.avisos[0]?.tipo).toBe('inviavel');
    }
  });

  it('sem prazo ainda mostra o total de contatos', () => {
    const s = base();
    s.prazo.fim = null;
    const r = simular(s)[1]!;
    expect(r.contatosTotal).toBe(200);
    expect(r.contatosPorDia).toBeNull();
    expect(r.viavel).toBe(false);
    expect(r.avisos[0]?.tipo).toBe('incompleto');
  });

  it('prazo invertido, folgas demais ou sem dias úteis é inviável', () => {
    const invertido = base();
    invertido.prazo.fim = '2026-11-01';
    expect(simular(invertido)[0]!.avisos[0]?.mensagem).toContain('antes da data de início');

    const folgas = base();
    folgas.prazo.folgas = 21;
    expect(simular(folgas)[0]!.avisos[0]?.mensagem).toContain('mais folgas');

    const fimDeSemana = base();
    fimDeSemana.prazo = { inicio: '2026-11-07', fim: '2026-11-08', modo: 'seg-sex', folgas: 0 };
    expect(simular(fimDeSemana)[0]!.avisos[0]?.mensagem).toContain('nenhum dia');
  });

  it('taxa vazia afeta só o cenário dela', () => {
    const s = base();
    s.cenarios[2]!.taxas.co = null;
    const r = simular(s);
    expect(r[1]!.viavel).toBe(true);
    expect(r[2]!.viavel).toBe(false);
    expect(r[2]!.contatosTotal).toBeNull();
  });

  it('não altera a simulação recebida', () => {
    const s = base();
    const copia = structuredClone(s);
    simular(s);
    expect(s).toEqual(copia);
  });
});
