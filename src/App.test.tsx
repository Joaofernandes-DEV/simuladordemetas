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

  it('alterna o tema e guarda a escolha', () => {
    render(<App />);
    expect(document.documentElement.dataset.theme).toBe('dark');
    fireEvent.click(screen.getByRole('button', { name: 'Mudar para o tema claro' }));
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem('simulador-metas:tema')).toBe('light');
    expect(screen.getByRole('button', { name: 'Mudar para o tema escuro' })).toBeTruthy();
  });
});
