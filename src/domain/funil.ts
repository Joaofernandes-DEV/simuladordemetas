import type { Aviso, Etapa, QuantidadeEtapa, Taxas } from './types';

/**
 * Arredonda para cima, ignorando o ruído do ponto flutuante
 * (ex.: 57 / 0.57 = 100.00000000000001 deve dar 100, não 101).
 */
export function tetoSeguro(x: number): number {
  return Math.ceil(Number(x.toFixed(9)));
}

/** Confere as taxas de um cenário. Devolve os avisos; lista vazia = tudo certo. */
export function validarTaxas(etapas: Etapa[], taxas: Taxas): Aviso[] {
  const avisos: Aviso[] = [];
  if (etapas.length === 0) {
    avisos.push({ tipo: 'incompleto', mensagem: 'Adicione pelo menos uma etapa ao funil.' });
  }
  for (const e of etapas) {
    const t = taxas[e.id];
    const nome = e.nome.trim() || 'sem nome';
    if (t === null || t === undefined) {
      avisos.push({ tipo: 'incompleto', mensagem: `Falta a taxa da etapa "${nome}".` });
    } else if (!Number.isFinite(t)) {
      avisos.push({ tipo: 'inviavel', mensagem: `A taxa da etapa "${nome}" não é um número válido.` });
    } else if (t <= 0) {
      avisos.push({ tipo: 'inviavel', mensagem: `A taxa da etapa "${nome}" é 0%: nenhum volume chega à meta.` });
    } else if (t > 1) {
      avisos.push({ tipo: 'inviavel', mensagem: `A taxa da etapa "${nome}" passa de 100%.` });
    }
  }
  return avisos;
}

/**
 * Funil de trás para frente: parte da meta (última etapa) e divide pela taxa de cada etapa,
 * arredondando para cima em cada passo (não existe meia pessoa).
 * Pressupõe taxas válidas (use `validarTaxas` antes).
 */
export function funilReverso(
  meta: number,
  etapas: Etapa[],
  taxas: Taxas,
): { etapas: QuantidadeEtapa[]; contatos: number } {
  const quantidades: QuantidadeEtapa[] = new Array(etapas.length);
  let necessario = meta;
  for (let i = etapas.length - 1; i >= 0; i--) {
    const etapa = etapas[i]!;
    quantidades[i] = { etapaId: etapa.id, nome: etapa.nome, necessario };
    necessario = tetoSeguro(necessario / taxas[etapa.id]!);
  }
  return { etapas: quantidades, contatos: necessario };
}
