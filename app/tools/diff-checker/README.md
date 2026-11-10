# Verificador de diferenças

**Status:** Implementado

Compare dois textos por linha. O resultado é um diff textual determinístico: linhas comuns recebem o prefixo de espaço, removidas recebem `-` e adicionadas recebem `+`. As duas primeiras linhas identificam os lados como `--- Original` e `+++ Atualizado`.

## Entrada de exemplo

Os textos devem ser separados por exatamente uma linha contendo o separador padrão `---8<---`:

~~~text
constante=1
---8<---
constante=2
~~~

O resultado para o exemplo é:

~~~diff
--- Original
+++ Atualizado
-constante=1
+constante=2
~~~

A linha separadora precisa conter somente o marcador. Ausência ou repetição do marcador é inválida. Quebras de linha LF e CRLF são aceitas; uma quebra final não é tratada como uma linha vazia adicional.

## Opções

Por padrão, `defaultOptions` é `{}` e o separador é `---8<---`. Para usar outro marcador, informe a única opção aceita, por exemplo:

~~~json
{"separator":"=== COMPARAR ==="}
~~~

O separador personalizado deve ser uma string não vazia, com até 80 caracteres e sem caracteres de controle. Qualquer outra opção é rejeitada.

## Limites e validação

- Entrada completa, incluindo marcador e quebras de linha: até 200.000 caracteres.
- Cada texto: até 2.000 linhas.
- Saída: até 500.000 caracteres.
- A entrada deve conter exatamente uma linha separadora reconhecida.

A comparação usa subsequência comum mais longa (LCS) por linhas. Em casos de empate, as remoções são emitidas antes das adições, garantindo resultado estável. Todo processamento é local; a ferramenta não precisa de rede nem de dependências adicionais.

## Arquivos

- [definition.ts](definition.ts): metadados, estado implementado e entrada de exemplo.
- [logic.ts](logic.ts): validação, limites e geração do diff.
- [Tool.tsx](Tool.tsx): interface conectada ao `UniversalTool`.
- [Teste focado](../../../tests/tools/diff-checker.test.cjs): cobertura de comportamento, limites e entradas inválidas.
