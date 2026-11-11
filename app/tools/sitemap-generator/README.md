# Sitemap Generator

**Status:** Implemented

Generates an XML sitemap from website URLs, one per line. The result follows the standard sitemap namespace and can be downloaded as an `.xml` file.

## Usage and options

Each URL must be absolute and use `http` or `https`. URLs with credentials or fragments are rejected. Duplicate entries are normalized and removed.

Default options:

~~~json
{"changeFrequency":"weekly","priority":"0.5","lastModified":""}
~~~

- `changeFrequency`: `always`, `hourly`, `daily`, `weekly`, `monthly`, `yearly`, `never`, or empty to omit the tag.
- `priority`: decimal number from `0.0` to `1.0` (up to two decimal places), or empty to omit the tag.
- `lastModified`: valid date in `YYYY-MM-DD` format, or empty to omit the tag.

Optional values are applied to each URL. Special characters in locations are escaped in XML. Make sure all URLs represent canonical pages that you want to make available to search engines.

## Limits and privacy

Up to 50,000 URLs and 5,000,000 input characters are accepted; output is limited to 10,000,000 characters. Processing is local, without querying or sending URLs to external services.

## Contribution files

- [definition.ts](definition.ts): metadata, options, and input example.
- [logic.ts](logic.ts): validation, normalization, and XML serialization.
- [Tool.tsx](Tool.tsx): shared `UniversalTool` interface.
- Tests: [tests/tools/sitemap-generator.test.cjs](../../../tests/tools/sitemap-generator.test.cjs).
