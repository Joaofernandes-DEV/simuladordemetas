import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from './App';

describe('App (base)', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });
  afterEach(cleanup);

  it('mostra o aviso de dados fictícios', () => {
    render(<App />);
    expect(screen.getByRole('note').textContent).toContain('Dados fictícios, ajuste para a sua realidade.');
  });

  it('identifica o produto como demonstração', () => {
    render(<App />);
    expect(screen.getByText('Demonstração')).toBeTruthy();
  });

  it('tem link para pular para o conteúdo', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: 'Pular para o conteúdo' }).getAttribute('href')).toBe('#conteudo');
  });

  it('todo campo e botão tem nome acessível', () => {
    const { container } = render(<App />);
    const campos = container.querySelectorAll<HTMLElement>('input, select, button');
    expect(campos.length).toBeGreaterThan(20);
    for (const el of campos) {
      const id = el.getAttribute('id');
      const rotulo = (id && container.querySelector(`label[for="${id}"]`)?.textContent) || el.getAttribute('aria-label') || el.textContent;
      expect(rotulo?.trim(), el.outerHTML.slice(0, 80)).toBeTruthy();
    }
  });

  it('tem um único h1 e títulos de seção em ordem', () => {
    const { container } = render(<App />);
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    const niveis = [...container.querySelectorAll('h1, h2, h3, h4')].map((h) => Number(h.tagName[1]));
    niveis.forEach((n, i) => {
      if (i > 0) expect(n - niveis[i - 1]!).toBeLessThanOrEqual(1);
    });
  });

  it('alterna o tema e guarda a escolha', () => {
    render(<App />);
    expect(document.documentElement.dataset.theme).toBe('dark');
    fireEvent.click(screen.getByRole('button', { name: 'Mudar para o tema claro' }));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('simulador-metas:tema')).toBe('light');
    expect(screen.getByRole('button', { name: 'Mudar para o tema escuro' })).toBeTruthy();
  });
});
