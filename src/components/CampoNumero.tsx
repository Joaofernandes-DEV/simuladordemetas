import { useState } from 'react';
import { escreverNumero, lerNumero } from '../domain/numero';

const mesmo = (a: number | null, b: number | null) =>
  a === b || (a !== null && b !== null && Number.isNaN(a) && Number.isNaN(b));

interface Props {
  id: string;
  rotulo: string;
  /** Rótulo só para leitor de tela (quando o visível é curto ou está num cabeçalho). */
  rotuloOculto?: boolean;
  valor: number | null;
  aoMudar: (v: number | null) => void;
  /** 100 para porcentagem: mostra 30, guarda 0,3. */
  escala?: number;
  sufixo?: string;
  decimal?: boolean;
  dica?: string;
  placeholder?: string;
}

/**
 * Campo numérico em pt-BR que guarda o texto digitado (para "12," não sumir no meio da digitação)
 * e só reescreve o texto quando o valor muda por fora (ex.: importação).
 */
export function CampoNumero({ id, rotulo, rotuloOculto, valor, aoMudar, escala = 1, sufixo, decimal, dica, placeholder }: Props) {
  const [texto, setTexto] = useState(() => escreverNumero(valor, escala));
  const [visto, setVisto] = useState(valor);

  // Valor mudou por fora (importação): reescreve o texto no mesmo desenho, sem efeito nem quadro atrasado.
  if (!mesmo(valor, visto)) {
    setVisto(valor);
    setTexto(escreverNumero(valor, escala));
  }

  const invalido = valor !== null && Number.isNaN(valor);
  const idDica = dica ? `${id}-dica` : undefined;

  return (
    <div className="campo">
      <label htmlFor={id} className={rotuloOculto ? 'sr-only' : 'campo__rotulo'}>
        {rotulo}
      </label>
      <div className="campo__caixa">
        <input
          id={id}
          className="campo__input"
          type="text"
          inputMode={decimal ? 'decimal' : 'numeric'}
          autoComplete="off"
          value={texto}
          placeholder={placeholder}
          aria-invalid={invalido || undefined}
          aria-describedby={idDica}
          onChange={(e) => {
            const t = e.target.value;
            setTexto(t);
            const n = lerNumero(t);
            const v = n === null || Number.isNaN(n) ? n : n / escala;
            setVisto(v);
            aoMudar(v);
          }}
        />
        {sufixo && <span className="campo__sufixo" aria-hidden="true">{sufixo}</span>}
      </div>
      {dica && <p id={idDica} className="campo__dica">{dica}</p>}
    </div>
  );
}
