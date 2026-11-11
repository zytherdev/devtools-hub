# Unit Converter

**Status:** Implemented

Local converter for length, mass, volume, area, time, and temperature.

## Options

Example: to convert `1500` meters to kilometers, use:

~~~json
{"from":"m","to":"km","precision":"4"}
~~~

Supported units:

- Length: `mm`, `cm`, `m`, `km`, `in`, `ft`, `yd`, `mi`.
- Mass: `mg`, `g`, `kg`, `oz`, `lb`.
- Volume: `ml`, `l`, `m3`, `gal` (US liquid gallon).
- Area: `mm2`, `cm2`, `m2`, `km2`, `ft2`, `acre`.
- Time: `ms`, `s`, `min`, `h`, `day`.
- Temperature: `C`, `F`, `K`.

`from` and `to` must belong to the same dimension. `precision` controls rounding to 0–12 decimal places (default 4). Temperatures below absolute zero are rejected. The JSON output contains the input value, units, dimension, and rounded result.

## Limits and privacy

Accepts a finite decimal number up to 100 characters. Processing uses fixed conversion factors, with no network or external rates.

## Contribution files

- [definition.ts](definition.ts): metadata, example, and default options.
- [logic.ts](logic.ts): conversion table, validation, and rounding.
- [Tool.tsx](Tool.tsx): shared `UniversalTool` interface.
- Tests: [tests/tools/unit-converter.test.cjs](../../../tests/tools/unit-converter.test.cjs).
