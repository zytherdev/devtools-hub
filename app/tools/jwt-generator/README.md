# JWT Generator

**Status:** Implemented

Generate and sign JWT tokens with custom payload and expiration.

## Availability

Available at /jwt-generator. The connected processor downloads results as .txt.

## Example input

The catalog sample is stored in [definition.ts](definition.ts) and can be loaded from the tool page. Its JSON representation is:

~~~json
"{\"sub\":\"demo\",\"role\":\"developer\"}"
~~~

## Default options

The options panel starts with this JSON:

~~~json
{
  "secret": ""
}
~~~

Defaults are not the complete API contract. [logic.ts](logic.ts) defines accepted keys, aliases, validation, and input/output limits; focused tests show representative behavior.

## Processing and privacy

The current transformation runs in the browser and does not intentionally upload tool input. Standard site hosting and asset requests are described in the project privacy page. Review the logic and tests before using sensitive data.
Generation supports HS256 only and requires an explicit secret. Use a strong secret; it is processed in the browser and is not sent to a signing service.

## Contribution files

- [definition.ts](definition.ts): metadata, category, status, sample input, defaults, and output extension.
- [logic.ts](logic.ts): typed run(input, options) entry point and input validation.
- [Tool.tsx](Tool.tsx): UI entry connected through [componentRegistry](../componentRegistry.ts).
- lib/: helpers private to this tool, when needed.
- Focused tests: [tests/tools/jwt-generator.test.cjs](../../../tests/tools/jwt-generator.test.cjs).

Before submitting changes, run npm run check. See [Adding a tool](../../../docs/adding-a-tool.md) and [Architecture](../../../docs/architecture.md).
