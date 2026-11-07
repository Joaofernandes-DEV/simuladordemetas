import { describe, expect, it } from 'vitest';
import { funilReverso, tetoSeguro, validarTaxas } from './funil';
import type { Etapa } from './types';

const etapas: Etapa[] = [
  { id: 'ag', nome: 'Agendamento' },
  { id: 'co', nome: 'Comparecimento' },
  { id: 'ma', nome: 'Matrícula' },
];

describe('tetoSeguro', () => {
  it('ignora ruído de ponto flutuante', () => {
    expect(Math.ceil(57 / 0.57)).toBe(101); // 57 ÷ 0,57 = 100.00000000000001
    expect(tetoSeguro(57 / 0.57)).toBe(100);
  });
  it('arredonda para cima frações reais', () => {
    expect(tetoSeguro(40.2)).toBe(41);
    expect(tetoSeguro(40)).toBe(40);
  });
});

describe('funilReverso', () => {
  it('exemplo conferido à mão: 10 matrículas → 40 → 80 → 200 contatos', () => {
    // 10 ÷ 0,25 = 40 comparecimentos; 40 ÷ 0,5 = 80 agendamentos; 80 ÷ 0,4 = 200 contatos.
    const r = funilReverso(10, etapas, { ag: 0.4, co: 0.5, ma: 0.25 });
    expect(r.etapas.map((e) => e.necessario)).toEqual([80, 40, 10]);
    expect(r.contatos).toBe(200);
  });

  it('arredonda para cima em cada etapa', () => {
    // 3 ÷ 0,4 = 7,5 → 8; 8 ÷ 0,3 = 26,67 → 27
    const r = funilReverso(3, [{ id: 'a', nome: 'A' }, { id: 'b', nome: 'B' }], { a: 0.3, b: 0.4 });
    expect(r.etapas.map((e) => e.necessario)).toEqual([8, 3]);
    expect(r.contatos).toBe(27);
  });

  it('funciona com uma etapa só e com taxa de 100%', () => {
    expect(funilReverso(5, [{ id: 'm', nome: 'Matrícula' }], { m: 1 }).contatos).toBe(5);
  });

  it('funciona com etapas adicionadas', () => {
    const quatro = [...etapas.slice(0, 2), { id: 'vi', nome: 'Visita' }, etapas[2]!];
    const r = funilReverso(10, quatro, { ag: 0.4, co: 0.5, vi: 0.5, ma: 0.25 });
    expect(r.contatos).toBe(400);
  });
});

describe('validarTaxas', () => {
  it('aceita taxas entre 0 (exclusivo) e 1', () => {
    expect(validarTaxas(etapas, { ag: 0.4, co: 0.5, ma: 1 })).toEqual([]);
  });
  it('marca taxa vazia como incompleta', () => {
    const a = validarTaxas(etapas, { ag: 0.4, co: null, ma: 0.25 });
    expect(a).toEqual([{ tipo: 'incompleto', mensagem: 'Falta a taxa da etapa "Comparecimento".' }]);
  });
  it('marca taxa ausente no objeto como incompleta', () => {
    expect(validarTaxas(etapas, { ag: 0.4, co: 0.5 })[0]?.tipo).toBe('incompleto');
  });
  it('marca taxa 0 e acima de 100% como inviáveis', () => {
    const a = validarTaxas(etapas, { ag: 0, co: 1.2, ma: 0.25 });
    expect(a.map((x) => x.tipo)).toEqual(['inviavel', 'inviavel']);
  });
  it('marca taxa que não é número como inviável', () => {
    const a = validarTaxas(etapas, { ag: Number.NaN, co: 0.5, ma: 0.25 });
    expect(a).toEqual([{ tipo: 'inviavel', mensagem: 'A taxa da etapa "Agendamento" não é um número válido.' }]);
  });
  it('pede ao menos uma etapa', () => {
    expect(validarTaxas([], {})[0]?.tipo).toBe('incompleto');
  });
});
