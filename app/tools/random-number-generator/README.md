# Gerador de números aleatórios

**Status:** Implementado

Gera inteiros criptograficamente seguros dentro de uma faixa configurável, com opção para impedir repetições. Cada resultado aparece em uma linha.

## Opções

A área de entrada deve permanecer vazia. Configure a ferramenta pelo objeto JSON:

~~~json
{"min":"1","max":"100","count":"10","unique":"false"}
~~~

- `min` e `max`: limites inclusivos, que devem ser inteiros seguros do JavaScript; `min` não pode ser maior que `max`.
- `count`: quantidade de resultados entre 1 e 1.000.
- `unique`: `true` para amostragem sem repetição, ou `false` (padrão) para permitir repetições. A quantidade solicitada não pode exceder os valores disponíveis quando `unique` é `true`.

## Segurança e privacidade

Os valores são produzidos com `Web Crypto getRandomValues` e amostragem por rejeição para evitar viés de módulo. Se Web Crypto estiver indisponível ou falhar, a geração é interrompida; não há fallback para `Math.random`. O processamento ocorre localmente, sem rede ou armazenamento pelo aplicativo.

## Limites

A faixa aceita qualquer limite inteiro seguro do JavaScript, e uma execução gera até 1.000 valores. A ferramenta não recebe uma seed nem texto de entrada. Não use números gerados como substitutos para chaves criptográficas ou segredos específicos de protocolo.

## Arquivos de contribuição

- [definition.ts](definition.ts): metadados e valores padrão.
- [logic.ts](logic.ts): validação da faixa e amostragem segura.
- [Tool.tsx](Tool.tsx): interface compartilhada `UniversalTool`.
- Testes: [tests/tools/random-number-generator.test.cjs](../../../tests/tools/random-number-generator.test.cjs).
