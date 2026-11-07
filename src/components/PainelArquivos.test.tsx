import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { paraCSV, paraJSON } from '../domain/arquivo';
import { simulacaoExemplo } from '../domain/exemplo';
import { Simulador } from './Simulador';

/** Valores de teste, fictícios. */
function inicial() {
  const s = simulacaoExemplo(new Date(2026, 10, 9));
  s.prazo.fim = '2026-12-04';
  return s;
}

const porDia = (nome: string) =>
  screen.getByRole('article', { name: nome }).querySelector('.resultado__numero')!.textContent;
const entradaArquivo = () => screen.getByLabelText('Escolher arquivo JSON ou CSV para importar');

describe('Salvar e abrir', () => {
  const blobs: Blob[] = [];
  const nomes: string[] = [];

  beforeEach(() => {
    blobs.length = 0;
    nomes.length = 0;
    URL.createObjectURL = vi.fn((b: Blob) => {
      blobs.push(b);
      return 'blob:teste';
    });
    URL.revokeObjectURL = vi.fn();
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      nomes.push(this.download);
    });
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('exporta JSON e CSV com a simulação atual', async () => {
    render(<Simulador inicial={inicial()} />);
    fireEvent.change(screen.getByLabelText('Meta de matrículas'), { target: { value: '30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Exportar JSON' }));
    fireEvent.click(screen.getByRole('button', { name: 'Exportar CSV' }));

    expect(nomes[0]).toMatch(/^simulador-de-metas-\d{4}-\d{2}-\d{2}\.json$/);
    expect(nomes[1]).toMatch(/\.csv$/);
    expect(JSON.parse(await blobs[0]!.text()).simulacao.meta).toBe(30);
    expect(await blobs[1]!.text()).toContain('meta;30');
    expect(screen.getByRole('status').textContent).toContain('fica só no seu computador');
  });

  it('importa CSV e substitui a tela', async () => {
    const outra = inicial();
    outra.meta = 20;
    render(<Simulador inicial={inicial()} />);
    expect(porDia('Realista')).toBe('10');

    fireEvent.change(entradaArquivo(), { target: { files: [new File([paraCSV(outra)], 'minha.csv', { type: 'text/csv' })] } });

    expect((await screen.findByRole('status')).textContent).toContain('importada de minha.csv');
    expect(porDia('Realista')).toBe('20');
    expect((screen.getByLabelText('Meta de matrículas') as HTMLInputElement).value).toBe('20');
  });

  it('importa JSON com etapa a mais', async () => {
    const outra = inicial();
    outra.etapas.splice(2, 0, { id: 'visita', nome: 'Visita' });
    for (const c of outra.cenarios) c.taxas.visita = 1;
    render(<Simulador inicial={inicial()} />);
    fireEvent.change(entradaArquivo(), { target: { files: [new File([paraJSON(outra)], 'a.json')] } });
    await screen.findByText(/importada de a.json/);
    expect(screen.getAllByLabelText(/Nome da etapa/)).toHaveLength(4);
    expect(within(screen.getByRole('article', { name: 'Realista' })).getByText('Visita')).toBeTruthy();
  });

  it('arquivo inválido mostra erro e não altera nada', async () => {
    render(<Simulador inicial={inicial()} />);
    fireEvent.change(entradaArquivo(), { target: { files: [new File(['{ quebrado'], 'x.json')] } });
    const alerta = await screen.findByRole('alert');
    expect(alerta.textContent).toBe('O arquivo JSON está corrompido ou não é JSON. Nada foi alterado.');
    expect(porDia('Realista')).toBe('10');
  });
});
