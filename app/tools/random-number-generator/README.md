# Random number generator

**Status:** Implemented

Generates cryptographically secure integers within a configurable range, with an option to prevent repeats. Each result appears on a separate line.

## Options

The input area must remain empty. Configure the tool using the JSON object:

~~~json
{"min":"1","max":"100","count":"10","unique":"false"}
~~~

- `min` and `max`: inclusive limits, which must be JavaScript safe integers; `min` cannot be greater than `max`.
- `count`: number of results, from 1 to 1,000.
- `unique`: `true` for sampling without repeats, or `false` (default) to allow repeats. The requested count cannot exceed the number of available values when `unique` is `true`.

## Security and privacy

Values are generated using `Web Crypto getRandomValues` and rejection sampling to avoid modulo bias. If Web Crypto is unavailable or fails, generation stops; there is no fallback to `Math.random`. Processing happens locally, with no network access or storage by the application.

## Limits

The range accepts any JavaScript safe integer as a limit, and a single run generates up to 1,000 values. The tool does not accept a seed or input text. Do not use generated numbers as substitutes for cryptographic keys or protocol-specific secrets.

## Contribution files

- [definition.ts](definition.ts): metadata and default values.
- [logic.ts](logic.ts): range validation and secure sampling.
- [Tool.tsx](Tool.tsx): shared `UniversalTool` interface.
- Tests: [tests/tools/random-number-generator.test.cjs](../../../tests/tools/random-number-generator.test.cjs).
