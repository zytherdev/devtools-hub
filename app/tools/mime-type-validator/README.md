# MIME Type Validator

**Status:** Implemented

Validates the syntax of a MIME type or looks up common MIME types from a file name or extension. Processing uses a local table included with the application and makes no network requests.

## Usage

Enter a MIME value, such as `Application/JSON; Charset=utf-8`, an extension, such as `.jpg`, or a file name, such as `archive.tar.gz`. The output is formatted as JSON. Type/subtype and parameter names are case-insensitive; valid parameter values and quoted strings are checked and preserved. Compound suffixes included in the table are checked before shorter suffixes (for example, `archive.tar.gz` matches `application/gzip`).

The `mode` option accepts:

- `lookup` (default): returns the local table result, when there is a match.
- `validate`: reports separately whether the syntax is valid and whether the value is listed in the local table.

The `target` option accepts:

- `auto` (default): identifies the input as MIME when it begins with `type/subtype`; otherwise, interprets it as an extension or file name.
- `mime`: explicitly interprets a MIME type, with optional parameters.
- `extension`: explicitly interprets an extension or file name.

Example of JSON options:

~~~json
{"mode":"validate","target":"mime"}
~~~

A MIME type or extension with valid syntax but absent from the table returns `valid: true` and `known: false`; malformed syntax produces an error. MIME parameters are checked for syntax but are not used to select a table entry. Extension lookup uses the final suffix of the file name, giving precedence to known compound suffixes.

## Local Reference Table

The embedded table covers common JSON/XML/PDF/archive/document, web/source code, image, audio, video, and font formats. It is intentionally limited, is not a complete list or an official IANA registry. Some extensions have multiple conventions; this table chooses one association (for example, `.xml` matches `application/xml`). Results reflect only this local list, not operating system associations or server behavior. Unknown values are not looked up externally.

## Limits and Privacy

Input is limited to 512 characters and serialized output to 8 KiB. The tool only performs local string parsing and table lookup. No input is sent, and there is no network lookup or dependency on remote registries.

## Contribution Files

- [definition.ts](definition.ts): catalog metadata, options, and input example.
- [logic.ts](logic.ts): limited parser and MIME/extension table.
- [Tool.tsx](Tool.tsx): shared `UniversalTool` input.
- Specific tests: [tests/tools/mime-type-validator.test.cjs](../../../tests/tools/mime-type-validator.test.cjs).
