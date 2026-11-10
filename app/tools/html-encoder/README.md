# HTML Entity Encoder/Decoder

**Status:** Implemented

Encode and decode textual HTML character references; this does not parse or sanitize HTML documents.

## Availability

Available at /html-encoder. The connected processor downloads results as .txt.

## Example input

The catalog sample is stored in [definition.ts](definition.ts) and can be loaded from the tool page. Its JSON representation is:

~~~json
"<div title=\"hello & welcome\">A &amp; B</div>"
~~~

## Default options

The options panel starts with this JSON:

~~~json
{
  "operation": "encode",
  "encodeNonAscii": "false"
}
~~~

Defaults are not the complete API contract. [logic.ts](logic.ts) defines accepted keys, aliases, validation, and input/output limits; focused tests show representative behavior.

## Processing and privacy

The current transformation runs in the browser and does not intentionally upload tool input. Standard site hosting and asset requests are described in the project privacy page. Review the logic and tests before using sensitive data.
This performs bounded text substitution for HTML character references. It is not an HTML parser, sanitizer, or safe-HTML renderer.

## Contribution files

- [definition.ts](definition.ts): metadata, category, status, sample input, defaults, and output extension.
- [logic.ts](logic.ts): typed run(input, options) entry point and input validation.
- [Tool.tsx](Tool.tsx): UI entry connected through [componentRegistry](../componentRegistry.ts).
- lib/: helpers private to this tool, when needed.
- Focused tests: [tests/tools/html-encoder.test.cjs](../../../tests/tools/html-encoder.test.cjs).

Before submitting changes, run npm run check. See [Adding a tool](../../../docs/adding-a-tool.md) and [Architecture](../../../docs/architecture.md).
