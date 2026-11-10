# Contador de palavras

**Status:** Implementado

Analise um texto localmente e obtenha contagens de palavras, caracteres Unicode, caracteres sem espaços, linhas, parágrafos e frases, além de uma estimativa de tempo de leitura.

## Como usar

Cole o texto no campo de entrada da ferramenta. O resultado é JSON, com os campos nesta ordem estável:

~~~json
{
  "words": 7,
  "characters": 42,
  "charactersWithoutWhitespace": 35,
  "lines": 2,
  "paragraphs": 1,
  "sentences": 2,
  "readingMinutes": 0.035
}
~~~

Os números do exemplo são ilustrativos. A contagem de palavras usa `Intl.Segmenter` com granularidade de palavra e considera somente segmentos `isWordLike`. Os caracteres são agrupamentos de grafemas Unicode (com fallback para pontos de código em ambientes sem suporte). Linhas são separadas por LF, CRLF ou CR; parágrafos são blocos não vazios separados por uma ou mais linhas em branco. Frases são segmentadas por `Intl.Segmenter` quando disponível. O tempo aproximado é calculado a 200 palavras por minuto, em minutos decimais (`words / 200`). Uma entrada vazia resulta em zero em todas as contagens.

## Opções e limites

Não há opções aceitas; qualquer chave fornecida é rejeitada. A entrada deve ser uma string com até 1.000.000 de unidades de código UTF-16. Entradas maiores são rejeitadas.

## Privacidade

Todo o processamento ocorre no navegador, sem solicitações de rede e sem envio do texto para serviços externos.

## Arquivos

- [definition.ts](definition.ts): metadados, estado e extensão JSON.
- [logic.ts](logic.ts): validação e análise local.
- [Tool.tsx](Tool.tsx): interface baseada em `UniversalTool`.
- Testes focados: [word-counter.test.cjs](../../../tests/tools/word-counter.test.cjs).
