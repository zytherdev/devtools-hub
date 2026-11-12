# Hash Generator
**Status:** Implemented
Generate SHA-256, SHA-384, or SHA-512 hashes from text locally with browser Web Crypto.
## Availability
Available at /hash-generator. The connected processor downloads results as .txt.
## Example input
The catalog sample is stored in [definition.ts](definition.ts) and can be loaded from the tool page. Its JSON representation is:
~~~json
"The quick brown fox jumps over the lazy dog"
~~~
## Default options
The options panel starts with this JSON:
~~~json
{
  "algorithm": "SHA-256"
}
~~~
The only accepted option is `algorithm`, which must be `SHA-256`, `SHA-384`, or `SHA-512`. Results are lowercase hexadecimal digests. The UTF-8 encoded input limit is 1 MiB; empty text is valid.
## Processing and privacy
Hashing uses the browser's Web Crypto `SubtleCrypto.digest` API. Text is encoded as UTF-8 and processed locally; input is not intentionally uploaded. The tool requires browser Web Crypto, which is available in secure browser contexts. MD5 is not offered. These hashes are not keyed message authentication codes and do not make weak passwords safe to store.
## Contribution files
- [definition.ts](definition.ts): metadata, category, status, sample input, defaults, and output extension.
- [logic.ts](logic.ts): typed asynchronous `run(input, options)` entry point and input validation.
- [Tool.tsx](Tool.tsx): UI entry connected through [componentRegistry](../componentRegistry.ts).
- lib/: helpers private to this tool, when needed.
- Focused tests: [tests/tools/hash-generator.test.cjs](../../../tests/tools/hash-generator.test.cjs).
Before submitting changes, run npm run check. See [Adding a tool](../../../docs/adding-a-tool.md) and [Architecture](../../../docs/architecture.md).
