import { funilReverso, tetoSeguro, validarTaxas } from './funil';
import { contarDias, paraDiaUTC } from './prazo';
import type { Aviso, Cenario, ResultadoCenario, Simulacao } from './types';

const fmt = (n: number) => n.toLocaleString('pt-BR');

/** Avisos que valem para todos os cenários (meta, prazo, contatos feitos, capacidade). */
function validarGeral(s: Simulacao): { avisos: Aviso[]; dias: number | null } {
  const avisos: Aviso[] = [];

  if (s.meta === null || Number.isNaN(s.meta)) {
    avisos.push({ tipo: 'incompleto', mensagem: 'Falta a meta de matrículas.' });
  } else if (!Number.isInteger(s.meta) || s.meta <= 0) {
    avisos.push({ tipo: 'inviavel', mensagem: 'A meta precisa ser um número inteiro maior que zero.' });
  }

  let dias: number | null = null;
  const { inicio, fim, modo, folgas } = s.prazo;
  if (!inicio || !fim) {
    avisos.push({ tipo: 'incompleto', mensagem: 'Falta a data de início ou a data final do prazo.' });
  } else if (paraDiaUTC(inicio) === null || paraDiaUTC(fim) === null) {
    avisos.push({ tipo: 'inviavel', mensagem: 'Uma das datas do prazo não existe.' });
  } else if (paraDiaUTC(fim)! < paraDiaUTC(inicio)!) {
    avisos.push({ tipo: 'inviavel', mensagem: 'A data final vem antes da data de início.' });
  } else if (!Number.isInteger(folgas) || folgas < 0) {
    avisos.push({ tipo: 'inviavel', mensagem: 'Folgas e feriados precisam ser um número inteiro, zero ou mais.' });
  } else {
    const brutos = contarDias(inicio, fim, modo)!;
    if (folgas > brutos) {
      avisos.push({ tipo: 'inviavel', mensagem: `Há mais folgas (${fmt(folgas)}) do que dias de trabalho no prazo (${fmt(brutos)}).` });
    } else if (brutos - folgas === 0) {
      avisos.push({ tipo: 'inviavel', mensagem: 'Não sobra nenhum dia de trabalho no prazo.' });
    } else {
      dias = brutos - folgas;
    }
  }

  if (s.contatosFeitos !== null && (!Number.isInteger(s.contatosFeitos) || s.contatosFeitos < 0)) {
    avisos.push({ tipo: 'inviavel', mensagem: 'Contatos já feitos precisam ser um número inteiro, zero ou mais.' });
  }
  if (s.capacidadeDiaria !== null && (!Number.isInteger(s.capacidadeDiaria) || s.capacidadeDiaria <= 0)) {
    avisos.push({ tipo: 'inviavel', mensagem: 'A capacidade diária precisa ser um número inteiro maior que zero.' });
  }

  return { avisos, dias };
}

function calcularCenario(s: Simulacao, c: Cenario, geral: Aviso[], dias: number | null): ResultadoCenario {
  const avisosTaxas = validarTaxas(s.etapas, c.taxas);
  const avisos = [...geral, ...avisosTaxas];
  const base: ResultadoCenario = {
    cenarioId: c.id,
    nome: c.nome,
    viavel: false,
    avisos,
    etapas: null,
    contatosTotal: null,
    contatosRestantes: null,
    dias,
    contatosPorDia: null,
  };

  const metaOk = s.meta !== null && Number.isInteger(s.meta) && s.meta > 0;
  const taxasOk = avisosTaxas.length === 0;
  if (!metaOk || !taxasOk) return base;

  const { etapas, contatos } = funilReverso(s.meta!, s.etapas, c.taxas);
  const feitosValidos = s.contatosFeitos !== null && Number.isInteger(s.contatosFeitos) && s.contatosFeitos >= 0;
  const feitos = feitosValidos ? s.contatosFeitos! : 0;
  const restantes = Math.max(0, contatos - feitos);
  const resultado: ResultadoCenario = { ...base, etapas, contatosTotal: contatos, contatosRestantes: restantes };

  if (feitos >= contatos) {
    avisos.push({ tipo: 'info', mensagem: 'Os contatos já feitos cobrem o total necessário neste cenário.' });
  }
  if (dias === null) return resultado;

  const porDia = restantes === 0 ? 0 : tetoSeguro(restantes / dias);
  resultado.contatosPorDia = porDia;

  const capacidadeOk = s.capacidadeDiaria !== null && Number.isInteger(s.capacidadeDiaria) && s.capacidadeDiaria > 0;
  if (capacidadeOk && porDia > s.capacidadeDiaria!) {
    avisos.push({
      tipo: 'inviavel',
      mensagem: `São ${fmt(porDia)} contatos por dia, acima da capacidade de ${fmt(s.capacidadeDiaria!)}.`,
    });
  }

  resultado.viavel = !avisos.some((a) => a.tipo !== 'info');
  return resultado;
}

/** Calcula todos os cenários da simulação. Função pura: não lê data, rede nem armazenamento. */
export function simular(s: Simulacao): ResultadoCenario[] {
  const { avisos, dias } = validarGeral(s);
  return s.cenarios.map((c) => calcularCenario(s, c, avisos, dias));
}
