# Conversor de tamanho de arquivo

**Status:** Implementado

Converte valores entre bytes, unidades decimais e unidades binárias.

## Opções

~~~json
{"from":"B","to":"KiB","precision":"3"}
~~~

Unidades decimais usam potências de 1.000: `B`, `KB`, `MB`, `GB`, `TB`, `PB`. Unidades binárias usam potências de 1.024: `KiB`, `MiB`, `GiB`, `TiB`, `PiB`, `EiB`. `precision` define o arredondamento entre 0 e 12 casas decimais (padrão 3). A saída JSON apresenta o valor de entrada, as unidades e o resultado.

Este cálculo converte unidades matemáticas; não inspeciona arquivos nem estima espaço efetivamente ocupado por sistemas de arquivos.

## Limites e privacidade

Aceita número finito não negativo com até 100 caracteres. Não há leitura de arquivos ou tráfego de rede.

## Arquivos de contribuição

- [definition.ts](definition.ts): metadados e opções padrão.
- [logic.ts](logic.ts): fatores decimais/binários e validação.
- [Tool.tsx](Tool.tsx): interface compartilhada `UniversalTool`.
- Testes: [tests/tools/file-size-converter.test.cjs](../../../tests/tools/file-size-converter.test.cjs).
