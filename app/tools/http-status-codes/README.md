# HTTP Status Codes

**Status:** Implemented

Search a curated local reference of standard HTTP status codes, descriptions, and response categories. Results are available directly in the tool page or as formatted JSON through the local `run(input, options)` entry point.

## Curated coverage

The catalog includes 62 standardized entries grouped by their leading digit: informational (1xx), successful (2xx), redirection (3xx), client error (4xx), and server error (5xx). It covers registered codes commonly defined by HTTP semantics and related standards, including WebDAV and early hints. The list is curated rather than an exhaustive live registry: unassigned values, vendor-specific codes, and extension-only codes are excluded. Some entries are deprecated or reserved, and their descriptions identify that status where relevant.

Descriptions are concise reference summaries, not normative protocol guidance. Category metadata follows the first digit of each status code.

## Lookup contract

- `input` must be a non-empty string of at most 100 characters and may not contain control characters.
- A three-digit numeric query must be between 100 and 599. A valid numeric query performs an exact lookup; a code not in the curated list returns no matches.
- Other queries search case-insensitively across code, title, description, category label, and category key.
- The only supported option is `category`, with one of `all`, `1xx`, `2xx`, `3xx`, `4xx`, or `5xx`. It defaults to `all`; unknown options and values are rejected.
- Results are returned as JSON containing the normalized query, selected category, total count, and matching entries. Search is bounded by the 100-character query limit and the fixed local catalog.

The page supports the same code/text search and category filter. An empty search displays the selected category; invalid numeric input is explained inline.

## Example input and defaults

The catalog sample is stored in [definition.ts](definition.ts):

~~~text
404
~~~

Default options:

~~~json
{"category":"all"}
~~~

## Processing and privacy

All lookups use the curated data embedded in [logic.ts](logic.ts). The tool makes no network requests and does not fetch remote references. No input is transmitted or persisted by this tool.

## Contribution files

- [definition.ts](definition.ts): implemented tool metadata, sample input, and defaults.
- [logic.ts](logic.ts): curated data, strict validation, local search, and JSON output.
- [Tool.tsx](Tool.tsx): searchable local reference using the shared `ToolPanel` design system and the standard dynamic tool route.
- Focused native Node tests: [tests/tools/http-status-codes.test.cjs](../../../tests/tools/http-status-codes.test.cjs).
