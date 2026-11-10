# cURL to Code

**Status:** Implemented

Converts a supported cURL command into JavaScript (`fetch`), Python (`requests`), PHP (cURL), Go, Ruby, Java, or C# (.NET). Conversion runs locally in the browser; the pasted command is parsed, never executed, and no request is sent to its URL.

## Supported input

Common `curl` commands using an HTTP(S) URL, `-X`/`--request`, `-I`/`--head`, `-H`/`--header`, `-A`/`--user-agent`, `-d`/`--data`/`--data-raw`/`--data-binary`, `-F`/`--form`, `-u`/`--user`, and `--bearer` are supported. Repeated multipart fields are retained in their original order. File-based form fields (`@file` or `<file`) are not supported.

The parser rejects unknown options and options whose behavior the generators cannot faithfully express, including redirects (`-L`/`--location`), fail-on-HTTP-error (`-f`/`--fail`), timeouts, retries, and `--compressed`. Other unsupported cURL features (for example, proxy configuration, cookies, output files, and URL-encoded query mode) are rejected rather than silently omitted. Input is limited to 100,000 characters.

An explicit `-X` method is preserved when data is present; a body changes the method to POST only when cURL did not explicitly select a method. JavaScript `fetch` does not allow a GET or HEAD body, so selecting JavaScript for such a request produces an explanatory error; other generators retain the explicit method and body.

Generated examples use each target language's HTTP client. Client defaults and runtime behavior can differ from curl; inspect the result and test it in the target environment before use. The generated request contains any credentials present in the input. The page warns when it detects authorization credentials, and downloaded files contain those values too—remove secrets before sharing or committing generated code.

## Interface and downloads

Choose a target language, copy the generated snippet, or download it with an extension matching the selected language: `.js`, `.py`, `.php`, `.go`, `.rb`, `.java`, or `.cs`. The catalog's default output extension is `.js` (the default language).

## Catalog metadata and privacy

Available at `/curl-to-code`. The catalog example and default options are defined in [definition.ts](definition.ts). Conversion is entirely local; it does not intentionally upload the input or make network requests.

## Contribution files

- [definition.ts](definition.ts): metadata, example input, defaults, and default output extension.
- [logic.ts](logic.ts): typed parsing, validation, generation, and `run(input, options)` entry point.
- [Tool.tsx](Tool.tsx): accessible UI, feedback, copying, and language-specific downloads.
- Focused behavior tests: [tests/tools/curl-to-code.test.cjs](../../../tests/tools/curl-to-code.test.cjs).

Run the focused test with `node --test tests/tools/curl-to-code.test.cjs`. Project checks are `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`; no dependencies are needed for this tool.
