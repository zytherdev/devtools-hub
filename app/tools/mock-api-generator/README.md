# Mock API Generator

**Status:** Implemented

Generates JSON fixtures locally from a JSON template object. Each record receives an independent copy of the input data and, optionally, a root field with an incremental identifier. The tool does not create or host HTTP endpoints.

## Usage

Paste a simple JSON object into the input. With the template `{"name":"Ada","role":"engineer"}` and the options below:

```json
{
  "count": "3",
  "wrapper": "data",
  "idField": "id"
}
```

the output is:

```json
{
  "data": [
    { "name": "Ada", "role": "engineer", "id": 1 },
    { "name": "Ada", "role": "engineer", "id": 2 },
    { "name": "Ada", "role": "engineer", "id": 3 }
  ],
  "meta": { "count": 3 }
}
```

The output is formatted with two-space indentation. If `wrapper` is the empty string, the result will be only an array of records, without a wrapper object or metadata. The name `meta` is reserved for metadata and cannot be used as a wrapper.

## Options

All options are strings and are optional:

- `count` (default `"3"`): number of records; must be an integer from `1` to `100`.
- `wrapper` (default `"data"`): property that contains the array; can be empty to return the raw array.
- `idField` (default `"id"`): root property that receives incremental numbers from `1` to `count`. If empty, no identifier is added. If this property already exists in the template, its value is replaced in the records, without changing identically named nested properties.

Unknown options are rejected. `wrapper` and `idField` accept up to 64 characters and cannot contain control characters.

## Validation and security

The input must be valid JSON whose root is a plain object; arrays, primitive values, and `null` are not accepted as a template. The input limit is 100,000 characters. The template allows a maximum depth of 20 levels, up to 10,000 items per array, up to 10,000 properties per object, and 20,000 JSON values in total. The output is limited to 1,000,000 bytes. Non-finite numbers and inputs that exceed the limits result in an error.

The implementation uses only the native JSON parser and serializer; it does not use `eval` or make network requests. Processing is local to the tool environment.

## Files

- [definition.ts](definition.ts): metadata, example, default options, and output extension.
- [logic.ts](logic.ts): processing, validation, and limits.
- [Tool.tsx](Tool.tsx): integration with `UniversalTool` via the slug `mock-api-generator`.
- Focused tests: [tests/tools/mock-api-generator.test.cjs](../../../tests/tools/mock-api-generator.test.cjs).
