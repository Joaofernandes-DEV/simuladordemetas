import { formatar } from '../domain/numero';
import type { Aviso, ResultadoCenario } from '../domain/types';

const ROTULO_AVISO: Record<Aviso['tipo'], string> = {
  inviavel: 'Inviável',
  incompleto: 'Incompleto',
  info: 'Observação',
};

const n = (v: number | null) => (v === null ? '—' : formatar(v));

export function CartaoResultado({ r }: { r: ResultadoCenario }) {
  const inviavel = r.avisos.some((a) => a.tipo === 'inviavel');
  const estado = r.viavel ? 'ok' : inviavel ? 'inviavel' : 'incompleto';
  const titulo = `res-${r.cenarioId}`;

  return (
    <article className={`card resultado resultado--${estado}`} aria-labelledby={titulo}>
      <header className="resultado__topo">
        <h3 id={titulo} className="resultado__nome">{r.nome}</h3>
        <span className={`selo selo--${estado}`}>
          {estado === 'ok' ? 'Viável' : estado === 'inviavel' ? 'Inviável' : 'Incompleto'}
        </span>
      </header>

      <p className="resultado__destaque">
        <span className="resultado__numero">{n(r.contatosPorDia)}</span>
        <span className="resultado__unidade">contatos por dia</span>
      </p>

      <dl className="resultado__dados">
        <div><dt>Contatos no total</dt><dd>{n(r.contatosTotal)}</dd></div>
        <div><dt>Ainda faltam</dt><dd>{n(r.contatosRestantes)}</dd></div>
        <div><dt>Dias de trabalho</dt><dd>{n(r.dias)}</dd></div>
      </dl>

      {r.etapas && r.contatosTotal !== null && (
        <div className="resultado__funil">
          <h4 className="resultado__sub">O que a meta exige</h4>
          <ol>
            <li><span>Contatos</span><b>{formatar(r.contatosTotal)}</b></li>
            {r.etapas.map((e) => (
              <li key={e.etapaId}><span>{e.nome.trim() || 'sem nome'}</span><b>{formatar(e.necessario)}</b></li>
            ))}
          </ol>
        </div>
      )}

      {r.avisos.length > 0 && (
        <ul className="avisos" aria-label={`Avisos do cenário ${r.nome}`}>
          {r.avisos.map((a, i) => (
            <li key={i} className={`aviso aviso--${a.tipo}`}>
              <b>{ROTULO_AVISO[a.tipo]}:</b> {a.mensagem}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
