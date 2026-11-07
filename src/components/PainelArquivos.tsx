import { useRef, useState } from 'react';
import { LIMITE_BYTES, lerArquivo, nomeArquivo, paraCSV, paraJSON } from '../domain/arquivo';
import { hojeISO } from '../domain/prazo';
import type { Simulacao } from '../domain/types';

type Mensagem = { tipo: 'ok' | 'erro'; texto: string } | null;

/** Baixa um texto como arquivo, sem servidor (Blob local). */
function baixar(texto: string, nome: string, tipo: string): void {
  const url = URL.createObjectURL(new Blob([texto], { type: tipo }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

interface Props {
  s: Simulacao;
  substituir: (s: Simulacao) => void;
}

export function PainelArquivos({ s, substituir }: Props) {
  const entrada = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<Mensagem>(null);

  const exportar = (ext: 'json' | 'csv') => {
    const nome = nomeArquivo(ext, hojeISO());
    if (ext === 'json') baixar(paraJSON(s), nome, 'application/json;charset=utf-8');
    else baixar(paraCSV(s), nome, 'text/csv;charset=utf-8');
    setMsg({ tipo: 'ok', texto: `Arquivo ${nome} gerado. Ele fica só no seu computador.` });
  };

  const importar = async (arquivo: File | undefined) => {
    if (!arquivo) return;
    if (arquivo.size > LIMITE_BYTES) {
      setMsg({ tipo: 'erro', texto: 'O arquivo é grande demais para uma simulação. Nada foi alterado.' });
      return;
    }
    let texto: string;
    try {
      texto = await arquivo.text();
    } catch {
      setMsg({ tipo: 'erro', texto: 'Não consegui ler o arquivo. Nada foi alterado.' });
      return;
    }
    const r = lerArquivo(arquivo.name, texto);
    if (r.ok) {
      substituir(r.simulacao);
      setMsg({ tipo: 'ok', texto: `Simulação importada de ${arquivo.name}.` });
    } else {
      setMsg({ tipo: 'erro', texto: `${r.erro} Nada foi alterado.` });
    }
  };

  return (
    <section aria-labelledby="t-arquivos" className="card painel reveal">
      <h2 id="t-arquivos" className="painel__titulo">Salvar e abrir</h2>
      <p className="campo__dica painel__intro">
        Exporte a simulação para guardar ou comparar depois. O CSV abre direto no Excel. Nada é enviado para servidor:
        os arquivos ficam no seu computador. Não coloque dados pessoais de leads (nome, telefone, e-mail).
      </p>
      <div className="acoes">
        <button type="button" className="btn btn--primary" onClick={() => exportar('json')}>Exportar JSON</button>
        <button type="button" className="btn btn--quiet" onClick={() => exportar('csv')}>Exportar CSV</button>
        <button type="button" className="btn btn--quiet" onClick={() => entrada.current?.click()}>Importar arquivo</button>
        <input
          ref={entrada}
          type="file"
          accept=".json,.csv,application/json,text/csv"
          className="sr-only"
          tabIndex={-1}
          aria-label="Escolher arquivo JSON ou CSV para importar"
          onChange={(e) => {
            void importar(e.target.files?.[0]);
            e.target.value = ''; // permite importar o mesmo arquivo de novo
          }}
        />
      </div>
      <p role={msg?.tipo === 'erro' ? 'alert' : 'status'} className={`mensagem ${msg ? `mensagem--${msg.tipo}` : ''}`}>
        {msg?.texto}
      </p>
    </section>
  );
}
