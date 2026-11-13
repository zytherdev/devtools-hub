# SSL Checker

**Status:** Implemented

Decode one supplied PEM X.509 certificate locally, report its validity dates and whether those dates include the current device clock, and optionally compare a DNS hostname or IP address with the certificate's subject alternative names (SANs). This is a check of provided certificate text, not a live inspection of a remote server.

## Availability

Available at `/ssl-checker` through the shared dynamic tool route. The page starts with empty certificate and hostname fields. No sample certificate, hostname, or certificate contents are prefilled.

## Input and limits

- Required: exactly one PEM `CERTIFICATE` block. The existing certificate decoder rejects malformed PEM, multiple blocks, other PEM labels, and extra content.
- Optional: one DNS hostname, IPv4 address, or IPv6 address, without a scheme, path, port, or whitespace. The maximum length is 253 characters.
- PEM text is limited to 256 KiB; decoded certificate data is limited to 128 KiB. Certificate decoding also has DER-node, depth, and SAN-entry bounds documented by the [Certificate Decoder](../certificate-decoder/README.md).
- The shared `run(input, options)` API accepts only the optional string option `hostname`; unknown options are rejected.

## Checks and output

The tool first decodes the PEM certificate. Only after successful decoding does it report:

- `validityCheck`: `valid`, `not-yet-valid`, or `expired`, based solely on the decoded `notBefore`/`notAfter` timestamps compared with the local device clock at check time. Boundary times are inclusive.
- `hostnameCheck`: `not-requested`, `matched`, `mismatched`, or `unavailable`. Matching uses DNS or IP SAN entries only. DNS matching is case-insensitive, allows a single wildcard label (for example, `*.example.test` matches `www.example.test`, not `a.www.example.test`), and does not fall back to the subject common name. An absent SAN list is unavailable; a present SAN list with no match is a mismatch.
- `subjectAlternativeNames`: the decoded SAN entries.
- `cryptographicValidation`: explicit `false` values for signature verification, trust-chain validation, and revocation checking.

`run()` returns a formatted JSON string containing these results. The UI presents the date result, hostname comparison, and SAN list separately from the decoding-success notice.

## Privacy and limitations

Certificate text and the optional hostname are processed in the browser using local code. This tool does not transmit them, make a request to the supplied hostname, save them to browser storage, or log their contents. The values are held in page memory until cleared or the page is closed. As with any hosted page, normal website hosting and asset requests still occur.

A successful decode means only that supported certificate fields could be read. A `valid` date result is not a trust decision. This tool does **not** make a live TLS connection or handshake; inspect a server's currently served certificate; cryptographically verify a certificate signature; build or validate a certificate chain or CA trust; check revocation, key usage, or policy; or determine that the certificate is trustworthy. Hostname matching is a comparison against decoded SAN data and does not establish that the certificate is trusted or is currently used by a remote server. The local system clock may be inaccurate.

No additional package dependencies are required.

## Contribution files

- [definition.ts](definition.ts): metadata and shared-route catalog information.
- [logic.ts](logic.ts): bounded local decoding orchestration, date assessment, SAN matching, and `run()` API.
- [Tool.tsx](Tool.tsx): functional browser-local UI using shared `ToolPanel` styling.
- Focused tests: [tests/tools/ssl-checker.test.cjs](../../../tests/tools/ssl-checker.test.cjs).
