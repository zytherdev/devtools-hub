# Timezone Converter

**Status:** Implemented

Convert one explicit ISO-8601 instant between source and target IANA time zones. Both local results include their UTC offsets, long time-zone names, and a daylight-saving status. Processing uses the browser/runtime `Intl.DateTimeFormat` time-zone database and makes no network requests.

## Input and output

Pass one JSON object with exactly these string properties:

~~~json
{
  "instant": "2024-06-15T12:00:00Z",
  "fromTimeZone": "UTC",
  "toTimeZone": "America/New_York"
}
~~~

`instant` must include `Z` or an explicit `±HH:MM` offset. It accepts `YYYY-MM-DDTHH:mm` with optional seconds and up to three fractional-second digits. Calendar dates, times, offsets, and supported years are validated strictly; supported UTC years are 0001–9999. Time-zone names must be accepted by `Intl.DateTimeFormat` and contain no whitespace. The conversion uses the same absolute instant for both zones; a local clock value is never interpreted as an instant.

The JSON result contains the normalized UTC `instant`, a `source` object, and a `target` object. Each zone result reports the submitted zone name, local ISO-like date-time with its numeric offset, `utcOffset`, an English long time-zone name, a boolean `daylightSavingTime` where inferable, and a plain-language `daylightSavingLabel`. If the zone's offsets vary during the UTC calendar year containing the instant, the larger observed offset is labeled daylight saving time. Zones with irregular patterns may return `null` when status cannot be inferred; a zone with one observed offset is reported as having no seasonal offset change that year.

The `run(input, options)` interface rejects all options, unknown input properties, invalid JSON, unsupported zones, empty input, and input longer than 2,048 characters. Each zone name is limited to 128 characters. Output is bounded by those input limits and the fixed result structure.

## Privacy

Conversion is local. The tool does not call a service or send the instant or time-zone names over the network. Results use the time-zone rules available in the current JavaScript runtime, which can vary by browser or runtime version.

## Contribution files

- [definition.ts](definition.ts): implemented metadata, example input, defaults, and output extension.
- [logic.ts](logic.ts): strict JSON/instant/time-zone validation and bounded `Intl` conversion.
- [Tool.tsx](Tool.tsx): accessible form and result display using the shared `ToolPanel` design system.
- Focused tests: [tests/tools/timezone-converter.test.cjs](../../../tests/tools/timezone-converter.test.cjs).

Run the focused tests with `node --test tests/tools/timezone-converter.test.cjs`. See [Adding a tool](../../../docs/adding-a-tool.md) and [Architecture](../../../docs/architecture.md).
