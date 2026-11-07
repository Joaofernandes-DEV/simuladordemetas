# LOG — diário de bordo

Tudo o que muda no projeto entra aqui, no mesmo commit ou PR da mudança. Horários em Brasília (AAAA-MM-DD HH:MM). Entradas mais novas no topo.

## 2026-11-07 10:50 — Vercel ligada

- Projeto `simuladordemetas` criado na Vercel (autorizado pelo João), ligado ao GitHub: produção na `main`, preview em cada PR.
- Primeiro deploy de produção (só o README da `main`) ficou pronto em https://simuladordemetas.vercel.app.
- O preview da `feat/base` nasce com este commit.

## 2026-11-07 10:41 — E0 aprovada

- O João aprovou a tela da E0.
- Commits um por arquivo na `feat/base`, um único push e PR em rascunho.
- Próxima etapa: E1 (funções puras do funil, com testes), aguardando o "ok".

## 2026-11-07 10:26 — E0: base do projeto

**Feito**
- README inicial enviado direto à `main` (autorizado pelo João: repositório estava vazio).
- Branch `feat/base`: Vite 8 + React 19 + TypeScript 7 estrito + Tailwind 4 + Vitest 5 (jsdom + Testing Library).
- Tokens e componentes do portfólio em `src/styles/app.css`: paleta, fonte (SF Pro / Inter), `clamp`, tracking, vidro, grão, pílula, cartões com `color-mix`, foco azul, `.reveal`.
- Inter 400/500/600/700 dentro do repositório (`public/fonts/`, licença OFL junto).
- Tema automático pelo sistema + botão claro/escuro, salvo no navegador (com `try/catch`).
- No tema claro, o azul de texto vira `#0066cc` para passar no contraste AA; o `#2997ff` continua no foco e nos destaques.
- `vercel.json` com a CSP estrita e os cabeçalhos de segurança do portfólio.
- Tela inicial: cabeçalho de vidro, selo "Demonstração", título e aviso de dados fictícios.
- Decisões do plano: 3 cenários (conservador, realista, otimista); etapas do funil adicionáveis e removíveis; prazo por datas com modo de contagem (seg–sex, seg–sáb, corridos) menos folgas e feriados digitados; capacidade diária opcional; sem animação de fundo.

**Verificado**
- `npm run build` e `npm test` (7 testes) passando.

**Não testado ainda**
- Celular real e leitor de tela.
- Deploy na Vercel (projeto ainda não ligado).
