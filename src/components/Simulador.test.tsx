import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { simulacaoExemplo } from '../domain/exemplo';
import { Simulador } from './Simulador';

/** Exemplo fictício com prazo de 20 dias úteis (09/11 a 04/12/2026). */
function inicial() {
  const s = simulacaoExemplo(new Date(2026, 10, 9));
  s.prazo.fim = '2026-12-04';
  return s;
}

const cartao = (nome: string) => screen.getByRole('article', { name: nome });
const porDia = (nome: string) => cartao(nome).querySelector('.resultado__numero')!.textContent;

describe('Simulador', () => {
  afterEach(cleanup);

  it('mostra os três cenários e o exemplo à mão no realista', () => {
    render(<Simulador inicial={inicial()} />);
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(porDia('Realista')).toBe('10');
    expect(within(cartao('Realista')).getByText('Viável')).toBeTruthy();
    // Funil de trás para frente no cartão
    const funil = within(cartao('Realista')).getByRole('list', { name: '' });
    expect(funil.textContent).toContain('Contatos200');
  });

  it('sem data final, pede o prazo e não inventa contatos por dia', () => {
    render(<Simulador inicial={simulacaoExemplo(new Date(2026, 10, 9))} />);
    expect(porDia('Realista')).toBe('—');
    expect(within(cartao('Realista')).getByText(/Falta a data de início ou a data final/)).toBeTruthy();
  });

  it('recalcula ao mudar a meta e aceita vírgula na taxa', () => {
    render(<Simulador inicial={inicial()} />);
    fireEvent.change(screen.getByLabelText('Meta de matrículas'), { target: { value: '20' } });
    expect(porDia('Realista')).toBe('20');
    const taxa = screen.getByLabelText('Taxa de Agendamento no cenário Realista, em porcentagem');
    expect((taxa as HTMLInputElement).value).toBe('40');
    fireEvent.change(taxa, { target: { value: '12,5' } });
    // 20÷0,25=80; 80÷0,5=160; 160÷0,125=1280 em 20 dias = 64
    expect(porDia('Realista')).toBe('64');
  });

  it('texto inválido marca o campo e o cenário como inviável', () => {
    render(<Simulador inicial={inicial()} />);
    const meta = screen.getByLabelText('Meta de matrículas');
    fireEvent.change(meta, { target: { value: 'abc' } });
    expect(meta.getAttribute('aria-invalid')).toBe('true');
    expect(within(cartao('Realista')).getAllByText('Inviável').length).toBeGreaterThan(0);
  });

  it('adiciona etapa antes da meta, com taxas vazias, e remove', () => {
    render(<Simulador inicial={inicial()} />);
    fireEvent.click(screen.getByRole('button', { name: /Adicionar etapa/ }));
    const nomes = screen.getAllByLabelText(/Nome da etapa/).map((i) => (i as HTMLInputElement).value);
    expect(nomes).toEqual(['Agendamento', 'Comparecimento', 'Nova etapa', 'Matrícula']);
    expect(within(cartao('Realista')).getByText(/Falta a taxa da etapa "Nova etapa"/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Remover a etapa Nova etapa' }));
    expect(screen.getAllByLabelText(/Nome da etapa/)).toHaveLength(3);
    expect(porDia('Realista')).toBe('10');
  });

  it('capacidade abaixo do necessário deixa o cenário inviável', () => {
    render(<Simulador inicial={inicial()} />);
    fireEvent.change(screen.getByLabelText('Capacidade por dia (opcional)'), { target: { value: '15' } });
    expect(within(cartao('Conservador')).getByText(/acima da capacidade de 15/)).toBeTruthy();
    expect(within(cartao('Realista')).getByText('Viável')).toBeTruthy();
  });

  it('não deixa remover a última etapa', () => {
    render(<Simulador inicial={inicial()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remover a etapa Agendamento' }));
    fireEvent.click(screen.getByRole('button', { name: 'Remover a etapa Comparecimento' }));
    expect((screen.getByRole('button', { name: 'Remover a etapa Matrícula' }) as HTMLButtonElement).disabled).toBe(true);
  });
});
