# User Agent Parser

**Status:** Implemented

Parse common browser, rendering-engine, operating-system, and device patterns from a user-agent string. The parser is deterministic and runs locally; it makes no network requests and adds no dependencies.

## Availability and input

Paste one user-agent string containing 1–2,048 characters after trimming. Empty values, control characters, and non-text inputs are rejected. The parser does not accept options; its options object must be empty.

The built-in example in [definition.ts](definition.ts) is a desktop Chrome user-agent. It is available from the tool page's **Load example** button.

## Output

The output is formatted JSON containing the trimmed `userAgent` and four groups:

- `browser`: `name`, `version`, and `major`.
- `engine`: `name` and `version`.
- `os`: `name` and `version`.
- `device`: `type` (`desktop`, `mobile`, `tablet`, `bot`, or `unknown`), `vendor`, and `model`.

Unrecognized fields are represented as `null`; an unrecognized device type is `unknown`. The local tool UI displays a short summary as well as the full structured result.

## Recognized patterns and limitations

Common patterns include Chrome/Chromium, Edge, Firefox, Safari, Opera, Samsung Internet, UC Browser, and Internet Explorer; Blink, WebKit, Gecko, Trident, EdgeHTML, and Presto engines; Windows, macOS, iOS, Android, Chrome OS, Linux, FreeBSD, and OpenBSD; and common Apple, Google Pixel, Samsung, and Amazon device signatures. Matching is rule-based and intentionally limited rather than a complete browser-database implementation.

User-agent strings are spoofable and can be customized or misleading. Results are estimates, not proof of a browser, operating system, device, or user identity. Uncommon clients, unusual versions, and modified strings may be partially parsed or classified as unknown. Do not use the result as a security signal.

## Privacy and processing

Parsing is performed in local application code in the browser. The string is not sent to a server or third party by this tool, and it is not persisted by the parser.

## Contract files

- [definition.ts](definition.ts): catalog metadata, status, sample, defaults, and output extension.
- [logic.ts](logic.ts): strict validation, parsing rules, typed result, and JSON output.
- [Tool.tsx](Tool.tsx): local interactive UI using the shared `ToolPanel` design system.
- Focused native tests: [tests/tools/user-agent-parser.test.cjs](../../../tests/tools/user-agent-parser.test.cjs).
