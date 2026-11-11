# Remove Duplicate Lines

**Status:** Implemented

Removes repeated line occurrences while preserving the order of the first occurrence. CRLF and LF line endings are normalized to LF.

## Options

~~~json
{"caseSensitive":"true","trimWhitespace":"false","keepEmpty":"false"}
~~~

- `caseSensitive`: `true` distinguishes uppercase and lowercase; `false` compares in lowercase, preserving the first form found in the output.
- `trimWhitespace`: `true` removes leading/trailing whitespace before comparison and also in the output.
- `keepEmpty`: `true` preserves one occurrence of an empty line; by default, empty lines are discarded.

A final line break is treated as a file terminator, not as an additional empty item. The output consists of unique lines separated by LF.

## Limits and privacy

Input is limited to 1,000,000 characters and 100,000 lines. No content is sent over the network.

## Contribution files

- [definition.ts](definition.ts): metadata and default options.
- [logic.ts](logic.ts): normalization, deduplication, and validation.
- [Tool.tsx](Tool.tsx): shared `UniversalTool` interface.
- Tests: [tests/tools/remove-duplicate-lines.test.cjs](../../../tests/tools/remove-duplicate-lines.test.cjs).
