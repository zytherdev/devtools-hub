# UUID Generator

**Status:** Implemented

Generates one or more cryptographically secure UUID v4 identifiers. The tool outputs one lowercase UUID per line and performs the generation locally in the browser or in a compatible environment.

## Options

The tool accepts a JSON options object:

~~~json
{ "version": "4", "count": "1" }
~~~

- `version`: must be the string `"4"` (default: `"4"`).
- `count`: integer string between `"1"` and `"1000"` (default: `"1"`).

The input text is not used; leave the input area empty. UUID v5 and other versions are not supported. The `namespace` and `name` options are rejected because they apply to version v5; they are not silently ignored. Counts above 1000, invalid option keys, and malformed options produce an error.

## Security and privacy

The UUID v4 bytes are obtained exclusively through the environment’s `Web Crypto getRandomValues` API; the standardized version and variant bits are then set. If Web Crypto is unavailable or fails, generation stops with an error; there is no `Math.random`-based fallback. No input or generated data is sent over the network. The tool makes no external requests.

UUIDs are designed to provide high collision resistance, not to serve as authentication secrets or replace access-control tokens.

## Contribution files

- [definition.ts](definition.ts): catalog metadata and default options.
- [logic.ts](logic.ts): bounded UUID v4 generation and options validation.
- [Tool.tsx](Tool.tsx): shared `UniversalTool` interface input.
- Specific tests: [tests/tools/uuid-generator.test.cjs](../../../tests/tools/uuid-generator.test.cjs).
