# RSA Key Pair Generator

**Status:** Implemented

Generate RSA public/private key pairs in the browser using the Web Crypto API. The page supports RSA-OAEP for encryption and RSA-PSS for signatures, with SHA-256, exponent 65537, and bounded modulus lengths of 2048, 3072, or 4096 bits.

## Usage and output

Choose key size, purpose, and PEM or JWK format, then select **Generate key pair**. No input text is required. The public key is shown after generation. Private-key output remains blank and hidden until **Reveal private key** is explicitly selected; its copy action is disabled while hidden. **Clear keys** removes the page's references to the generated pair but cannot guarantee secure erasure from runtime memory.

PEM output uses SubjectPublicKeyInfo (`BEGIN PUBLIC KEY`) for the public key and unencrypted PKCS#8 (`BEGIN PRIVATE KEY`) for the private key. JWK output includes public fields for the public key and all private parameters in the private JWK. These are ordinary export formats; they do not encrypt or password-protect the private key.

## Privacy

Key generation and export run in the user's browser through `crypto.subtle`; this implementation does not send key material to the application server or log it. Web Crypto requires a supported browser and a secure context (normally HTTPS or localhost). The private `CryptoKey` must be extractable so it can be exported, which means this tool is not a non-exportable hardware-backed key store.

This does not protect keys from a compromised browser/device, malicious extensions, page inspection, screenshots, clipboard history, or anyone who sees copied or revealed output. Do not paste private keys into untrusted tools or share them. Once revealed, copied, or downloaded elsewhere, the key is outside this page's privacy boundary. Clearing the page does not promise memory zeroization.

## Cryptographic limitations

- RSA-OAEP is configured with SHA-256 and intended for small plaintexts. Do not encrypt large files or messages directly with RSA; use a reviewed hybrid-encryption design.
- RSA-PSS is configured with SHA-256. Signing and verification must use compatible PSS salt-length parameters and a trusted protocol/key distribution process.
- This tool only generates and exports keys. It does not encrypt, decrypt, sign, verify, validate certificates, wrap private keys, or manage key rotation/revocation.
- A generated key is not automatically appropriate for a particular protocol, compliance regime, deployment, or threat model. Have production key-management needs reviewed independently.

## Implementation and tests

- [definition.ts](definition.ts): implemented tool metadata and defaults.
- [logic.ts](logic.ts): bounded options, Web Crypto generation, PEM/JWK export.
- [Tool.tsx](Tool.tsx): browser-only UI and private-output reveal control.
- Focused tests: [tests/tools/rsa-key-generator.test.cjs](../../../tests/tools/rsa-key-generator.test.cjs).

Run the focused tests with `node --test tests/tools/rsa-key-generator.test.cjs` from the repository root.
