# OpenAPI Generator

**Status:** implemented.

Generates an **OpenAPI 3.1.0 JSON** specification locally from a JSON object containing a title, version, servers, endpoints, and response schemas. The output can be copied or downloaded as a `.json` file in the project’s standard interface.

## Input example

```json
{
  "title": "Example API",
  "version": "1.0.0",
  "description": "",
  "servers": ["https://api.example.com"],
  "endpoints": [
    {
      "path": "/users",
      "method": "get",
      "summary": "List users",
      "responseDescription": "Success",
      "responseSchema": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "id": { "type": "integer" },
            "name": { "type": "string" }
          }
        }
      }
    }
  ]
}
```

Each endpoint generates an operation with a `200` response and `application/json` content, using the provided `responseSchema`. Schemas are carried through to the output; the tool does not infer schemas or fully validate the semantics of the JSON Schema vocabulary.

## Fields and validation

- `title` and `version` are required text fields, limited to 128 and 64 characters.
- `description` is optional (up to 2,000 characters); if empty, it is omitted from `info`.
- `servers` must contain 1 to 20 absolute `http://` or `https://` URLs, each up to 2,048 characters. Credentials and `#` fragments are prohibited.
- `endpoints` must contain 1 to 100 items. The method must be `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, or `OPTIONS`; methods and paths must not be duplicated.
- `path` can be up to 512 characters, must start with `/`, and cannot include a query (`?`) or fragment (`#`). `summary` and `responseDescription` can be up to 256 characters.
- `responseSchema` must be a JSON object with a maximum depth of 16 levels and 20,000 values. `$ref`, `$dynamicRef`, and `$recursiveRef` are rejected.
- The entire input is limited to 100,000 characters; the output to 1 MB. Fields outside the documented format and non-empty options are rejected.

## Limitations and privacy

Processing takes place in the browser and makes no network requests; server URLs are only included in the generated specification and are never accessed. This tool does not read source code, import documents, query servers, or verify that endpoints exist. Each operation receives only a `200` JSON response; there is no configuration for parameters, authentication, security, additional errors, headers, or alternative content. Schema references are not accepted. The output is an initial specification that should be reviewed before production use.

## Files

- `definition.ts`: metadata, example, empty options, and JSON extension.
- `logic.ts`: limited validation and local generation.
- `Tool.tsx`: composition with `UniversalTool` and slug `openapi-generator`.
- Focused tests: `tests/tools/openapi-generator.test.cjs`.
