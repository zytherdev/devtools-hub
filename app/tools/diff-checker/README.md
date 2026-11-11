# Difference Checker

**Status:** Implemented

Compare two texts line by line. The result is a deterministic text diff: common lines receive the space prefix, removed lines receive `-`, and added lines receive `+`. The first two lines identify the sides as `--- Original` and `+++ Updated`.

## Example input

The texts must be separated by exactly one line containing the default separator `---8<---`:

~~~text
constante=1
---8<---
constante=2
~~~

The result for the example is:

~~~diff
--- Original
+++ Updated
-constant=1
+constant=2
~~~

The separator line must contain only the marker. Missing or repeated markers are invalid. LF and CRLF line breaks are accepted; a trailing line break is not treated as an additional empty line.

## Options

By default, `defaultOptions` is `{}` and the separator is `---8<---`. To use another marker, provide the only accepted option, for example:

~~~json
{"separator":"=== COMPARAR ==="}
~~~

The custom separator must be a non-empty string, up to 80 characters long, with no control characters. Any other option is rejected.

## Limits and validation

- Complete input, including the marker and line breaks: up to 200,000 characters.
- Each text: up to 2,000 lines.
- Output: up to 500,000 characters.
- The input must contain exactly one recognized separator line.

The comparison uses the longest common subsequence (LCS) by lines. In tie cases, removals are emitted before additions, ensuring a stable result. All processing is local; the tool does not need a network connection or additional dependencies.

## Files

- [definition.ts](definition.ts): metadata, implemented status, and example input.
- [logic.ts](logic.ts): validation, limits, and diff generation.
- [Tool.tsx](Tool.tsx): interface connected to `UniversalTool`.
- [Focused test](../../../tests/tools/diff-checker.test.cjs): coverage of behavior, limits, and invalid inputs.
