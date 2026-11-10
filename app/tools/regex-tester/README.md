# Regex Tester

**Status:** Implemented

Test, replace, and split JavaScript regular expressions. Select a mode and press **Run regex**; results are not recomputed automatically while typing.

## Modes and output

- **Test** highlights matches, reports capture groups, and counts actual matches (including zero-width matches).
- **Replace** applies JavaScript replacement tokens and reports the number of matches actually replaced. Use **Copy result** to copy the transformed text.
- **Split** displays the text segments without inserting capture groups and counts delimiters rather than the resulting parts. Use **Copy result** to copy the displayed segments.
- In **Test**, **Copy matches** copies matched text, one match per line. No file download is provided.

## Limits

Processing runs locally in a disposable browser Web Worker. A run is stopped after 500 ms; catastrophic backtracking can therefore time out without blocking the page. Patterns are limited to 500 characters, test text to 200,000 characters, replacement text to 200,000 characters, and result text to 500,000 characters. Test/replace results are capped at 5,000 matches; split output is capped at 10,001 parts. Replacement and split limits are checked as output is assembled, before oversized output is materialized.

## Example input and defaults

The catalog sample is stored in [definition.ts](definition.ts) and can be loaded from the tool page. The shared `run(input, options)` entry point accepts `pattern`, `flags`, `mode` (`test`, `replace`, or `split`), and `replacement` options; its defaults are an empty pattern, global matching, test mode, and an empty replacement. The page offers these options as interactive controls rather than a JSON panel.

## Processing and privacy

Pattern matching and text transformation happen in the browser; input is not intentionally uploaded. Standard site hosting and asset requests are described in the project privacy page. Review the logic and tests before using sensitive data.

## Contribution files

- [definition.ts](definition.ts): metadata, category, status, sample input, defaults, and output extension.
- [logic.ts](logic.ts): typed run(input, options) entry point, worker execution, and input/output limits.
- [Tool.tsx](Tool.tsx): UI entry connected through [componentRegistry](../componentRegistry.ts).
- lib/: helpers private to this tool, when needed.
- Focused tests: [tests/tools/regex-tester.test.cjs](../../../tests/tools/regex-tester.test.cjs).

Before submitting changes, run npm run check. See [Adding a tool](../../../docs/adding-a-tool.md) and [Architecture](../../../docs/architecture.md).
