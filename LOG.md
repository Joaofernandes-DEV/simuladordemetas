# LOG — diário de bordo

Tudo o que muda no projeto entra aqui, no mesmo commit ou PR da mudança. Horários em Brasília (AAAA-MM-DD HH:MM). Entradas mais novas no topo.

## 2026-11-07 10:58 — E2: tela do simulador

**Feito**
- Painel "Meta e prazo": meta, início (hoje), fim (vazio de propósito), modo de contagem, folgas, contatos já feitos e capacidade diária (opcionais).
- Painel "Funil por cenário": uma linha por etapa, uma coluna por cenário; nome editável; adicionar (entra antes da meta, com taxas vazias) e remover (nunca a última). Taxas em %, aceitando vírgula.
- Três cartões lado a lado (empilhados no celular): contatos por dia em destaque, total, restantes, dias, o funil de trás para frente e os avisos (incompleto, inviável em laranja, observação em azul).
- Valores iniciais fictícios em `src/domain/exemplo.ts` (decididos na E1).
- Domínio: texto que não é número agora vira aviso de inválido, não de "falta"; funções puras de edição em `editar.ts`; leitura de números em pt-BR em `numero.ts`.
- Acessibilidade: rótulos em todos os campos (taxas com rótulo completo para leitor de tela), `aria-invalid`, foco vai para a etapa nova ou vizinha ao adicionar ou remover, resumo dos cenários anunciado quando a digitação para.
- Laranja de aviso escurece para `#b25000` no tema claro (AA).

**Verificado**
- `npm run build` e 54 testes passando.
- Chrome, 1482 px: prazo de 07/11 a 04/12/2026 (seg–sex, 20 dias) → conservador 21, realista 10, otimista 6 por dia.
- 360 px (iframe na própria página): sem rolagem lateral, todos os alvos com pelo menos 44 px, funil em três colunas por etapa, tema escuro com cartão inviável (capacidade 15).

**Não testado ainda**
- Celular real, leitor de tela real (NVDA ou TalkBack) e Safari.

## 2026-11-07 10:55 — E1: funções puras do funil

**Feito** (em `src/domain/`, sem React, sem data do sistema, sem armazenamento)
- `types.ts`: etapas compartilhadas por todos os cenários; cada cenário tem só as suas taxas (0 a 1, `null` = vazia).
- `funil.ts`: funil de trás para frente, com arredondamento para cima em cada etapa e proteção contra ruído de ponto flutuante (57 ÷ 0,57 dá 100, não 101); validação das taxas (vazia = incompleto; 0% ou acima de 100% = inviável).
- `prazo.ts`: dias entre início e fim, os dois incluídos, nos modos seg–sex, seg–sáb e corridos, em UTC.
- `simular.ts`: junta tudo por cenário: total de contatos, restantes (menos os já feitos), dias (menos folgas), contatos por dia e avisos (incompleto, inviável e informativo). Capacidade diária opcional gera aviso de inviável.

**Verificado**
- 35 testes passando. Exemplo conferido à mão: meta 10; 25% (comparecimento → matrícula), 50% (agendamento → comparecimento) e 40% (contato → agendamento); 09/11 a 04/12/2026 em seg–sex = 20 dias → 40 → 80 → 200 contatos → 10 por dia.
- Preview do PR #1 na Vercel: check verde, CSP e cabeçalhos servidos, Inter carregando.

**Não testado ainda**
- Nada de tela nesta etapa (a E2 liga as funções à interface).

**Decidido para a E2** (o João deixou a escolha comigo, opção "a")
- Valores iniciais fictícios, marcados na tela: meta 10; etapas Agendamento, Comparecimento e Matrícula; taxas conservador 30% / 40% / 20%, realista 40% / 50% / 25% (o exemplo à mão) e otimista 50% / 60% / 30%. São marcadores de lugar, não referências de mercado.

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
