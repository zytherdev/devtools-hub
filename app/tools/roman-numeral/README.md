# Conversor de algarismos romanos

**Status:** Implementado

Converte números inteiros de 1 a 3999 entre algarismos arábicos e romanos.

## Modos

De número arábico para romano (modo padrão):

~~~json
{"mode":"arabic-to-roman"}
~~~

De romano para arábico:

~~~json
{"mode":"roman-to-arabic"}
~~~

A entrada romana aceita `I`, `V`, `X`, `L`, `C`, `D`, `M` em maiúsculas ou minúsculas, mas exige notação canônica (por exemplo, `IV`, não `IIII`). Zero, números negativos, frações e valores acima de 3999 não são representáveis neste conversor.

## Limites e privacidade

Entrada de até 100 caracteres. A conversão é determinística e totalmente local.

## Arquivos de contribuição

- [definition.ts](definition.ts): metadados, exemplo e modo padrão.
- [logic.ts](logic.ts): codificação e validação da forma canônica.
- [Tool.tsx](Tool.tsx): interface compartilhada `UniversalTool`.
- Testes: [tests/tools/roman-numeral.test.cjs](../../../tests/tools/roman-numeral.test.cjs).
