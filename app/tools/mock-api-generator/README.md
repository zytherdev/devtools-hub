# Gerador de API Mock

**Status:** Implementado

Gera fixtures JSON de forma local a partir de um objeto-template JSON. Cada registro recebe uma cópia independente dos dados de entrada e, opcionalmente, um campo raiz com identificador incremental. A ferramenta não cria nem hospeda endpoints HTTP.

## Uso

Cole um objeto JSON simples na entrada. Com o template `{"name":"Ada","role":"engineer"}` e as opções abaixo:

```json
{
  "count": "3",
  "wrapper": "data",
  "idField": "id"
}
```

a saída é:

```json
{
  "data": [
    { "name": "Ada", "role": "engineer", "id": 1 },
    { "name": "Ada", "role": "engineer", "id": 2 },
    { "name": "Ada", "role": "engineer", "id": 3 }
  ],
  "meta": { "count": 3 }
}
```

A saída é formatada com indentação de dois espaços. Se `wrapper` for a string vazia, o resultado será somente um array de registros, sem objeto wrapper nem metadados. O nome `meta` é reservado para os metadados e não pode ser usado como wrapper.

## Opções

Todas as opções são strings e são opcionais:

- `count` (padrão `"3"`): quantidade de registros; deve ser um inteiro de `1` a `100`.
- `wrapper` (padrão `"data"`): propriedade que contém o array; pode ser vazia para retornar o array cru.
- `idField` (padrão `"id"`): propriedade raiz que recebe os números incrementais de `1` até `count`. Se vazia, nenhum identificador é adicionado. Quando essa propriedade já existe no template, o valor do template é substituído nos registros, sem alterar propriedades aninhadas homônimas.

Opções desconhecidas são rejeitadas. `wrapper` e `idField` aceitam até 64 caracteres e não podem conter caracteres de controle.

## Validação e segurança

A entrada precisa ser JSON válido cuja raiz seja um objeto simples; arrays, valores primitivos e `null` não são aceitos como template. O limite de entrada é 100.000 caracteres. O template permite profundidade máxima de 20 níveis, até 10.000 itens por array, até 10.000 propriedades por objeto e 20.000 valores JSON no total. A saída é limitada a 1.000.000 de bytes. Números não finitos e entradas que excedem os limites geram erro.

A implementação usa somente o parser e serializador JSON nativos, não usa `eval` nem faz solicitações de rede. O processamento é local ao ambiente da ferramenta.

## Arquivos

- [definition.ts](definition.ts): metadados, exemplo, opções padrão e extensão de saída.
- [logic.ts](logic.ts): processamento, validação e limites.
- [Tool.tsx](Tool.tsx): integração com `UniversalTool` pelo slug `mock-api-generator`.
- Testes focados: [tests/tools/mock-api-generator.test.cjs](../../../tests/tools/mock-api-generator.test.cjs).
