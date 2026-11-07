import { describe, expect, it } from 'vitest';
import { contarDias, hojeISO, paraDiaUTC } from './prazo';

describe('paraDiaUTC', () => {
  it('rejeita datas que não existem ou mal formatadas', () => {
    expect(paraDiaUTC('2026-02-30')).toBeNull();
    expect(paraDiaUTC('07/11/2026')).toBeNull();
    expect(paraDiaUTC('2026-11-07')).not.toBeNull();
  });
});

describe('contarDias', () => {
  // 2026-11-09 é segunda; 2026-11-22 é domingo: duas semanas completas.
  it('conta os três modos em duas semanas', () => {
    expect(contarDias('2026-11-09', '2026-11-22', 'seg-sex')).toBe(10);
    expect(contarDias('2026-11-09', '2026-11-22', 'seg-sab')).toBe(12);
    expect(contarDias('2026-11-09', '2026-11-22', 'corridos')).toBe(14);
  });

  it('inclui início e fim', () => {
    expect(contarDias('2026-11-09', '2026-11-09', 'seg-sex')).toBe(1);
    expect(contarDias('2026-11-08', '2026-11-08', 'seg-sex')).toBe(0); // domingo
  });

  it('atravessa a virada de ano sem erro', () => {
    expect(contarDias('2026-12-28', '2027-01-03', 'corridos')).toBe(7);
  });

  it('devolve 0 quando o fim vem antes e null para data inválida', () => {
    expect(contarDias('2026-11-10', '2026-11-09', 'corridos')).toBe(0);
    expect(contarDias('2026-11-10', '2026-13-01', 'corridos')).toBeNull();
  });
});

describe('hojeISO', () => {
  it('formata com zeros à esquerda', () => {
    expect(hojeISO(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
