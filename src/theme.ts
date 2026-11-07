export type Tema = 'light' | 'dark';

const CHAVE = 'simulador-metas:tema';

function armazenamento(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

/** Lê a escolha salva; navegação privada ou armazenamento bloqueado devolvem null. */
export function lerTemaSalvo(storage: Pick<Storage, 'getItem'> | undefined = armazenamento()): Tema | null {
  try {
    const v = storage?.getItem(CHAVE);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

export function salvarTema(tema: Tema, storage: Pick<Storage, 'setItem'> | undefined = armazenamento()): void {
  try {
    storage?.setItem(CHAVE, tema);
  } catch {
    // Sem armazenamento: o tema vale só nesta visita.
  }
}

export function temaDoSistema(): Tema {
  return globalThis.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

/** Escolha salva vence; sem ela, segue o sistema. */
export function temaInicial(): Tema {
  return lerTemaSalvo() ?? temaDoSistema();
}

export function aplicarTema(tema: Tema, root: HTMLElement = document.documentElement): void {
  root.dataset.theme = tema;
}

export const alternar = (t: Tema): Tema => (t === 'dark' ? 'light' : 'dark');
