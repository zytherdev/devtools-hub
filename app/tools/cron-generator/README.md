# Cron expression generator

**Status:** Implemented

Builds a standard five-field cron expression and presents a field-by-field explanation. The generator produces the expression; it does not execute or schedule tasks.

## Fields and options

The input must be left empty. Define the fields in the JSON object:

~~~json
{"minute":"0","hour":"9","dayOfMonth":"*","month":"*","dayOfWeek":"1-5"}
~~~

The fields follow the traditional cron order: minute (0–59), hour (0–23), day of the month (1–31), month (1–12), and day of the week (0–7; 0 and 7 represent Sunday). Each field accepts wildcards (`*`), numeric values, comma-separated lists, ranges (`1-5`), and steps (`*/15`, `1-10/2`). Month/day names, special macros such as `@daily`, and provider-specific extensions are not accepted.

When both the day of the month and day of the week are restricted, traditional cron semantics combine the fields with OR; the output explanation highlights this behavior.

## Privacy and limits

Processing is local and deterministic: no network calls are made. Each field is limited to 128 characters, and values are validated against their ranges.

## Contribution files

- [definition.ts](definition.ts): metadata and default fields.
- [logic.ts](logic.ts): cron syntax validation and explanation.
- [Tool.tsx](Tool.tsx): shared `UniversalTool` interface.
- Tests: [tests/tools/cron-generator.test.cjs](../../../tests/tools/cron-generator.test.cjs).
