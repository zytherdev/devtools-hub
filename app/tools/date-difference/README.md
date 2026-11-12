# Date Difference Calculator

**Status:** Implemented

Calculate the calendar and elapsed-time difference between two dates or explicit-offset date-times.

## Input contract

Pass one JSON object containing exactly two string properties, `start` and `end`. Dates use the exact `YYYY-MM-DD` form. Date-times use `YYYY-MM-DDTHH:mm:ss`, an optional one-to-three-digit fractional second, and a required `Z` or `±HH:MM` UTC offset. Calendar dates, clock values, and offsets are validated directly; ambient locale parsing is never used. Leap seconds, timezone names, and date-times without an explicit offset are not accepted.

Date-only values mean midnight UTC. Date-time offsets are applied to resolve each instant, and both values are normalized to UTC before measuring the difference. This means results do not depend on the user's machine time zone or daylight-saving rules. UTC offsets are limited to -14:00 through +14:00, and the normalized UTC year must remain between 0001 and 9999.

The result keeps the supplied endpoint order and reports `direction` as `forward`, `backward`, or `same`. `calendarDifference` is the non-negative calendar breakdown from the earlier instant to the later instant: years, months, days, hours, minutes, seconds, and milliseconds. Calendar year/month additions clamp to the final valid day of the destination month (for example, February 29 plus one year becomes February 28 in a non-leap year). Remaining elapsed-time units are measured in UTC, where a calendar day is 24 hours. `elapsedMilliseconds` and `elapsedDays` provide the corresponding exact-millisecond and fractional-day measures.

~~~json
{
  "start": "2024-02-29",
  "end": "2025-03-01"
}
~~~

## Default options

No options are accepted; supply an empty options object.

~~~json
{}
~~~

Input is limited to 256 characters and the absolute elapsed span to 36,600 days (100 × 366 days). These limits and the finite supported year range keep processing bounded.

## Processing and privacy

The calculation runs locally in the browser and does not make network requests or store input. The page uses explicit text fields so browser-local date/time interpretation cannot alter the provided values. Results are JSON with the normalized UTC endpoints, direction, calendar breakdown, and elapsed totals.

## Contribution files

- [definition.ts](definition.ts): metadata, category, status, sample input, defaults, and output extension.
- [logic.ts](logic.ts): strict ISO parsing, bounds, and calendar/time difference computation.
- [Tool.tsx](Tool.tsx): custom UI using the shared tool panel and explicit offset-aware text fields.
- Focused tests: [tests/tools/date-difference.test.cjs](../../../tests/tools/date-difference.test.cjs).

Run the focused test with `node --test tests/tools/date-difference.test.cjs`. The parent integration task owns shared registries and broader project checks.
