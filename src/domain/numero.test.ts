import { describe, expect, it } from 'vitest';
import { escreverNumero, formatar, lerNumero } from './numero';

describe('lerNumero', () => {
  it('lê inteiros e decimais com vírgula ou ponto', () => {
    expect(lerNumero('10')).toBe(10);
    expect(lerNumero(' 12,5 ')).toBe(12.5);
    expect(lerNumero('12.5')).toBe(12.5);
    expect(lerNumero('30,')).toBe(30);
  });
  it('vazio é null', () => {
    expect(lerNumero('')).toBeNull();
    expect(lerNumero('   ')).toBeNull();
  });
  it('texto que não é número é NaN', () => {
    expect(lerNumero('abc')).toBeNaN();
    expect(lerNumero('1,2,3')).toBeNaN();
    expect(lerNumero(',')).toBeNaN();
  });
});

describe('escreverNumero', () => {
  it('converte fração em porcentagem sem ruído', () => {
    expect(escreverNumero(0.3, 100)).toBe('30');
    expect(escreverNumero(0.125, 100)).toBe('12,5');
  });
  it('null e NaN viram campo vazio', () => {
    expect(escreverNumero(null)).toBe('');
    expect(escreverNumero(Number.NaN)).toBe('');
  });
});

describe('formatar', () => {
  it('usa separador de milhar pt-BR', () => {
    expect(formatar(1200)).toBe('1.200');
  });
});
