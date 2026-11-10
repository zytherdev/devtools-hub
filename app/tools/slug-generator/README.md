# Gerador de slug

**Status:** Implementado

Transforma texto em um slug compacto para URLs. A normalização remove marcas diacríticas combinantes, mantém letras e números Unicode e troca sequências de outros caracteres por um separador.

## Opções

~~~json
{"separator":"-","maxLength":"80","lowercase":"true"}
~~~

- `separator`: hífen (`-`) ou sublinhado (`_`).
- `maxLength`: tamanho máximo de 1 a 200 caracteres; o corte remove eventual separador final.
- `lowercase`: `true` converte para minúsculas; `false` preserva a caixa original.

Exemplo: `Olá, Mundo! Página número 2` resulta em `ola-mundo-pagina-numero-2`. Não é feita transliteração de scripts não latinos; letras Unicode são mantidas.

## Limites e privacidade

A entrada é limitada a 100.000 caracteres. O processamento é local e não envia texto para serviços externos.

## Arquivos de contribuição

- [definition.ts](definition.ts): metadados e opções padrão.
- [logic.ts](logic.ts): normalização Unicode e validação.
- [Tool.tsx](Tool.tsx): interface compartilhada `UniversalTool`.
- Testes: [tests/tools/slug-generator.test.cjs](../../../tests/tools/slug-generator.test.cjs).
