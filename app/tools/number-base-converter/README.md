# Conversor de bases numéricas

**Status:** Implementado

Converte inteiros com sinal entre qualquer base de 2 a 36, usando aritmética BigInt para não perder precisão.

## Opções

~~~json
{"fromBase":"10","toBase":"16"}
~~~

`fromBase` e `toBase` são inteiros de 2 a 36. Os dígitos aceitos são `0–9` e `a–z` (sem distinção de caixa na entrada); a saída usa letras minúsculas. O sinal `+` ou `-` é permitido. Prefixos como `0x` não são interpretados: configure explicitamente a base. Frações não são suportadas.

Exemplo: entrada `255` em base 10 produz `ff` em base 16.

## Limites e privacidade

Até 1.000 caracteres de entrada. O cálculo é local, exato e sem rede.

## Arquivos de contribuição

- [definition.ts](definition.ts): metadados e bases padrão.
- [logic.ts](logic.ts): parser de dígitos e conversão BigInt.
- [Tool.tsx](Tool.tsx): interface compartilhada `UniversalTool`.
- Testes: [tests/tools/number-base-converter.test.cjs](../../../tests/tools/number-base-converter.test.cjs).
