# ETA Calculator

**Status:** Implemented

Estimate the remaining time and UTC completion date from validated progress and either elapsed time or a known throughput rate. Processing is deterministic: every input includes an explicit `asOf` timestamp, and the calculation runs locally in the browser without network access.

## Input

Provide a JSON object with a numeric `progress` from `0` through `100`, an `asOf` UTC timestamp, and exactly one estimation input:

- `elapsedMinutes`: positive elapsed minutes associated with the current progress. The calculator projects the same average rate over the remaining percentage: `(100 - progress) × elapsedMinutes ÷ progress`.
- `throughputPercentPerHour`: a positive rate in percentage points per hour. The calculator divides the remaining percentage by this rate.

`asOf` is required and uses `YYYY-MM-DDTHH:mm:ssZ`, optionally with one to three fractional-second digits. The example in [definition.ts](definition.ts) is ready to run.

## Validation and bounds

Inputs must be valid JSON objects with only the documented keys and numeric values (numeric strings are not accepted). Percentages, elapsed minutes, and throughput can have at most two decimal places. Progress must be between 0 and 100. Zero progress cannot be used with `elapsedMinutes`, because no completion rate can be inferred; zero progress is accepted with an explicitly supplied positive throughput. A completed task at 100% has a zero-second ETA.

Elapsed time is limited to 365 days; throughput is limited to 10,000 percentage points per hour. The result is rounded to the nearest whole second (half seconds round up), and estimates longer than 100 × 365 days are rejected. UTC dates must be in the inclusive year range 0000–9999; an estimate that would exceed that range is rejected. The `asOf` fractional milliseconds are preserved in the resulting completion timestamp.

The processor accepts no options. Input is limited to 2,000 characters. Output JSON includes the calculation method, remaining seconds/minutes/hours, normalized reference timestamp, and estimated completion timestamp.

## Files

- [definition.ts](definition.ts): metadata and a loadable example.
- [logic.ts](logic.ts): strict validation and calculation.
- [Tool.tsx](Tool.tsx): shared UniversalTool UI entry point.
- Focused tests: [tests/tools/eta-calculator.test.cjs](../../../tests/tools/eta-calculator.test.cjs).
