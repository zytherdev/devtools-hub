# JSON Formatter

**Status:** Implemented

Format, validate, minify, sort, and convert JSON; escape or unescape JSON string contents. Processing is local in the browser.

## Modes and output

| Mode | Behavior | Download extension |
| --- | --- | --- |
| Format | Pretty-prints valid JSON with the selected indentation | `.json` |
| Minify | Removes JSON formatting whitespace | `.json` |
| Validate | Reports JSON validity and returns formatted JSON only when valid | `.json` |
| Sort Keys | Recursively sorts object keys without dropping special keys such as `__proto__` | `.json` |
| To CSV | Converts a non-empty array of objects to quoted, RFC 4180-style CSV | `.csv` |
| To YAML | Serializes JSON values with the installed `yaml` package | `.yaml` |
| Escape / Unescape | Escapes arbitrary text for JSON string contents, or decodes a valid sequence of JSON string contents | `.txt` |

The output panel's download button uses the active mode's file extension. Copy is also available. Empty input, invalid JSON, and unsupported CSV shapes produce inline errors and no downloadable result.

## Options and safety

Formatting and key sorting accept indentation from 0 to 10 spaces; the UI offers 0, 1, 2, and 4. CSV formula-injection protection is enabled by default. It prefixes cells beginning with spreadsheet formula characters (`=`, `+`, `-`, or `@`, including after leading whitespace/control characters) with an apostrophe. This intentionally changes those CSV field values to reduce spreadsheet formula execution risk. The checkbox can disable that protection when exact cell contents are required; only do so for trusted data.

CSV cells are quoted and embedded quotes doubled, so delimiters, quotes, and line breaks remain within their field. Values such as `0`, `false`, and `null` are emitted as text rather than being replaced by empty strings. Columns are the union of keys in the input objects; missing cells are empty. Nested arrays and objects are compact JSON text in their cell.

Input is limited to 1,000,000 characters, parsed JSON nesting is limited to 100 levels, and generated output is limited to 5,000,000 characters. Unescape rejects malformed JSON escapes and unescaped control characters instead of silently leaving them in place.

## Example input

The tool page's sample is stored in [definition.ts](definition.ts):

~~~json
{
  "name": "DevTools Hub",
  "active": true,
  "count": 0,
  "note": null
}
~~~

## Privacy

Transformations run in the browser. Tool input is not sent to a conversion service or uploaded by this tool. Normal site hosting and asset requests are governed by the project privacy information.

## Contribution files

- [definition.ts](definition.ts): catalog metadata, sample, defaults, and default output extension.
- [logic.ts](logic.ts): typed `run(input, options)` entry point and bounded local transformations.
- [Tool.tsx](Tool.tsx): accessible interactive UI, inline status/errors, and mode-specific downloads.
- Focused tests: [tests/tools/json-formatter.test.cjs](../../../tests/tools/json-formatter.test.cjs).

Run the focused test with `node --test tests/tools/json-formatter.test.cjs`. See [Adding a tool](../../../docs/adding-a-tool.md) and [Architecture](../../../docs/architecture.md).
