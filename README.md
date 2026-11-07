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

## Como o cálculo funciona

O funil é calculado **de trás para frente**, partindo da meta (a última etapa):

1. Para cada etapa, da última para a primeira: `necessário na etapa anterior = ⌈necessário nesta etapa ÷ taxa desta etapa⌉`. A taxa é a porcentagem da etapa anterior que chega a esta (na primeira etapa, a porcentagem dos contatos).
2. O arredondamento é sempre **para cima**, em cada etapa (não existe meia pessoa).
3. `contatos restantes = contatos no total − contatos já feitos` (nunca abaixo de zero).
4. `dias de trabalho = dias entre o início e o fim, os dois incluídos, no modo escolhido (seg–sex, seg–sáb ou corridos) − folgas e feriados`.
5. `contatos por dia = ⌈contatos restantes ÷ dias de trabalho⌉`.

**Exemplo conferido à mão** (valores fictícios): meta de 10 matrículas; 25% dos comparecimentos viram matrícula, 50% dos agendamentos comparecem, 40% dos contatos agendam; prazo de 09/11 a 04/12/2026 em dias úteis (20 dias).
10 ÷ 0,25 = **40** comparecimentos → 40 ÷ 0,5 = **80** agendamentos → 80 ÷ 0,4 = **200** contatos → 200 ÷ 20 = **10 contatos por dia**.

Cada cenário mostra um aviso quando algo falta (**incompleto**) ou não fecha (**inviável**: taxa 0% ou acima de 100%, datas trocadas, mais folgas que dias, ou contatos por dia acima da capacidade informada).

## Acessibilidade

Teclado completo, foco visível, contraste AA medido nos dois temas, rótulos em todos os campos, avisos anunciados para leitor de tela, alvos de toque de 2,75rem, layout de 360 px a 1920 px, e respeito a "reduzir movimento", "reduzir transparência" e "mais contraste".

## Salvar e abrir

- **Exportar JSON:** guarda a simulação inteira (meta, prazo, etapas e taxas dos três cenários).
- **Exportar CSV:** formato do Excel brasileiro (`;` e vírgula decimal, taxas em %). Abre com duplo clique.
- **Importar arquivo:** aceita o JSON ou o CSV exportados (inclusive o CSV salvo de novo pelo Excel). Arquivo inválido não altera nada.

## Privacidade

Nenhum dado pessoal de lead (nome, telefone, e-mail) entra no código, nos testes ou no histórico. Os dados ficam só no navegador e saem por exportação em JSON ou CSV, direto para o computador de quem usa: nada é enviado para servidor.

## Estado

Em construção. Veja o `LOG.md` para o histórico.
