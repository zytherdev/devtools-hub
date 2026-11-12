# Email Validator

**Status:** Implemented

Email Validator checks the local syntax of one email address. It validates a practical ASCII dot-atom local part and domain labels, then returns a JSON result. All processing is local and offline.

## Usage

Enter one address, for example `alex.lee+updates@example.co.uk`. The validator accepts common local-part characters, including `+`, and permits dots between non-empty local-part atoms. The domain must have at least two labels; every label must follow hostname label rules, and the final label must be a 2- to 63-letter suffix or a syntactically valid punycode label. Domain names are lowercased in the `normalized` field; the original input and local-part casing are preserved.

Valid results include `valid: true`, the parsed `localPart` and `domain`, a normalized address, and a syntax-only message. Invalid address syntax returns `valid: false`, a human-readable `reason`, and `normalized: null`. Empty input, input over 320 characters, and unsupported options produce an error. The `options` object must be empty; no options are currently supported.

The validator intentionally accepts a single unquoted dot-atom address only. It does not parse display names, comments, quoted local parts, address lists, or domain literals. Internationalized domain names must be supplied as ASCII punycode. This is a practical syntax check, not a complete implementation of every email standard.

## Output

Output is formatted JSON with these fields:

- `input`: the exact address supplied.
- `valid`: whether the address passes the supported syntax checks.
- `localPart` and `domain`: parsed components when available.
- `normalized`: the address with the domain lowercased when valid; otherwise `null`.
- `reason`: a syntax failure explanation when invalid; otherwise `null`.
- `message`: confirms syntax-only validation for valid addresses.

## Limits and Privacy

Input is bounded to 320 characters. A syntactically valid address must also fit within the 254-character email-address limit; the local part is limited to 64 characters, the domain to 253 characters, and each domain label to 63 characters. Serialized output is limited to 8 KiB.

This tool does **not** perform DNS, MX, SMTP, mailbox-existence, or deliverability checks. A valid result means only that the address matches this tool's local syntax policy; it does not establish that the domain or mailbox exists or can receive mail. No input is sent over the network.

## Contribution Files

- [definition.ts](definition.ts): catalog metadata, options, and sample input.
- [logic.ts](logic.ts): bounded local parser and JSON result.
- [Tool.tsx](Tool.tsx): shared `UniversalTool` interface.
- Focused tests: [tests/tools/email-validator.test.cjs](../../../tests/tools/email-validator.test.cjs).
