# Remover linhas duplicadas

**Status:** Implementado

Remove ocorrências repetidas de linhas, preservando a ordem da primeira ocorrência. Quebras CRLF e LF são normalizadas para LF.

## Opções

~~~json
{"caseSensitive":"true","trimWhitespace":"false","keepEmpty":"false"}
~~~

- `caseSensitive`: `true` diferencia maiúsculas/minúsculas; `false` compara em minúsculas, preservando a primeira forma encontrada na saída.
- `trimWhitespace`: `true` remove espaços no início/fim antes da comparação e também na saída.
- `keepEmpty`: `true` preserva uma ocorrência de linha vazia; por padrão linhas vazias são descartadas.

Uma quebra de linha final é tratada como terminador do arquivo, não como um item vazio adicional. A saída é composta por linhas únicas separadas por LF.

## Limites e privacidade

A entrada é limitada a 1.000.000 de caracteres e 100.000 linhas. Nenhum conteúdo é enviado pela rede.

## Arquivos de contribuição

- [definition.ts](definition.ts): metadados e opções padrão.
- [logic.ts](logic.ts): normalização, deduplicação e validação.
- [Tool.tsx](Tool.tsx): interface compartilhada `UniversalTool`.
- Testes: [tests/tools/remove-duplicate-lines.test.cjs](../../../tests/tools/remove-duplicate-lines.test.cjs).
