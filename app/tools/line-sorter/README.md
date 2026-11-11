# Line Sorter

**Status:** Implemented

Sorts text line by line or reverses the sequence, with options to remove duplicates, trim whitespace, or ignore empty lines.

## Options

~~~json
{"order":"alphabetical-asc","unique":"false","trimWhitespace":"false","ignoreEmpty":"false"}
~~~

- `order`: `alphabetical-asc`, `alphabetical-desc`, `numeric-asc`, `numeric-desc`, or `reverse`.
- `unique`: keeps only the first exact occurrence of each line.
- `trimWhitespace`: removes leading and trailing whitespace before sorting.
- `ignoreEmpty`: discards empty lines.

Alphabetical sorting is case-insensitive for comparisons and preserves the original order in ties. Numeric sorting compares numeric values when both items are valid numbers and uses textual comparison in other cases. CRLF line breaks are normalized to LF; a final line break is not considered an extra line.

## Limits and privacy

Input is limited to 1,000,000 characters and 100,000 lines. No network calls are made.

## Contribution files

- [definition.ts](definition.ts): metadata and default options.
- [logic.ts](logic.ts): sorting and validation of lines/options.
- [Tool.tsx](Tool.tsx): shared `UniversalTool` interface.
- Tests: [tests/tools/line-sorter.test.cjs](../../../tests/tools/line-sorter.test.cjs).
