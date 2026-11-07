# Simulador de metas

Demonstração de uma ferramenta que parte de uma meta de matrículas e calcula, de trás para frente pelo funil de captação, quantos contatos são necessários por dia.

> **Dados fictícios.** Todos os valores iniciais (meta, prazo, taxas por etapa) são exemplos inventados para demonstração. Ajuste para a sua realidade.

Projeto pessoal de João Vitor Fernandes. Não é um produto de nenhuma empresa nem foi aprovado por nenhuma delas.

## Como rodar

```powershell
cd C:\Users\joaov\Documents\Projetos\SimuladorMetas
npm ci
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente http://localhost:5173).

| Script | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | checa os tipos e gera `dist/` |
| `npm test` | roda os testes (Vitest) |
| `npm run typecheck` | só checa os tipos |

## Stack

Vite + React + TypeScript (estrito) + Tailwind 4, testes com Vitest. Sem backend e sem serviços externos: fonte Inter dentro do repositório, CSP estrita em `vercel.json`. Hospedagem na Vercel.

## Salvar e abrir

- **Exportar JSON:** guarda a simulação inteira (meta, prazo, etapas e taxas dos três cenários).
- **Exportar CSV:** formato do Excel brasileiro (`;` e vírgula decimal, taxas em %). Abre com duplo clique.
- **Importar arquivo:** aceita o JSON ou o CSV exportados (inclusive o CSV salvo de novo pelo Excel). Arquivo inválido não altera nada.

## Privacidade

Nenhum dado pessoal de lead (nome, telefone, e-mail) entra no código, nos testes ou no histórico. Os dados ficam só no navegador e saem por exportação em JSON ou CSV, direto para o computador de quem usa: nada é enviado para servidor.

## Estado

Em construção. Veja o `LOG.md` para o histórico.
