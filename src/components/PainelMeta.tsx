import type { ModoContagem, Simulacao } from '../domain/types';
import { CampoNumero } from './CampoNumero';

const MODOS: { valor: ModoContagem; rotulo: string }[] = [
  { valor: 'seg-sex', rotulo: 'Dias úteis (seg–sex)' },
  { valor: 'seg-sab', rotulo: 'Segunda a sábado' },
  { valor: 'corridos', rotulo: 'Dias corridos' },
];

interface Props {
  s: Simulacao;
  mudar: (s: Simulacao) => void;
}

export function PainelMeta({ s, mudar }: Props) {
  const prazo = (p: Partial<Simulacao['prazo']>) => mudar({ ...s, prazo: { ...s.prazo, ...p } });

  return (
    <section aria-labelledby="t-meta" className="card painel reveal">
      <h2 id="t-meta" className="painel__titulo">Meta e prazo</h2>
      <div className="grade-campos">
        <CampoNumero
          id="meta"
          rotulo="Meta de matrículas"
          valor={s.meta}
          aoMudar={(meta) => mudar({ ...s, meta })}
          dica="É a última etapa do funil."
        />

        <div className="campo">
          <label htmlFor="inicio" className="campo__rotulo">Início do prazo</label>
          <input
            id="inicio"
            className="campo__input"
            type="date"
            value={s.prazo.inicio ?? ''}
            onChange={(e) => prazo({ inicio: e.target.value || null })}
          />
        </div>

        <div className="campo">
          <label htmlFor="fim" className="campo__rotulo">Fim do prazo</label>
          <input
            id="fim"
            className="campo__input"
            type="date"
            value={s.prazo.fim ?? ''}
            min={s.prazo.inicio ?? undefined}
            onChange={(e) => prazo({ fim: e.target.value || null })}
          />
        </div>

        <div className="campo">
          <label htmlFor="modo" className="campo__rotulo">Como contar os dias</label>
          <select
            id="modo"
            className="campo__input"
            value={s.prazo.modo}
            onChange={(e) => prazo({ modo: e.target.value as ModoContagem })}
          >
            {MODOS.map((m) => (
              <option key={m.valor} value={m.valor}>{m.rotulo}</option>
            ))}
          </select>
        </div>

        <CampoNumero
          id="folgas"
          rotulo="Folgas e feriados no período"
          valor={s.prazo.folgas}
          aoMudar={(v) => prazo({ folgas: v ?? 0 })}
          dica="Dias sem trabalho dentro do prazo. Vazio conta como zero."
        />

        <CampoNumero
          id="feitos"
          rotulo="Contatos já feitos (opcional)"
          valor={s.contatosFeitos}
          aoMudar={(contatosFeitos) => mudar({ ...s, contatosFeitos })}
        />

        <CampoNumero
          id="capacidade"
          rotulo="Capacidade por dia (opcional)"
          valor={s.capacidadeDiaria}
          aoMudar={(capacidadeDiaria) => mudar({ ...s, capacidadeDiaria })}
          dica="Quantos contatos você consegue fazer por dia. Acima disso, o cenário fica inviável."
        />
      </div>
    </section>
  );
}
