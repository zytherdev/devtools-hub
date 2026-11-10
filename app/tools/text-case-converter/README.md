# Conversor de caixa de texto

**Status:** Implementado

Converta texto localmente entre nove formatos: `camel`, `pascal`, `snake`, `kebab`, `constant`, `title`, `sentence`, `lower` e `upper`. O resultado é texto simples (`.txt`).

## Entrada e opções

A entrada pode ter até 100.000 caracteres. O exemplo carregável é:

~~~text
Olá, Mundo! revisão 2:Texto
~~~

A única opção aceita é `mode`; o padrão é `camel`.

~~~json
{"mode":"camel"}
~~~

| Modo | Resultado de `Olá, Mundo! revisão 2:Texto` | Comportamento |
| --- | --- | --- |
| `camel` | `oláMundoRevisão2Texto` | Primeira palavra em minúsculas; seguintes com inicial maiúscula, sem separador. |
| `pascal` | `OláMundoRevisão2Texto` | Inicial maiúscula em todas as palavras, sem separador. |
| `snake` | `olá_mundo_revisão_2_texto` | Minúsculas separadas por `_`. |
| `kebab` | `olá-mundo-revisão-2-texto` | Minúsculas separadas por `-`. |
| `constant` | `OLÁ_MUNDO_REVISÃO_2_TEXTO` | Maiúsculas separadas por `_`. |
| `title` | `Olá Mundo Revisão 2 Texto` | Inicial maiúscula em cada palavra, separadas por espaço. |
| `sentence` | `Olá, mundo! revisão 2:texto` | Texto completo em minúsculas, exceto a primeira letra em maiúscula; pontuação e espaçamento são preservados. |
| `lower` | `olá, mundo! revisão 2:texto` | Converte a string inteira para minúsculas; preserva pontuação e espaçamento. |
| `upper` | `OLÁ, MUNDO! REVISÃO 2:TEXTO` | Converte a string inteira para maiúsculas; preserva pontuação e espaçamento. |

Nos modos que formam palavras, letras e números Unicode são reconhecidos, inclusive letras acentuadas. Pontuação e espaços separam palavras; também são reconhecidos limites de maiúsculas/minúsculas (por exemplo, `meuTexto` e `HTTPServidor`) e mudanças entre letras e números. A separação por palavras normaliza os delimitadores para o separador do modo escolhido. Entradas sem tokens, como uma string vazia ou só com pontuação, são válidas e não causam erro.

## Validação e privacidade

Entradas acima de 100.000 caracteres, modos inválidos e opções diferentes de `mode` retornam erro de validação. Nenhuma solicitação de rede é feita: o processamento ocorre localmente no navegador.

## Arquivos de contribuição

- [definition.ts](definition.ts): metadados, amostra, modo padrão e extensão de saída.
- [logic.ts](logic.ts): tokenização Unicode, conversões e validação.
- [Tool.tsx](Tool.tsx): interface compartilhada `UniversalTool`.
- Testes: [tests/tools/text-case-converter.test.cjs](../../../tests/tools/text-case-converter.test.cjs).
