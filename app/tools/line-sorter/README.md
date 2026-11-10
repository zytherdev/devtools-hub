# Ordenador de linhas

**Status:** Implementado

Ordena texto linha por linha ou inverte a sequência, com opções para remover duplicatas, aparar espaços ou ignorar linhas vazias.

## Opções

~~~json
{"order":"alphabetical-asc","unique":"false","trimWhitespace":"false","ignoreEmpty":"false"}
~~~

- `order`: `alphabetical-asc`, `alphabetical-desc`, `numeric-asc`, `numeric-desc` ou `reverse`.
- `unique`: mantém apenas a primeira ocorrência exata de cada linha.
- `trimWhitespace`: remove espaços no início e fim antes de ordenar.
- `ignoreEmpty`: descarta linhas vazias.

A ordenação alfabética não diferencia caixa para comparação e preserva a ordem original em empates. A numérica compara valores numéricos quando ambos os itens são números válidos e usa comparação textual nos demais casos. Quebras CRLF são normalizadas para LF; uma quebra final não é considerada uma linha extra.

## Limites e privacidade

A entrada é limitada a 1.000.000 de caracteres e 100.000 linhas. Nenhuma chamada de rede é feita.

## Arquivos de contribuição

- [definition.ts](definition.ts): metadados e opções padrão.
- [logic.ts](logic.ts): ordenação e validação de linhas/opções.
- [Tool.tsx](Tool.tsx): interface compartilhada `UniversalTool`.
- Testes: [tests/tools/line-sorter.test.cjs](../../../tests/tools/line-sorter.test.cjs).
