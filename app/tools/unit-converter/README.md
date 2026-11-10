# Conversor de unidades

**Status:** Implementado

Conversor local para comprimento, massa, volume, área, tempo e temperatura.

## Opções

Exemplo: para converter `1500` metros em quilômetros, use:

~~~json
{"from":"m","to":"km","precision":"4"}
~~~

Unidades suportadas:

- Comprimento: `mm`, `cm`, `m`, `km`, `in`, `ft`, `yd`, `mi`.
- Massa: `mg`, `g`, `kg`, `oz`, `lb`.
- Volume: `ml`, `l`, `m3`, `gal` (galão líquido dos EUA).
- Área: `mm2`, `cm2`, `m2`, `km2`, `ft2`, `acre`.
- Tempo: `ms`, `s`, `min`, `h`, `day`.
- Temperatura: `C`, `F`, `K`.

`from` e `to` precisam pertencer à mesma dimensão. `precision` controla o arredondamento de 0 a 12 casas decimais (padrão 4). Temperaturas abaixo do zero absoluto são rejeitadas. A saída JSON contém o valor de entrada, unidades, dimensão e resultado arredondado.

## Limites e privacidade

Aceita um número decimal finito de até 100 caracteres. O processamento usa fatores de conversão fixos, sem rede ou cotação externa.

## Arquivos de contribuição

- [definition.ts](definition.ts): metadados, exemplo e opções padrão.
- [logic.ts](logic.ts): tabela de conversão, validação e arredondamento.
- [Tool.tsx](Tool.tsx): interface compartilhada `UniversalTool`.
- Testes: [tests/tools/unit-converter.test.cjs](../../../tests/tools/unit-converter.test.cjs).
