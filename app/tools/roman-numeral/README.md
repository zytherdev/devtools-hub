# Roman numeral converter

**Status:** Implemented

Converts integers from 1 to 3999 between Arabic and Roman numerals.

## Modes

From Arabic to Roman numerals (default mode):

~~~json
{"mode":"arabic-to-roman"}
~~~

From Roman to Arabic numerals:

~~~json
{"mode":"roman-to-arabic"}
~~~

Roman numeral input accepts `I`, `V`, `X`, `L`, `C`, `D`, `M` in uppercase or lowercase, but requires canonical notation (for example, `IV`, not `IIII`). Zero, negative numbers, fractions, and values above 3999 are not representable by this converter.

## Limits and privacy

Input of up to 100 characters. Conversion is deterministic and entirely local.

## Contribution files

- [definition.ts](definition.ts): metadata, example, and default mode.
- [logic.ts](logic.ts): encoding and canonical form validation.
- [Tool.tsx](Tool.tsx): shared `UniversalTool` interface.
- Tests: [tests/tools/roman-numeral.test.cjs](../../../tests/tools/roman-numeral.test.cjs).
