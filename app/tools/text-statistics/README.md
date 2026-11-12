# Text Statistics

**Status:** Implemented

Count words, characters, lines, paragraphs, and optional estimated reading time.

## Availability

Available at `/text-statistics`. The text is analyzed locally in the browser; the tool does not transmit or store user text.

## Example input

The sample in [definition.ts](definition.ts) can be loaded from the tool page:

~~~text
Text statistics are calculated locally.

Unicode-aware counts include words, grapheme clusters, lines, and paragraphs.
~~~

## Options and limits

The defaults are:

~~~json
{"includeReadingTime":"true","wordsPerMinute":"200"}
~~~

`includeReadingTime` must be the string `"true"` or `"false"`. `wordsPerMinute` must be a decimal integer string from 1 to 1,000; it is used only when reading time is included. Unknown options and non-string values are rejected. The input limit is 1,000,000 UTF-16 code units, including line breaks. Empty input is valid and produces zero words, characters, lines, paragraphs, and (when enabled) reading-time minutes.

## Counting rules

- **Words:** In runtimes with `Intl.Segmenter`, count segments marked word-like at Unicode word boundaries; punctuation and whitespace do not count. Older runtimes use a Unicode letter/number token fallback with combining marks and internal apostrophes or hyphens.
- **Characters:** Count Unicode grapheme clusters, including whitespace. A joined emoji sequence or a base letter with combining marks counts as one cluster. The second character metric excludes clusters consisting entirely of whitespace. On older runtimes without `Intl.Segmenter`, the fallback counts Unicode code points instead.
- **Lines:** CRLF, LF, CR, U+2028, and U+2029 are line breaks. Non-empty text has one more line than the number of line breaks, including a final empty line after a trailing break. Empty text has zero lines.
- **Paragraphs:** A paragraph is a maximal group of one or more lines that contain non-whitespace characters; blank or whitespace-only lines separate paragraphs.
- **Reading time:** When enabled, estimate `ceil(words / wordsPerMinute)` minutes. Zero words yields zero minutes.

Processing is bounded to the stated input length and happens in memory in the browser. The tool does not write user text to storage or send it to a server.

## Contribution files

- [definition.ts](definition.ts): metadata, category, status, sample input, defaults, and output extension.
- [logic.ts](logic.ts): bounded Unicode statistics, validation, and the `run(input, options)` entry point.
- [Tool.tsx](Tool.tsx): local UI connected through the shared component registry.
- Focused tests: [tests/tools/text-statistics.test.cjs](../../../tests/tools/text-statistics.test.cjs).
