# Gerador Lorem Ipsum

**Status:** Implementado

Gera texto de preenchimento determinístico, sem entrada, adequado a protótipos, layouts e mockups.

## Opções

~~~json
{"paragraphs":"3","sentencesPerParagraph":"3","wordsPerSentence":"12","format":"paragraphs"}
~~~

- `paragraphs`: de 1 a 50.
- `sentencesPerParagraph`: de 1 a 20.
- `wordsPerSentence`: de 3 a 50.
- `format`: `paragraphs` (separa blocos com linha em branco) ou `single` (um bloco contínuo).

Cada frase termina com ponto. A lista de palavras se repete de forma previsível, portanto não use o texto gerado como conteúdo editorial real.

## Limites e privacidade

O texto de entrada deve ficar vazio. O resultado é limitado a 500.000 caracteres. Todo o processamento é local e determinístico, sem chamadas de rede.

## Arquivos de contribuição

- [definition.ts](definition.ts): metadados e opções padrão.
- [logic.ts](logic.ts): geração e validação dos limites.
- [Tool.tsx](Tool.tsx): interface compartilhada `UniversalTool`.
- Testes: [tests/tools/lorem-ipsum.test.cjs](../../../tests/tools/lorem-ipsum.test.cjs).
