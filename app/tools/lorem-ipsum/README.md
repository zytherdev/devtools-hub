# Lorem Ipsum Generator

**Status:** Implemented

Generates deterministic filler text, with no input, suitable for prototypes, layouts, and mockups.

## Options

~~~json
{"paragraphs":"3","sentencesPerParagraph":"3","wordsPerSentence":"12","format":"paragraphs"}
~~~

- `paragraphs`: from 1 to 50.
- `sentencesPerParagraph`: from 1 to 20.
- `wordsPerSentence`: from 3 to 50.
- `format`: `paragraphs` (separates blocks with a blank line) or `single` (one continuous block).

Each sentence ends with a period. The word list repeats predictably, so do not use the generated text as real editorial content.

## Limits and privacy

The input text must be empty. The result is limited to 500.000 characters. All processing is local and deterministic, with no network calls.

## Contribution files

- [definition.ts](definition.ts): metadata and default options.
- [logic.ts](logic.ts): generation and limit validation.
- [Tool.tsx](Tool.tsx): shared `UniversalTool` interface.
- Tests: [tests/tools/lorem-ipsum.test.cjs](../../../tests/tools/lorem-ipsum.test.cjs).
