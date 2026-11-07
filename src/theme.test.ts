import { describe, expect, it } from 'vitest';
import { alternar, lerTemaSalvo, salvarTema } from './theme';

describe('tema', () => {
  it('alterna entre claro e escuro', () => {
    expect(alternar('dark')).toBe('light');
    expect(alternar('light')).toBe('dark');
  });

  it('ignora valor salvo inválido', () => {
    expect(lerTemaSalvo({ getItem: () => 'roxo' })).toBeNull();
  });

  it('não quebra quando o armazenamento lança erro', () => {
    const quebrado = {
      getItem: (): string | null => {
        throw new Error('bloqueado');
      },
      setItem: (): void => {
        throw new Error('bloqueado');
      },
    };
    expect(lerTemaSalvo(quebrado)).toBeNull();
    expect(() => salvarTema('light', quebrado)).not.toThrow();
  });
});
