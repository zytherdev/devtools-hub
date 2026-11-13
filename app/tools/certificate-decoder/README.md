# Certificate Decoder

**Status:** Implemented

Decode one bounded PEM or DER X.509 certificate locally and inspect its subject, issuer, serial number, validity, supported subject alternative names, public-key metadata, and signature algorithm.

## Availability

Available at `/certificate-decoder`. Paste PEM text or choose a PEM/DER certificate file. The tool accepts one `CERTIFICATE` PEM block only; certificate chains, PKCS#7 bundles, private-key blocks, and non-certificate PEM labels are rejected.

## Example input

The tool deliberately has no sample certificate or prefilled input. Its catalog `exampleInput` is empty; the JSON representation is:

~~~json
""
~~~

## Default options

The options panel starts with this JSON:

~~~json
{}
~~~

There are no options. The `run(input, options)` contract accepts PEM text and an empty options object. Use `decodeCertificate(Uint8Array)` for binary DER input. Bounds and parser checks are defined in [logic.ts](logic.ts).

## Processing and privacy

Parsing is done in the browser; certificate contents are not intentionally transmitted, logged, or persisted by this tool. The input field begins empty, and the displayed result exists in page memory until cleared or the page is closed. Normal website hosting and asset requests still occur. There are no additional package dependencies; parsing uses bounded tool-local DER logic and browser-standard APIs.

PEM source text is limited to 256 KiB and decoded certificate DER to 128 KiB. The DER reader enforces definite, minimally encoded lengths, nesting of at most 32, and at most 5,000 inspected elements. The UI accepts binary DER files up to 128 KiB. Supported certificate fields are subject/issuer attributes, serial number, UTC or GeneralizedTime validity, DNS/email/URI/IP and directory-name SANs, common RSA/EC/DSA/EdDSA/XDH public-key metadata, and recognized signature-algorithm names. Unsupported SAN forms are omitted; unfamiliar attribute and algorithm OIDs remain visible as OID identifiers.

**Decoding is not trust-chain validation.** No certificate signature is verified; no issuer chain, trust store, revocation status, hostname, policy, or current validity is checked. A decoded certificate must not be treated as trusted based on this tool. Certificate subject/SAN values are displayed as untrusted input. This tool does not accept or request private keys.

## Contribution files

- [definition.ts](definition.ts): metadata, category, status, sample input, defaults, and output extension.
- [logic.ts](logic.ts): bounded PEM/DER parsing and the typed `run(input, options)` entry point.
- [Tool.tsx](Tool.tsx): UI entry connected through [componentRegistry](../componentRegistry.ts).
- lib/: helpers private to this tool, when needed.
- Focused tests: [tests/tools/certificate-decoder.test.cjs](../../../tests/tools/certificate-decoder.test.cjs).

Before submitting changes, run npm run check. See [Adding a tool](../../../docs/adding-a-tool.md) and [Architecture](../../../docs/architecture.md).
