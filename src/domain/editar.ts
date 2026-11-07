import type { Simulacao } from './types';

/**
 * Edições puras da simulação: devolvem uma cópia nova, nunca alteram a recebida.
 * A última etapa é sempre a meta, então etapas novas entram logo antes dela.
 */

export function adicionarEtapa(s: Simulacao, id: string, nome = 'Nova etapa'): Simulacao {
  const pos = Math.max(0, s.etapas.length - 1);
  const etapas = [...s.etapas.slice(0, pos), { id, nome }, ...s.etapas.slice(pos)];
  // Taxa nova começa vazia em todos os cenários: quem usa preenche (nada de chute).
  const cenarios = s.cenarios.map((c) => ({ ...c, taxas: { ...c.taxas, [id]: null } }));
  return { ...s, etapas, cenarios };
}

export function removerEtapa(s: Simulacao, id: string): Simulacao {
  if (s.etapas.length <= 1) return s;
  const etapas = s.etapas.filter((e) => e.id !== id);
  const cenarios = s.cenarios.map((c) => {
    const taxas = { ...c.taxas };
    delete taxas[id];
    return { ...c, taxas };
  });
  return { ...s, etapas, cenarios };
}

export function renomearEtapa(s: Simulacao, id: string, nome: string): Simulacao {
  return { ...s, etapas: s.etapas.map((e) => (e.id === id ? { ...e, nome } : e)) };
}

export function definirTaxa(s: Simulacao, cenarioId: string, etapaId: string, taxa: number | null): Simulacao {
  return {
    ...s,
    cenarios: s.cenarios.map((c) => (c.id === cenarioId ? { ...c, taxas: { ...c.taxas, [etapaId]: taxa } } : c)),
  };
}
