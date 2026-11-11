# Slug Generator

**Status:** Implemented

Transforms text into a compact URL slug. Normalization removes combining diacritical marks, preserves Unicode letters and numbers, and replaces sequences of other characters with a separator.

## Options

~~~json
{"separator":"-","maxLength":"80","lowercase":"true"}
~~~

- `separator`: hyphen (`-`) or underscore (`_`).
- `maxLength`: maximum length of 1 to 200 characters; truncation removes any trailing separator.
- `lowercase`: `true` converts to lowercase; `false` preserves the original case.

Example: `Hello, World! Page number 2` results in `hello-world-page-number-2`. No transliteration of non-Latin scripts is performed; Unicode letters are preserved.

## Limits and privacy

Input is limited to 100,000 characters. Processing is local and does not send text to external services.

## Contribution files

- [definition.ts](definition.ts): metadata and default options.
- [logic.ts](logic.ts): Unicode normalization and validation.
- [Tool.tsx](Tool.tsx): shared `UniversalTool` interface.
- Tests: [tests/tools/slug-generator.test.cjs](../../../tests/tools/slug-generator.test.cjs).
