# ASCII Converter

**Status:** Planned

Convert text to ASCII codes and vice versa. Perfect for binary data handling.

## Availability

This catalog entry is planned, not a functioning processor. The page shows a planned-state placeholder; do not rely on it for production work.

## Example input

The catalog sample is stored in [definition.ts](definition.ts) and can be loaded from the tool page. Its JSON representation is:

~~~json
""
~~~

## Default options

The options panel starts with this JSON:

~~~json
{}
~~~

Defaults are not the complete API contract. [logic.ts](logic.ts) defines accepted keys, aliases, validation, and input/output limits; focused tests show representative behavior.

## Processing and privacy

No transformation is implemented yet. Keep status set to planned until validated logic, a connected UI, meaningful tests, and this documentation are complete.

## Contribution files

- [definition.ts](definition.ts): metadata, category, status, sample input, defaults, and output extension.
- [logic.ts](logic.ts): typed run(input, options) entry point and input validation.
- [Tool.tsx](Tool.tsx): UI entry connected through [componentRegistry](../componentRegistry.ts).
- lib/: helpers private to this tool, when needed.
- Focused tests: [tests/tools/ascii-converter.test.cjs](../../../tests/tools/ascii-converter.test.cjs).

Before submitting changes, run npm run check. See [Adding a tool](../../../docs/adding-a-tool.md) and [Architecture](../../../docs/architecture.md).
