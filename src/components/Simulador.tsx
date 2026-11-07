import { useEffect, useMemo, useState } from 'react';
import { simulacaoExemplo } from '../domain/exemplo';
import { formatar } from '../domain/numero';
import { simular } from '../domain/simular';
import type { ResultadoCenario, Simulacao } from '../domain/types';
import { CartaoResultado } from './CartaoResultado';
import { PainelFunil } from './PainelFunil';
import { PainelMeta } from './PainelMeta';

function resumo(rs: ResultadoCenario[]): string {
  return rs
    .map((r) => {
      if (r.contatosPorDia !== null && r.viavel) return `${r.nome}: ${formatar(r.contatosPorDia)} contatos por dia.`;
      if (r.contatosPorDia !== null) return `${r.nome}: ${formatar(r.contatosPorDia)} contatos por dia, inviável.`;
      return `${r.nome}: ${r.avisos.some((a) => a.tipo === 'inviavel') ? 'inviável' : 'incompleto'}.`;
    })
    .join(' ');
}

export function Simulador({ inicial }: { inicial?: Simulacao }) {
  const [s, setS] = useState<Simulacao>(() => inicial ?? simulacaoExemplo());
  const resultados = useMemo(() => simular(s), [s]);

  // Leitor de tela: anuncia o resumo só quando a digitação para (evita falar a cada tecla).
  const [anuncio, setAnuncio] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setAnuncio(resumo(resultados)), 900);
    return () => clearTimeout(t);
  }, [resultados]);

  return (
    <>
      <div className="entradas">
        <PainelMeta s={s} mudar={setS} />
        <PainelFunil s={s} mudar={setS} />
      </div>

      <section aria-labelledby="t-resultados" className="resultados">
        <div className="resultados__topo reveal">
          <h2 id="t-resultados" className="h2">Cenários lado a lado</h2>
          <span className="pill">Dados fictícios</span>
        </div>
        <div className="resultados__grade">
          {resultados.map((r) => <CartaoResultado key={r.cenarioId} r={r} />)}
        </div>
      </section>

      <p className="sr-only" aria-live="polite" aria-atomic="true">{anuncio}</p>
    </>
  );
}
