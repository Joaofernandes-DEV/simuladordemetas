/**
 * Lê um número digitado em pt-BR. Aceita vírgula ou ponto como decimal e espaços nas pontas.
 * Vazio → null. Texto que não é número → NaN (o domínio avisa que é inválido).
 */
export function lerNumero(texto: string): number | null {
  const t = texto.trim().replace(/\s/g, '');
  if (t === '') return null;
  if (!/^-?\d*[.,]?\d*$/.test(t) || t === '-' || t === ',' || t === '.') return Number.NaN;
  return Number(t.replace(',', '.'));
}

/** Escreve um número para um campo de texto, sem ruído de ponto flutuante (0,3 × 100 = 30). */
export function escreverNumero(n: number | null, escala = 1): string {
  if (n === null || Number.isNaN(n)) return '';
  return String(Number((n * escala).toFixed(6))).replace('.', ',');
}

/** Formata para exibição em pt-BR (separador de milhar). */
export const formatar = (n: number): string => n.toLocaleString('pt-BR');
