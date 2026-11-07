import { useEffect, useState } from 'react';
import { Simulador } from './components/Simulador';
import { useReveal } from './hooks/useReveal';
import { alternar, aplicarTema, lerTemaSalvo, salvarTema, temaInicial, type Tema } from './theme';

function IconeTema({ tema }: { tema: Tema }) {
  return tema === 'dark' ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
    </svg>
  );
}

export default function App() {
  const [tema, setTema] = useState<Tema>(temaInicial);
  useReveal();

  useEffect(() => aplicarTema(tema), [tema]);

  // Sem escolha salva, acompanha a troca de tema do sistema.
  useEffect(() => {
    const mq = globalThis.matchMedia?.('(prefers-color-scheme: light)');
    if (!mq) return;
    const onChange = (e: MediaQueryListEvent) => {
      if (lerTemaSalvo() === null) setTema(e.matches ? 'light' : 'dark');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const trocarTema = () => {
    const novo = alternar(tema);
    salvarTema(novo);
    setTema(novo);
  };

  return (
    <>
      <a className="skip" href="#conteudo">Pular para o conteúdo</a>

      <header className="top glass">
        <div className="wrap top__inner">
          <span className="top__brand">Simulador de metas</span>
          <span className="pill">Demonstração</span>
          <button
            type="button"
            className="icon-btn"
            onClick={trocarTema}
            aria-label={tema === 'dark' ? 'Mudar para o tema claro' : 'Mudar para o tema escuro'}
          >
            <IconeTema tema={tema} />
          </button>
        </div>
      </header>

      <main id="conteudo" tabIndex={-1} className="wrap principal">
        <section aria-labelledby="titulo" className="abertura">
          <p className="eyebrow reveal">Funil de captação, de trás para frente</p>
          <h1 id="titulo" className="display display--md reveal">Da meta ao contato do dia.</h1>
          <p className="lead reveal">
            Informe a meta de matrículas, o prazo e as taxas de cada etapa. O simulador calcula quantos contatos são necessários por dia.
          </p>
          <div role="note" className="card card--accent reveal aviso-ficticio">
            <strong>Dados fictícios, ajuste para a sua realidade.</strong>{' '}
            Todos os valores iniciais são exemplos inventados para demonstração, não números reais de nenhuma empresa.
          </div>
        </section>

        <Simulador />
      </main>

      <div className="grain" aria-hidden="true" />
    </>
  );
}
