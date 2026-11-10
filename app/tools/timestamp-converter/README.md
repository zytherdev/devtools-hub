# Conversor de timestamp

**Status:** Implementado

Converte datas ISO-8601 em timestamps Unix e timestamps Unix em datas UTC, sem depender do fuso local da máquina.

## Opções

ISO para epoch:

~~~json
{"mode":"iso-to-epoch"}
~~~

A entrada deve ter fuso explícito, por exemplo `2026-01-01T12:30:00-03:00`. A fração de segundo aceita de 1 a 3 dígitos. A saída JSON inclui a data UTC normalizada, segundos Unix e milissegundos Unix.

Epoch para ISO:

~~~json
{"mode":"epoch-to-iso","unit":"seconds"}
~~~

`unit` pode ser `seconds` ou `milliseconds`. Essa direção aceita apenas timestamp inteiro. A saída sempre informa ISO UTC, segundos e milissegundos. O intervalo segue os limites de `Date` do JavaScript; datas inexistentes e offsets acima de ±14:00 são rejeitados.

## Limites e privacidade

Entrada de 1 a 100 caracteres. O conversor não consulta relógio ou serviço externo; o resultado depende apenas do valor informado.

## Arquivos de contribuição

- [definition.ts](definition.ts): metadados, exemplo e modo padrão.
- [logic.ts](logic.ts): parser ISO estrito, validação de calendário e conversão Unix.
- [Tool.tsx](Tool.tsx): interface compartilhada `UniversalTool`.
- Testes: [tests/tools/timestamp-converter.test.cjs](../../../tests/tools/timestamp-converter.test.cjs).
