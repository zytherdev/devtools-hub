# Number base converter

**Status:** Implemented

Converts signed integers between any base from 2 to 36, using BigInt arithmetic to avoid losing precision.

## Options

~~~json
{"fromBase":"10","toBase":"16"}
~~~

`fromBase` and `toBase` are integers from 2 to 36. Accepted digits are `0–9` and `a–z` (case-insensitive on input); output uses lowercase letters. The `+` or `-` sign is allowed. Prefixes such as `0x` are not interpreted: explicitly set the base. Fractions are not supported.

Example: input `255` in base 10 produces `ff` in base 16.

## Limits and privacy

Up to 1,000 input characters. The calculation is local, exact, and network-free.

## Contribution files

- [definition.ts](definition.ts): metadata and default bases.
- [logic.ts](logic.ts): digit parser and BigInt conversion.
- [Tool.tsx](Tool.tsx): shared `UniversalTool` interface.
- Tests: [tests/tools/number-base-converter.test.cjs](../../../tests/tools/number-base-converter.test.cjs).
