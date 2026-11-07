import type { ModoContagem } from './types';

const DATA = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Converte AAAA-MM-DD em dia UTC (sem fuso nem horário de verão). `null` se a data não existir. */
export function paraDiaUTC(iso: string): number | null {
  const m = DATA.exec(iso);
  if (!m) return null;
  const [a, me, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = Date.UTC(a, me - 1, d);
  const dt = new Date(t);
  if (dt.getUTCFullYear() !== a || dt.getUTCMonth() !== me - 1 || dt.getUTCDate() !== d) return null;
  return t / 86_400_000;
}

/** Dia da semana: 0 = domingo … 6 = sábado. */
function diaDaSemana(diaUTC: number): number {
  return new Date(diaUTC * 86_400_000).getUTCDay();
}

function conta(modo: ModoContagem, dow: number): boolean {
  if (modo === 'corridos') return true;
  if (modo === 'seg-sab') return dow !== 0;
  return dow !== 0 && dow !== 6;
}

/** Dias de trabalho entre `inicio` e `fim`, os dois incluídos, conforme o modo. Antes de descontar folgas. */
export function contarDias(inicio: string, fim: string, modo: ModoContagem): number | null {
  const a = paraDiaUTC(inicio);
  const b = paraDiaUTC(fim);
  if (a === null || b === null) return null;
  if (b < a) return 0;
  let n = 0;
  for (let d = a; d <= b; d++) if (conta(modo, diaDaSemana(d))) n++;
  return n;
}

/** Data de hoje em AAAA-MM-DD no fuso local do navegador. */
export function hojeISO(agora: Date = new Date()): string {
  const p = (x: number) => String(x).padStart(2, '0');
  return `${agora.getFullYear()}-${p(agora.getMonth() + 1)}-${p(agora.getDate())}`;
}
