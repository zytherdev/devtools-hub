# Gerador de UUID

**Status:** Implementado

Gera um ou mais identificadores UUID v4 com segurança criptográfica. A ferramenta emite um UUID em letras minúsculas por linha e realiza a geração localmente no navegador ou em um ambiente compatível.

## Opções

A ferramenta aceita um objeto JSON de opções:

~~~json
{ "version": "4", "count": "1" }
~~~

- `version`: deve ser a string `"4"` (padrão: `"4"`).
- `count`: string de número inteiro entre `"1"` e `"1000"` (padrão: `"1"`).

O texto de entrada não é usado; deixe a área de entrada vazia. UUID v5 e outras versões não são compatíveis. As opções `namespace` e `name` são rejeitadas, pois se aplicam à versão v5, e não são ignoradas silenciosamente. Quantidades acima de 1000, chaves de opção inválidas e opções malformadas geram erro.

## Segurança e privacidade

Os bytes do UUID v4 são obtidos exclusivamente pela API `Web Crypto getRandomValues` do ambiente; em seguida, os bits de versão e variante padronizados são definidos. Se o Web Crypto não estiver disponível ou falhar, a geração é interrompida com um erro; não há alternativa baseada em `Math.random`. Nenhuma entrada ou dado gerado é enviado pela rede. A ferramenta não faz solicitações externas.

UUIDs foram projetados para oferecer alta resistência a colisões, não para funcionar como segredos de autenticação ou substituir tokens de controle de acesso.

## Arquivos de contribuição

- [definition.ts](definition.ts): metadados do catálogo e opções padrão.
- [logic.ts](logic.ts): geração limitada de UUID v4 e validação das opções.
- [Tool.tsx](Tool.tsx): entrada de interface compartilhada `UniversalTool`.
- Testes específicos: [tests/tools/uuid-generator.test.cjs](../../../tests/tools/uuid-generator.test.cjs).
