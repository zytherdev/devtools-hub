# Comparador de JSON

**Status:** Implementado

Compara duas estruturas JSON localmente e retorna listas de valores adicionados, removidos e alterados.

## Uso

A entrada deve ser um objeto JSON com exatamente as propriedades `before` e `after`:

~~~json
{
  "before": { "name": "Ada", "role": "engineer" },
  "after": { "name": "Grace", "active": true }
}
~~~

A saída é um JSON com arrays `added`, `removed` e `changed`. Cada diferença inclui um caminho JSON Pointer; caracteres `/` e `~` nos nomes de propriedade são escapados conforme a convenção. Arrays do mesmo tamanho são comparados por índice; arrays de tamanhos diferentes aparecem como uma única alteração no caminho do array.

## Limites e privacidade

A entrada é limitada a 1.000.000 de caracteres, a comparação percorre no máximo 100.000 nós e 50 níveis de profundidade, e a saída não pode exceder 4.000.000 de caracteres. Opções não são aceitas. Nenhum dado é enviado pela rede.

## Arquivos de contribuição

- [definition.ts](definition.ts): metadados e exemplo de comparação.
- [logic.ts](logic.ts): parser, comparação estrutural e validações.
- [Tool.tsx](Tool.tsx): interface compartilhada `UniversalTool`.
- Testes: [tests/tools/json-diff.test.cjs](../../../tests/tools/json-diff.test.cjs).
