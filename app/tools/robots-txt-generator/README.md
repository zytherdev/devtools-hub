# Robots.txt Generator

**Status:** Implemented

Generates a local `robots.txt` file with agent directives, allowed and blocked paths, sitemap references, and crawl delay.

## Usage and options

Enter one path per line in the input to create `Disallow` directives. Paths must start with `/`; spaces, fragments, and control characters are not accepted. Duplicate paths are removed.

Default options:

~~~json
{"userAgent":"*","allow":"/","crawlDelay":"","sitemap":""}
~~~

- `userAgent`: `*` or a product token containing letters, numbers, periods, underscores, and hyphens (up to 80 characters).
- `allow`: allowed paths separated by lines, following the same input rules.
- `crawlDelay`: empty to omit the directive, or an integer number of seconds between 0 and 86,400.
- `sitemap`: absolute HTTP(S) URLs, one per line. Credentials and fragments are not allowed.

The output contains the `User-agent`, `Allow`, `Disallow`, `Crawl-delay`, and `Sitemap` directives only when applicable. The file is plain text and can be downloaded as `robots-txt-generator.txt`.

## Limits and privacy

Input is limited to 100,000 characters, with up to 1,000 paths per field and up to 50 sitemaps. No network requests are made; the tool only validates and assembles text locally. Review the rules before publishing, as incorrect policies can affect site indexing.

## Contribution files

- [definition.ts](definition.ts): metadata and default options.
- [logic.ts](logic.ts): file validation and assembly.
- [Tool.tsx](Tool.tsx): shared `UniversalTool` interface.
- Tests: [tests/tools/robots-txt-generator.test.cjs](../../../tests/tools/robots-txt-generator.test.cjs).
