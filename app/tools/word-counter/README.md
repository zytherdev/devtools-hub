# Word Counter

**Status:** Implemented

Analyze text locally and get counts for words, Unicode characters, characters without whitespace, lines, paragraphs, and sentences, along with an estimated reading time.

## How to use

Paste the text into the tool’s input field. The result is JSON, with fields in this stable order:

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

The numbers in the example are illustrative. Word counting uses `Intl.Segmenter` with word granularity and considers only `isWordLike` segments. Characters are Unicode grapheme clusters (with a fallback to code points in environments without support). Lines are separated by LF, CRLF, or CR; paragraphs are non-empty blocks separated by one or more blank lines. Sentences are segmented by `Intl.Segmenter` when available. The approximate time is calculated at 200 words per minute, in decimal minutes (`words / 200`). Empty input results in zero for all counts.

## Options and limits

No options are accepted; any supplied key is rejected. The input must be a string of up to 1,000,000 UTF-16 code units. Larger inputs are rejected.

## Privacy

All processing takes place in the browser, with no network requests and no text sent to external services.

## Files

- [definition.ts](definition.ts): metadata, state, and JSON extension.
- [logic.ts](logic.ts): validation and local analysis.
- [Tool.tsx](Tool.tsx): interface based on `UniversalTool`.
- Focused tests: [word-counter.test.cjs](../../../tests/tools/word-counter.test.cjs).
