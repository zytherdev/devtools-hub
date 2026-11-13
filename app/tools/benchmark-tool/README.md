# Benchmark Tool

**Status:** Implemented

Run bounded browser-local microbenchmarks against four fixed JavaScript workloads: array map/reduce, JSON parse/stringify, string assembly, and in-memory map lookup.

## Scope and limitations

This tool does not evaluate user-supplied source code and does not call or benchmark API endpoints. It runs only predefined operations over fixed in-memory data. Measurements are affected by device hardware, browser implementation, background load, JIT warm-up, power management, and timer precision. Treat the results as rough comparisons, not production capacity estimates; compare runs only under similar conditions.

## Example input

Choose one suite ID:

~~~text
array-map
~~~

Supported IDs are `array-map`, `json-roundtrip`, `string-assembly`, and `map-lookup`.

## Options

~~~json
{
  "iterations": "2000",
  "samples": "5"
}
~~~

`iterations` is the number of workload operations per sample (1–10,000). `samples` is the number of timed samples (1–9). The runner performs a bounded warm-up and reports individual sample times, minimum, median, mean, maximum, operations per second, and a checksum so the workload result is consumed.

## Processing and privacy

All work is performed locally in the current browser or runtime using fixed test data. No network requests, arbitrary-code evaluation, or external dependencies are used. Total work is bounded by 10,000 iterations across at most nine samples, plus a capped warm-up.

## Contribution files

- [definition.ts](definition.ts): metadata, example suite, and default sample limits.
- [logic.ts](logic.ts): fixed workloads, bounded validation, measurements, and the `run(input, options)` entry point.
- [Tool.tsx](Tool.tsx): shared generic editor and output interface.
- Focused tests: [tests/tools/benchmark-tool.test.cjs](../../../tests/tools/benchmark-tool.test.cjs).

Before submitting changes, run `npm run check`. See [Adding a tool](../../../docs/adding-a-tool.md) and [Architecture](../../../docs/architecture.md).
