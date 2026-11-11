# JSON Comparator

**Status:** Implemented

Compares two JSON structures locally and returns lists of added, removed, and changed values.

## Usage

The input must be a JSON object with exactly the properties `before` and `after`:

~~~json
{
  "before": { "name": "Ada", "role": "engineer" },
  "after": { "name": "Grace", "active": true }
}
~~~

The output is JSON with `added`, `removed`, and `changed` arrays. Each difference includes a JSON Pointer path; `/` and `~` characters in property names are escaped according to the convention. Arrays of the same size are compared by index; arrays of different sizes appear as a single change at the array path.

## Limits and privacy

The input is limited to 1,000,000 characters, the comparison traverses at most 100,000 nodes and 50 levels of depth, and the output cannot exceed 4,000,000 characters. Options are not accepted. No data is sent over the network.

## Contribution files

- [definition.ts](definition.ts): metadata and comparison example.
- [logic.ts](logic.ts): parser, structural comparison, and validations.
- [Tool.tsx](Tool.tsx): shared `UniversalTool` interface.
- Tests: [tests/tools/json-diff.test.cjs](../../../tests/tools/json-diff.test.cjs).
