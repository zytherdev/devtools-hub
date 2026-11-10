# Gerador de expressões cron

**Status:** Implementado

Monta uma expressão cron padrão de cinco campos e apresenta uma explicação campo a campo. O gerador produz a expressão; não executa nem agenda tarefas.

## Campos e opções

A entrada deve ficar vazia. Defina os campos no objeto JSON:

~~~json
{"minute":"0","hour":"9","dayOfMonth":"*","month":"*","dayOfWeek":"1-5"}
~~~

Os campos seguem a ordem cron tradicional: minuto (0–59), hora (0–23), dia do mês (1–31), mês (1–12) e dia da semana (0–7; 0 e 7 representam domingo). Cada campo aceita curingas (`*`), valores numéricos, listas separadas por vírgula, intervalos (`1-5`) e passos (`*/15`, `1-10/2`). Nomes de mês/dia, macros especiais como `@daily` e extensões específicas de provedores não são aceitos.

Quando dia do mês e dia da semana estão ambos restritos, a semântica cron tradicional combina os campos com OR; a explicação da saída destaca esse comportamento.

## Privacidade e limites

O processamento é local e determinístico: nenhuma chamada de rede é feita. Cada campo é limitado a 128 caracteres e os valores são validados contra seus intervalos.

## Arquivos de contribuição

- [definition.ts](definition.ts): metadados e campos padrão.
- [logic.ts](logic.ts): validação sintática e explicação do cron.
- [Tool.tsx](Tool.tsx): interface compartilhada `UniversalTool`.
- Testes: [tests/tools/cron-generator.test.cjs](../../../tests/tools/cron-generator.test.cjs).
