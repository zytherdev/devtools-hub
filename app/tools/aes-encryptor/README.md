# AES Encryptor/Decryptor

**Status:** Implemented

Encrypt and decrypt text in your browser with password-derived AES-256-GCM and authenticated payloads.

## Usage

Choose **Encrypt text** or **Decrypt payload**, enter plaintext or the complete JSON payload, and provide a password. Encryption requires a passphrase of at least 12 Unicode characters. For decryption, use the exact original passphrase. Passwords are masked by default. The tool returns either a versioned JSON payload or the decrypted plaintext. It does not save the result for you; copy and safely store the payload yourself.

The payload format is JSON with version `1`, `AES-256-GCM`, PBKDF2 with SHA-256 and 310,000 iterations, a 16-byte random salt, a 12-byte random nonce, and base64url-encoded ciphertext including the 128-bit GCM authentication tag. The password is never included. Each encryption obtains a fresh salt and cryptographically random nonce. Nonce duplicates are detected and rejected for the lifetime of the current page, and the tool refuses more than 10,000 encryption attempts in that page session. A page reload starts a new in-memory nonce history; random 96-bit nonces make cross-session collisions extraordinarily unlikely, but cannot mathematically guarantee global uniqueness.

## Limits and validation

- Plaintext: at most 1 MiB UTF-8, including multibyte text.
- Password: non-empty and at most 4 KiB UTF-8; encryption requires at least 12 Unicode characters.
- Encrypted JSON payload: at most 2 MiB, with a strict versioned structure and canonical base64url fields.
- Empty plaintext is supported. Unsupported parameters, malformed encodings, truncated ciphertext and modified ciphertext are rejected. Wrong passwords and authentication failures return a generic decryption error.

## Privacy and limitations

All encryption and decryption run locally with the browser's Web Crypto API. This tool's logic makes no network requests and does not log the plaintext, password, or output. The page does not persist them; they remain in the active page until cleared or the page is closed. Browser extensions, a compromised device, malicious page scripts, clipboard history, or someone with access to the screen or browser can still expose data. Use a secure browser context and a trusted device.

There is no password recovery, key escrow, or server-side copy. If you lose either the password or the only copy of the encrypted payload, the original plaintext cannot be recovered. Keep independent secure backups of both the payload and password, and do not store them together. Anyone who obtains both can decrypt the data. PBKDF2 raises the cost of password guessing, but does not protect weak or reused passwords. AES-GCM detects unauthorized changes but does not hide payload length or metadata, and this utility has not been independently audited for high-assurance use.

## Implementation files

- [definition.ts](definition.ts): catalog metadata and dynamic route identity.
- [logic.ts](logic.ts): Web Crypto, password derivation, payload validation and limits.
- [Tool.tsx](Tool.tsx): interactive local encryption/decryption UI.
- Focused native tests: [tests/tools/aes-encryptor.test.cjs](../../../tests/tools/aes-encryptor.test.cjs).
