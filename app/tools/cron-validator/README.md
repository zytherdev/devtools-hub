# Cron Validator

**Status:** Implemented

Validate a five-field numeric cron expression for syntax and field bounds. This is a local, offline validator; it does not calculate a timezone-specific next run or determine whether a calendar date matches.

## Grammar

The expression has exactly five fields separated by whitespace, in this order:

1. Minute: `0–59`
2. Hour: `0–23`
3. Day of month: `1–31`
4. Month: `1–12`
5. Day of week: `0–7` (`0` and `7` both denote Sunday)

A field is a comma-separated list of terms. A term is `*`, a number, an ascending `number-number` range, or any of those followed by `/step`. Steps must be positive integers no greater than the number of allowed values in that field. With a single-number stepped term such as `5/10`, iteration starts at that number and proceeds through the field maximum. Names (`JAN`, `MON`, etc.), macros (`@daily`), seconds, year fields, and special day operators are not supported. Leading/trailing whitespace is ignored; lists may contain at most 64 terms per field.

Examples:

- `*/15 9-17 * * 1-5`
- `0 0 1,15 * 0`
- `5/10 8-18/2 * 1-12 1-5`

## Example input

The catalog sample is stored in [definition.ts](definition.ts):

~~~text
*/15 9-17 * * 1-5
~~~

## Options and limits

`run(input, options)` accepts a string no longer than 256 characters and an empty plain options object. Any option key, non-object options value, malformed field, unsupported token, or out-of-range value is rejected with an error. `validateCronExpression(input)` returns a `{ valid, message }` result for UI feedback, including non-string values without throwing.

## Processing and privacy

Validation uses local logic only; the expression is not sent to a server. A valid result means only that the documented syntax and numeric field bounds pass. It does not calculate the next execution time for any timezone and does not resolve calendar-dependent schedules.

## Contribution files

- [definition.ts](definition.ts): tool metadata, status, sample input, and defaults.
- [logic.ts](logic.ts): bounded parser, validation result, and `run` entry point.
- [Tool.tsx](Tool.tsx): interactive UI using the shared `ToolPanel` component.
- Focused tests: [tests/tools/cron-validator.test.cjs](../../../tests/tools/cron-validator.test.cjs).
