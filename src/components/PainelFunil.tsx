import { useRef } from 'react';
import { adicionarEtapa, definirTaxa, removerEtapa, renomearEtapa } from '../domain/editar';
import { novoId } from '../domain/exemplo';
import type { Simulacao } from '../domain/types';
import { CampoNumero } from './CampoNumero';

interface Props {
  s: Simulacao;
  mudar: (s: Simulacao) => void;
}

export function PainelFunil({ s, mudar }: Props) {
  const lista = useRef<HTMLOListElement>(null);
  const unica = s.etapas.length <= 1;

  const adicionar = () => {
    const id = novoId();
    mudar(adicionarEtapa(s, id));
    // Leva o foco para o nome da etapa nova (teclado e leitor de tela).
    requestAnimationFrame(() => document.getElementById(`nome-${id}`)?.focus());
  };

  const remover = (id: string, i: number) => {
    mudar(removerEtapa(s, id));
    // Foco vai para o nome da etapa vizinha, para não se perder no topo da página.
    const vizinha = s.etapas[i + 1] ?? s.etapas[i - 1];
    requestAnimationFrame(() => {
      const alvo = vizinha && document.getElementById(`nome-${vizinha.id}`);
      (alvo ?? lista.current)?.focus();
    });
  };

  return (
    <section aria-labelledby="t-funil" className="card painel reveal">
      <div className="painel__topo">
        <h2 id="t-funil" className="painel__titulo">Funil por cenário</h2>
        <button type="button" className="btn btn--quiet" onClick={adicionar}>
          <span aria-hidden="true">+</span> Adicionar etapa
        </button>
      </div>
      <p className="campo__dica painel__intro">
        Cada taxa é a porcentagem da etapa anterior que chega a esta. Na primeira etapa, é a porcentagem dos contatos. A última etapa é a meta. Etapas novas entram antes dela.
      </p>

      <div className="funil__cabeca" aria-hidden="true">
        <span>Etapa</span>
        {s.cenarios.map((c) => <span key={c.id}>{c.nome}</span>)}
        <span />
      </div>

      <ol className="funil" ref={lista} tabIndex={-1} aria-label="Etapas do funil, do contato até a meta">
        {s.etapas.map((e, i) => {
          const nome = e.nome.trim() || 'sem nome';
          return (
            <li key={e.id} className="funil__linha">
              {/* No desktop, `display: contents` põe nome e botão na grade da linha; no celular, viram uma faixa. */}
              <div className="funil__topo-linha">
                <div className="campo funil__nome">
                  <label htmlFor={`nome-${e.id}`} className="sr-only">Nome da etapa {i + 1}</label>
                  <span className="funil__ordem" aria-hidden="true">{i + 1}</span>
                  <input
                    id={`nome-${e.id}`}
                    className="campo__input"
                    type="text"
                    value={e.nome}
                    maxLength={40}
                    onChange={(ev) => mudar(renomearEtapa(s, e.id, ev.target.value))}
                  />
                </div>
                <button
                  type="button"
                  className="icon-btn funil__remover"
                  onClick={() => remover(e.id, i)}
                  disabled={unica}
                  aria-label={`Remover a etapa ${nome}`}
                  title={unica ? 'O funil precisa de pelo menos uma etapa' : undefined}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
              {s.cenarios.map((c) => (
                <div key={c.id} className="funil__taxa">
                  <span className="funil__cenario" aria-hidden="true">{c.nome}</span>
                  <CampoNumero
                    id={`taxa-${c.id}-${e.id}`}
                    rotulo={`Taxa de ${nome} no cenário ${c.nome}, em porcentagem`}
                    rotuloOculto
                    valor={c.taxas[e.id] ?? null}
                    aoMudar={(v) => mudar(definirTaxa(s, c.id, e.id, v))}
                    escala={100}
                    sufixo="%"
                    decimal
                  />
                </div>
              ))}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
