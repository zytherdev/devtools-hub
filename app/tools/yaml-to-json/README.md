# YAML to JSON Converter

**Status:** Implemented

Convert YAML data to JSON format. Great for configuration migration.

## Availability

Available at /yaml-to-json. The connected processor downloads results as .json.

## Example input

The catalog sample is stored in [definition.ts](definition.ts) and can be loaded from the tool page. Its JSON representation is:

~~~json
"app:\n  name: DevTools Hub\n  version: 1\nfeatures:\n  - private\n  - fast"
~~~

## Default options

The options panel starts with this JSON:

~~~json
{}
~~~

Defaults are not the complete API contract. [logic.ts](logic.ts) defines accepted keys, aliases, validation, and input/output limits; focused tests show representative behavior.

## Processing and privacy

The current transformation runs in the browser and does not intentionally upload tool input. Standard site hosting and asset requests are described in the project privacy page. Review the logic and tests before using sensitive data.

## Contribution files

- [definition.ts](definition.ts): metadata, category, status, sample input, defaults, and output extension.
- [logic.ts](logic.ts): typed run(input, options) entry point and input validation.
- [Tool.tsx](Tool.tsx): UI entry connected through [componentRegistry](../componentRegistry.ts).
- lib/: helpers private to this tool, when needed.
- Focused tests: [tests/tools/yaml-to-json.test.cjs](../../../tests/tools/yaml-to-json.test.cjs).

Before submitting changes, run npm run check. See [Adding a tool](../../../docs/adding-a-tool.md) and [Architecture](../../../docs/architecture.md).
