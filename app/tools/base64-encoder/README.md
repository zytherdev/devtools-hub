# Base64 Encoder/Decoder

**Status:** Implemented

Encode or decode Unicode text as UTF-8 Base64, with URL-safe alphabet and padding controls.

## Availability

Available at /base64-encoder. The connected processor downloads results as .txt.

## Example input

The catalog sample is stored in [definition.ts](definition.ts) and can be loaded from the tool page. Its JSON representation is:

~~~json
"DevTools Hub — text is encoded as UTF-8."
~~~

## Default options

The options panel starts with this JSON:

~~~json
{
  "operation": "encode",
  "urlSafe": "false",
  "padding": "true",
  "allowWhitespace": "false",
  "allowUnpadded": "false"
}
~~~

Defaults are not the complete API contract. [logic.ts](logic.ts) defines accepted keys, aliases, validation, and input/output limits; focused tests show representative behavior.

## Processing and privacy

The current transformation runs in the browser and does not intentionally upload tool input. Standard site hosting and asset requests are described in the project privacy page. Review the logic and tests before using sensitive data.
This tool converts Unicode text using UTF-8. It does not read arbitrary binary files.

## Contribution files

- [definition.ts](definition.ts): metadata, category, status, sample input, defaults, and output extension.
- [logic.ts](logic.ts): typed run(input, options) entry point and input validation.
- [Tool.tsx](Tool.tsx): UI entry connected through [componentRegistry](../componentRegistry.ts).
- lib/: helpers private to this tool, when needed.
- Focused tests: [tests/tools/base64-encoder.test.cjs](../../../tests/tools/base64-encoder.test.cjs).

Before submitting changes, run npm run check. See [Adding a tool](../../../docs/adding-a-tool.md) and [Architecture](../../../docs/architecture.md).
