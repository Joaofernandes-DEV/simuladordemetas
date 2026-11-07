import { useEffect } from 'react';

/**
 * Entrada com profundidade (.reveal): alterna `is-in` ao entrar e sair da tela.
 * Sem IntersectionObserver (ambiente de teste, navegador antigo), mostra tudo de uma vez.
 */
export function useReveal(): void {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (typeof IntersectionObserver === 'undefined') {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle('is-in', e.isIntersecting)),
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
