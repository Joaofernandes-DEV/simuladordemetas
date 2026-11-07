import { paraDiaUTC } from './prazo';
import { escreverNumero, lerNumero } from './numero';
import type { Cenario, Etapa, ModoContagem, Simulacao, Taxas } from './types';

/**
 * Exportar e importar a simulação em JSON e em CSV (formato do Excel brasileiro: `;` e vírgula decimal).
 * Tudo acontece no navegador. Funções puras: recebem e devolvem texto.
 */

export const FORMATO = 'simulador-de-metas';
export const LIMITE_BYTES = 200_000;
const MAX_ETAPAS = 20;
const MAX_CENARIOS = 5;
const MAX_NOME = 40;
const MODOS: ModoContagem[] = ['seg-sex', 'seg-sab', 'corridos'];

export type Leitura = { ok: true; simulacao: Simulacao } | { ok: false; erro: string };

const falha = (erro: string): Leitura => ({ ok: false, erro });

// ---------------------------------------------------------------- validação comum

const ehObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const numOuNulo = (v: unknown): v is number | null => v === null || (typeof v === 'number' && Number.isFinite(v));
const dataOuNula = (v: unknown): v is string | null => v === null || (typeof v === 'string' && paraDiaUTC(v) !== null);

/** Confere a estrutura de um objeto vindo de fora. Valores fora da faixa (ex.: taxa 0) passam: a tela avisa. */
export function validarSimulacao(o: unknown): Leitura {
  if (!ehObjeto(o)) return falha('O arquivo não contém uma simulação.');
  if (o.versao !== 1) return falha('Versão de arquivo desconhecida.');
  if (!numOuNulo(o.meta)) return falha('A meta precisa ser um número ou ficar vazia.');
  if (!numOuNulo(o.contatosFeitos)) return falha('Contatos já feitos precisam ser um número ou ficar vazios.');
  if (!numOuNulo(o.capacidadeDiaria)) return falha('A capacidade diária precisa ser um número ou ficar vazia.');

  const p = o.prazo;
  if (!ehObjeto(p)) return falha('Falta o prazo.');
  if (!dataOuNula(p.inicio) || !dataOuNula(p.fim)) return falha('As datas do prazo precisam estar no formato AAAA-MM-DD.');
  if (typeof p.modo !== 'string' || !MODOS.includes(p.modo as ModoContagem)) return falha('Modo de contagem de dias desconhecido.');
  if (typeof p.folgas !== 'number' || !Number.isInteger(p.folgas) || p.folgas < 0) return falha('Folgas precisam ser um número inteiro, zero ou mais.');

  if (!Array.isArray(o.etapas) || o.etapas.length === 0 || o.etapas.length > MAX_ETAPAS) {
    return falha(`O funil precisa ter de 1 a ${MAX_ETAPAS} etapas.`);
  }
  const etapas: Etapa[] = [];
  const ids = new Set<string>();
  for (const e of o.etapas) {
    if (!ehObjeto(e) || typeof e.id !== 'string' || e.id === '' || typeof e.nome !== 'string') return falha('Há uma etapa sem id ou sem nome.');
    if (ids.has(e.id)) return falha('Há duas etapas com o mesmo id.');
    if (e.nome.length > MAX_NOME) return falha(`O nome de uma etapa passa de ${MAX_NOME} caracteres.`);
    ids.add(e.id);
    etapas.push({ id: e.id, nome: e.nome });
  }

  if (!Array.isArray(o.cenarios) || o.cenarios.length === 0 || o.cenarios.length > MAX_CENARIOS) {
    return falha(`É preciso ter de 1 a ${MAX_CENARIOS} cenários.`);
  }
  const cenarios: Cenario[] = [];
  for (const c of o.cenarios) {
    if (!ehObjeto(c) || typeof c.id !== 'string' || typeof c.nome !== 'string' || !ehObjeto(c.taxas)) return falha('Há um cenário incompleto.');
    const taxas: Taxas = {};
    for (const e of etapas) {
      const t = c.taxas[e.id] ?? null;
      if (!numOuNulo(t)) return falha(`A taxa da etapa "${e.nome}" no cenário "${c.nome}" não é um número.`);
      taxas[e.id] = t;
    }
    cenarios.push({ id: c.id, nome: c.nome.slice(0, MAX_NOME), taxas });
  }

  return {
    ok: true,
    simulacao: {
      versao: 1,
      meta: o.meta,
      prazo: { inicio: p.inicio, fim: p.fim, modo: p.modo as ModoContagem, folgas: p.folgas },
      contatosFeitos: o.contatosFeitos,
      capacidadeDiaria: o.capacidadeDiaria,
      etapas,
      cenarios,
    },
  };
}

// ---------------------------------------------------------------- JSON

export function paraJSON(s: Simulacao): string {
  return JSON.stringify({ formato: FORMATO, aviso: 'Dados fictícios, ajuste para a sua realidade.', simulacao: s }, null, 2) + '\n';
}

export function deJSON(texto: string): Leitura {
  let o: unknown;
  try {
    o = JSON.parse(texto);
  } catch {
    return falha('O arquivo JSON está corrompido ou não é JSON.');
  }
  if (!ehObjeto(o) || o.formato !== FORMATO) return falha('Este JSON não foi exportado pelo Simulador de metas.');
  return validarSimulacao(o.simulacao);
}

// ---------------------------------------------------------------- CSV (Excel pt-BR)

const SEP = ';';
const BOM = '﻿';

/** Aspas quando preciso; apóstrofo antes de = + - @ para o Excel não executar o texto como fórmula. */
function celula(v: string): string {
  const seguro = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return /[";\r\n]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro;
}

function desfazerApostrofo(v: string): string {
  return /^'[=+\-@\t\r]/.test(v) ? v.slice(1) : v;
}

/** Lê CSV com `;` (ou `,`, se for o separador da primeira linha) e aspas duplas. */
export function lerLinhasCSV(texto: string): string[][] {
  const t = texto.startsWith(BOM) ? texto.slice(1) : texto;
  const primeira = t.split(/\r?\n/, 1)[0] ?? '';
  const sep = primeira.includes(SEP) ? SEP : ',';
  const linhas: string[][] = [];
  let linha: string[] = [];
  let campo = '';
  let aspas = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i]!;
    if (aspas) {
      if (ch === '"' && t[i + 1] === '"') { campo += '"'; i++; }
      else if (ch === '"') aspas = false;
      else campo += ch;
    } else if (ch === '"' && campo === '') aspas = true;
    else if (ch === sep) { linha.push(campo); campo = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && t[i + 1] === '\n') i++;
      linha.push(campo); linhas.push(linha); linha = []; campo = '';
    } else campo += ch;
  }
  if (campo !== '' || linha.length > 0) { linha.push(campo); linhas.push(linha); }
  return linhas;
}

const num = (n: number | null, escala = 1) => escreverNumero(n, escala);

export function paraCSV(s: Simulacao): string {
  const linhas: string[][] = [
    ['campo', 'valor'],
    ['formato', FORMATO],
    ['versao', '1'],
    ['aviso', 'Dados fictícios, ajuste para a sua realidade.'],
    ['meta', num(s.meta)],
    ['inicio', s.prazo.inicio ?? ''],
    ['fim', s.prazo.fim ?? ''],
    ['modo', s.prazo.modo],
    ['folgas', num(s.prazo.folgas)],
    ['contatos_feitos', num(s.contatosFeitos)],
    ['capacidade_diaria', num(s.capacidadeDiaria)],
    [],
    ['etapa (taxa em %)', ...s.cenarios.map((c) => c.nome)],
    ...s.etapas.map((e) => [e.nome, ...s.cenarios.map((c) => num(c.taxas[e.id] ?? null, 100))]),
  ];
  return BOM + linhas.map((l) => l.map(celula).join(SEP)).join('\r\n') + '\r\n';
}

/** Aceita AAAA-MM-DD e também DD/MM/AAAA (o Excel em pt-BR reescreve as datas assim ao salvar). */
export function normalizarData(v: string | undefined): string | null {
  const t = (v ?? '').trim();
  if (t === '') return null;
  const br = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t);
  if (br) return `${br[3]}-${br[2]!.padStart(2, '0')}-${br[1]!.padStart(2, '0')}`;
  return t;
}

const ID_CENARIO: Record<string, string> = { conservador: 'conservador', realista: 'realista', otimista: 'otimista' };

function numeroCSV(v: string | undefined, rotulo: string, escala = 1): number | null | string {
  const n = lerNumero(v ?? '');
  if (n === null) return null;
  if (Number.isNaN(n)) return `O valor de "${rotulo}" no CSV não é um número.`;
  return n / escala;
}

export function deCSV(texto: string): Leitura {
  const linhas = lerLinhasCSV(texto);
  const campos = new Map<string, string>();
  let i = 0;
  for (; i < linhas.length; i++) {
    const l = linhas[i]!;
    if (l.length === 1 && l[0] === '') break; // linha em branco separa os blocos
    if (l[0] !== undefined) campos.set(l[0].trim(), desfazerApostrofo((l[1] ?? '').trim()));
  }
  if (campos.get('formato') !== FORMATO) return falha('Este CSV não foi exportado pelo Simulador de metas.');

  const cab = linhas.slice(i + 1).find((l) => l.some((c) => c.trim() !== ''));
  if (!cab) return falha('O CSV não tem a tabela de etapas e taxas.');
  const inicioTabela = linhas.indexOf(cab);
  const nomesCenarios = cab.slice(1).map((c) => desfazerApostrofo(c.trim())).filter((c) => c !== '');
  const linhasEtapas = linhas.slice(inicioTabela + 1).filter((l) => l.some((c) => c.trim() !== ''));

  const etapas: Etapa[] = [];
  const cenarios: Cenario[] = nomesCenarios.map((nome, k) => ({
    id: ID_CENARIO[nome.toLowerCase()] ?? `cenario-${k + 1}`,
    nome,
    taxas: {},
  }));
  for (const [k, l] of linhasEtapas.entries()) {
    const etapa = { id: `etapa-${k + 1}`, nome: desfazerApostrofo((l[0] ?? '').trim()) };
    etapas.push(etapa);
    for (const [j, c] of cenarios.entries()) {
      const t = numeroCSV(l[j + 1], `${etapa.nome} / ${c.nome}`, 100);
      if (typeof t === 'string') return falha(t);
      c.taxas[etapa.id] = t;
    }
  }

  const valores: Record<string, number | null> = {};
  for (const [chave, rotulo] of [['meta', 'meta'], ['folgas', 'folgas'], ['contatos_feitos', 'contatos já feitos'], ['capacidade_diaria', 'capacidade diária']] as const) {
    const v = numeroCSV(campos.get(chave), rotulo);
    if (typeof v === 'string') return falha(v);
    valores[chave] = v;
  }

  return validarSimulacao({
    versao: Number(campos.get('versao')),
    meta: valores.meta ?? null,
    prazo: {
      inicio: normalizarData(campos.get('inicio')),
      fim: normalizarData(campos.get('fim')),
      modo: campos.get('modo'),
      folgas: valores.folgas ?? 0,
    },
    contatosFeitos: valores.contatos_feitos ?? null,
    capacidadeDiaria: valores.capacidade_diaria ?? null,
    etapas,
    cenarios,
  });
}

/** Escolhe o leitor pelo nome do arquivo e recusa arquivos grandes demais. */
export function lerArquivo(nome: string, texto: string): Leitura {
  if (texto.length > LIMITE_BYTES) return falha('O arquivo é grande demais para uma simulação.');
  const n = nome.toLowerCase();
  if (n.endsWith('.json')) return deJSON(texto);
  if (n.endsWith('.csv')) return deCSV(texto);
  return falha('Escolha um arquivo .json ou .csv exportado pelo simulador.');
}

export function nomeArquivo(ext: 'json' | 'csv', hoje: string): string {
  return `simulador-de-metas-${hoje}.${ext}`;
}
