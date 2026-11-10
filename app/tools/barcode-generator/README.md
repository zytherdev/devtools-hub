# Gerador de códigos de barras

**Status:** Implementado

Gera códigos de barras como SVG no próprio navegador, usando a biblioteca local `bwip-js`. A saída pode ser pré-visualizada na página e baixada como `.svg`.

## Formatos e opções

Informe o valor na entrada e selecione um formato:

- `code128` (padrão): texto geral, até 256 bytes UTF-8.
- `code39`: texto suportado pela simbologia Code 39.
- `ean13`: 12 ou 13 dígitos.
- `ean8`: 7 ou 8 dígitos.
- `upca`: 11 ou 12 dígitos.
- `itf14`: 13 ou 14 dígitos.

Opções padrão:

~~~json
{"format":"code128","scale":"3","height":"12","includeText":"true"}
~~~

- `scale`: inteiro de 1 a 8.
- `height`: altura em milímetros, de 5 a 40.
- `includeText`: `true` para exibir o conteúdo legível sob as barras ou `false` para ocultá-lo.

A biblioteca valida os caracteres e requisitos de cada simbologia. Check digits e regras de leitura variam por formato; verifique as especificações do seu sistema de estoque/impressão antes de usar em produção.

## Limites e privacidade

A entrada não pode exceder 256 bytes UTF-8 nem conter caracteres de controle ou quebras de linha. O SVG final é limitado a 500.000 caracteres. A codificação é local, sem envio de dados ou consulta a serviços externos.

## Arquivos de contribuição

- [definition.ts](definition.ts): metadados, formato padrão e opções.
- [logic.ts](logic.ts): validação e renderização SVG com `bwip-js`.
- [Tool.tsx](Tool.tsx): interface compartilhada `UniversalTool`.
- Testes: [tests/tools/barcode-generator.test.cjs](../../../tests/tools/barcode-generator.test.cjs).
