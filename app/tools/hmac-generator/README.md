# HMAC Generator
**Status:** Implemented
Generate SHA-256, SHA-384, or SHA-512 HMACs from text locally with browser Web Crypto and a user-provided secret key.

## Availability
Available at /hmac-generator. The connected processor downloads results as .txt.

## Example input
The catalog sample is stored in [definition.ts](definition.ts) and can be loaded from the tool page. Its JSON representation is:
~~~json
"The quick brown fox jumps over the lazy dog"
~~~

## Options
Enter a non-empty secret key, select `SHA-256`, `SHA-384`, or `SHA-512`, and choose `hex`, `base64`, or `base64url` output. Hex output uses lowercase letters. Text and the key are encoded as UTF-8. Empty message text is valid. Input is limited to 1 MiB and the key to 64 KiB, measured after UTF-8 encoding.

## Processing and privacy
HMAC generation uses the browser's Web Crypto `SubtleCrypto.importKey` and `SubtleCrypto.sign` APIs. The key and message are processed locally in the browser and are not transmitted or logged by this tool. Use a secure browser context with Web Crypto support. The key field is masked by default and can be revealed with its Show control. Clear the key when you are finished. HMAC is not encryption or a password hash.

## Contribution files
- [definition.ts](definition.ts): metadata, category, status, sample input, defaults, and output extension.
- [logic.ts](logic.ts): typed asynchronous `run(input, options)` entry point, validation, and local HMAC generation.
- [Tool.tsx](Tool.tsx): UI entry connected through [componentRegistry](../componentRegistry.ts).
- Focused tests: [tests/tools/hmac-generator.test.cjs](../../../tests/tools/hmac-generator.test.cjs).
Before submitting changes, run npm run check. See [Adding a tool](../../../docs/adding-a-tool.md) and [Architecture](../../../docs/architecture.md).
