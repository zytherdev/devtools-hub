# File Size Converter

**Status:** Implemented

Converts values between bytes, decimal units, and binary units.

## Options

~~~json
{"from":"B","to":"KiB","precision":"3"}
~~~

Decimal units use powers of 1,000: `B`, `KB`, `MB`, `GB`, `TB`, `PB`. Binary units use powers of 1,024: `KiB`, `MiB`, `GiB`, `TiB`, `PiB`, `EiB`. `precision` sets rounding to between 0 and 12 decimal places (default 3). The JSON output shows the input value, units, and result.

This calculation converts mathematical units; it does not inspect files or estimate the space actually occupied by file systems.

## Limits and privacy

Accepts a finite, non-negative number of up to 100 characters. No files are read and no network traffic occurs.

## Implementation files

- [definition.ts](definition.ts): metadata and default options.
- [logic.ts](logic.ts): decimal/binary factors and validation.
- [Tool.tsx](Tool.tsx): shared `UniversalTool` interface.
- Tests: [tests/tools/file-size-converter.test.cjs](../../../tests/tools/file-size-converter.test.cjs).
