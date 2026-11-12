# Hash Verifier

Compare locally entered text with a user-provided expected digest. Hashing runs in the browser with the Web Crypto API; no text or digest is uploaded.

## Usage

1. Enter the original text.
2. Paste the expected hexadecimal digest.
3. Choose the matching algorithm and select **Verify digest**.

The result reports whether the values match and shows the computed digest. Hexadecimal letters are case-insensitive. The expected digest must contain exactly the algorithm's full digest length, with no `0x` prefix, whitespace, or separators.

## Supported algorithms

- SHA-256: 64 hexadecimal characters.
- SHA-384: 96 hexadecimal characters.
- SHA-512: 128 hexadecimal characters.

MD5 is not supported by this tool. Hashes cover the input's UTF-8 encoding, including spaces and line breaks exactly as entered.

## Limits and privacy

Text is limited to 1 MiB after UTF-8 encoding. The verifier requires browser Web Crypto, which is generally available in secure browser contexts. All processing is local and offline. The digest comparison checks every character when lengths match; JavaScript execution is not guaranteed to be constant-time. This utility verifies equality only and does not establish the authenticity or origin of a digest.
