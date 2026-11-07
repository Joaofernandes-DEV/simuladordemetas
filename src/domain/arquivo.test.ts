import { describe, expect, it } from 'vitest';
import { deCSV, deJSON, lerArquivo, lerLinhasCSV, nomeArquivo, normalizarData, paraCSV, paraJSON } from './arquivo';
import { adicionarEtapa, renomearEtapa } from './editar';
import { simulacaoExemplo } from './exemplo';
import type { Simulacao } from './types';

/** Valores de teste, fictícios. */
function exemplo(): Simulacao {
  const s = simulacaoExemplo(new Date(2026, 10, 9));
  s.prazo.fim = '2026-12-04';
  s.prazo.folgas = 2;
  s.contatosFeitos = 15;
  s.cenarios[1]!.taxas.agendamento = 0.125;
  return s;
}

/** CSV não guarda ids de etapa: compara só o que a pessoa vê. */
function semIds(s: Simulacao) {
  return {
    ...s,
    etapas: s.etapas.map((e) => e.nome),
    cenarios: s.cenarios.map((c) => ({ nome: c.nome, taxas: s.etapas.map((e) => c.taxas[e.id]) })),
  };
}

function ok(r: ReturnType<typeof deJSON>): Simulacao {
  if (!r.ok) throw new Error(r.erro);
  return r.simulacao;
}

describe('JSON', () => {
  it('ida e volta devolve a mesma simulação', () => {
    const s = exemplo();
    expect(ok(deJSON(paraJSON(s)))).toEqual(s);
  });

  it('marca o arquivo como fictício', () => {
    expect(JSON.parse(paraJSON(exemplo())).aviso).toBe('Dados fictícios, ajuste para a sua realidade.');
  });

  it('recusa JSON quebrado, de outro programa ou com taxa em texto', () => {
    expect(deJSON('{ quebrado')).toEqual({ ok: false, erro: 'O arquivo JSON está corrompido ou não é JSON.' });
    expect(deJSON('{"a":1}').ok).toBe(false);
    const ruim = JSON.parse(paraJSON(exemplo()));
    ruim.simulacao.cenarios[0].taxas.agendamento = '30%';
    const r = deJSON(JSON.stringify(ruim));
    expect(r.ok === false && r.erro).toContain('não é um número');
  });

  it('recusa datas inválidas, modo desconhecido e etapas repetidas', () => {
    const base = () => JSON.parse(paraJSON(exemplo()));
    const datas = base(); datas.simulacao.prazo.fim = '2026-02-30';
    const modo = base(); modo.simulacao.prazo.modo = 'domingos';
    const rep = base(); rep.simulacao.etapas[1].id = 'agendamento';
    for (const o of [datas, modo, rep]) expect(deJSON(JSON.stringify(o)).ok).toBe(false);
  });

  it('completa taxa ausente com vazio e ignora chaves a mais', () => {
    const o = JSON.parse(paraJSON(exemplo()));
    delete o.simulacao.cenarios[0].taxas.matricula;
    o.simulacao.cenarios[0].taxas.lixo = 0.5;
    const s = ok(deJSON(JSON.stringify(o)));
    expect(s.cenarios[0]!.taxas).toEqual({ agendamento: 0.3, comparecimento: 0.4, matricula: null });
  });
});

describe('CSV (Excel pt-BR)', () => {
  it('usa ; , vírgula decimal, taxas em % e BOM para acentos', () => {
    const csv = paraCSV(exemplo());
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('etapa (taxa em %);Conservador;Realista;Otimista');
    expect(csv).toContain('Agendamento;30;12,5;50');
    expect(csv).toContain('fim;2026-12-04');
  });

  it('ida e volta devolve a mesma simulação (menos os ids internos)', () => {
    const s = exemplo();
    expect(semIds(ok(deCSV(paraCSV(s))))).toEqual(semIds(s));
  });

  it('protege nomes com ; aspas e fórmulas', () => {
    let s = adicionarEtapa(exemplo(), 'x', 'Visita; "presencial"');
    s = renomearEtapa(s, 'agendamento', '=HIPERLINK("x")');
    const csv = paraCSV(s);
    expect(csv).toContain('"Visita; ""presencial"""');
    expect(csv).toContain(`"'=HIPERLINK(""x"")"`);
    const volta = ok(deCSV(csv));
    expect(volta.etapas.map((e) => e.nome)).toEqual(['=HIPERLINK("x")', 'Comparecimento', 'Visita; "presencial"', 'Matrícula']);
    expect(volta.cenarios[0]!.taxas['etapa-3']).toBeNull();
  });

  it('aceita o CSV depois de salvo de novo pelo Excel (datas DD/MM/AAAA, sem BOM)', () => {
    const csv = paraCSV(exemplo()).slice(1).replace('inicio;2026-11-09', 'inicio;09/11/2026').replace('fim;2026-12-04', 'fim;4/12/2026');
    const s = ok(deCSV(csv));
    expect(s.prazo.inicio).toBe('2026-11-09');
    expect(s.prazo.fim).toBe('2026-12-04');
  });

  it('recusa CSV de outro programa, sem tabela ou com taxa inválida', () => {
    expect(deCSV('a;b\n1;2').ok).toBe(false);
    expect(deCSV('campo;valor\nformato;simulador-de-metas\nversao;1\n').ok).toBe(false);
    const ruim = paraCSV(exemplo()).replace('Agendamento;30;12,5;50', 'Agendamento;trinta;12,5;50');
    const r = deCSV(ruim);
    expect(r.ok === false && r.erro).toContain('não é um número');
  });

  it('lê aspas, separador vírgula e linhas com \\r\\n', () => {
    expect(lerLinhasCSV('a;"b;c"\r\n"d""e";f')).toEqual([['a', 'b;c'], ['d"e', 'f']]);
    expect(lerLinhasCSV('a,b\n1,2')).toEqual([['a', 'b'], ['1', '2']]);
  });
});

describe('lerArquivo e nomes', () => {
  it('escolhe pelo nome e recusa outros tipos e arquivos grandes', () => {
    expect(lerArquivo('X.JSON', paraJSON(exemplo())).ok).toBe(true);
    expect(lerArquivo('x.csv', paraCSV(exemplo())).ok).toBe(true);
    expect(lerArquivo('x.xlsx', '').ok).toBe(false);
    expect(lerArquivo('x.json', ' '.repeat(200_001)).ok).toBe(false);
  });
  it('nomeia com a data', () => {
    expect(nomeArquivo('csv', '2026-11-07')).toBe('simulador-de-metas-2026-11-07.csv');
  });
  it('normaliza datas', () => {
    expect(normalizarData('7/1/2027')).toBe('2027-01-07');
    expect(normalizarData('')).toBeNull();
  });
});
