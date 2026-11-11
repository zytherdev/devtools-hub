# Timestamp Converter

**Status:** Implemented

Converts ISO-8601 dates to Unix timestamps and Unix timestamps to UTC dates, without depending on the machine’s local time zone.

## Options

ISO to epoch:

~~~json
{"mode":"iso-to-epoch"}
~~~

The input must have an explicit time zone, for example `2026-01-01T12:30:00-03:00`. The fractional second accepts 1 to 3 digits. The JSON output includes the normalized UTC date, Unix seconds, and Unix milliseconds.

Epoch to ISO:

~~~json
{"mode":"epoch-to-iso","unit":"seconds"}
~~~

`unit` can be `seconds` or `milliseconds`. This direction accepts only integer timestamps. The output always provides ISO UTC, seconds, and milliseconds. The range follows JavaScript `Date` limits; nonexistent dates and offsets above ±14:00 are rejected.

## Limits and privacy

Input of 1 to 100 characters. The converter does not query a clock or external service; the result depends only on the provided value.

## Contribution files

- [definition.ts](definition.ts): metadata, example, and default mode.
- [logic.ts](logic.ts): strict ISO parser, calendar validation, and Unix conversion.
- [Tool.tsx](Tool.tsx): shared `UniversalTool` interface.
- Tests: [tests/tools/timestamp-converter.test.cjs](../../../tests/tools/timestamp-converter.test.cjs).
