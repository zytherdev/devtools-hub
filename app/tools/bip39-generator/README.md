# BIP39 Mnemonic Generator

**Status:** Implemented

Generate standard English BIP39 mnemonic phrases locally using browser Web Crypto entropy and the official English BIP39 wordlist. The tool supports strengths of 128, 160, 192, 224, and 256 bits, which produce 12, 15, 18, 21, and 24 words respectively.

## Use

Select a strength and choose **Generate mnemonic**. The generated phrase is masked by default. Use **Reveal phrase** to display it, **Copy phrase** to explicitly copy it through the browser clipboard, or **Clear** to remove it from the page. Input text is not accepted.

## Security and privacy

Generation is local. Each mnemonic is built from fresh bytes returned by the browser’s `crypto.getRandomValues`; there is no fallback to `Math.random`, timestamps, user input, or other weak entropy. If Web Crypto is unavailable or fails, generation stops with an error. The BIP39 encoding uses the maintained, audited, browser-compatible `@scure/bip39` package and its official English list. There are no network requests, analytics, or local storage. The phrase remains in page memory until cleared or the page is left; revealing or copying it may expose it, so handle it as sensitive information.

This tool only generates and locally displays a mnemonic. It does not store phrases, connect to wallets, or provide recovery functionality.

## Dependency

- `@scure/bip39` **2.4.0**, MIT license. The package metadata and license are available at [npm](https://www.npmjs.com/package/@scure/bip39) and [GitHub](https://github.com/paulmillr/scure-bip39).

## Files

- [definition.ts](definition.ts): tool metadata, default strength, and route.
- [logic.ts](logic.ts): Web Crypto entropy handling, input/options validation, and BIP39 encoding.
- [Tool.tsx](Tool.tsx): masked-by-default interface with explicit reveal, copy, and clear actions.
- Focused tests: [tests/tools/bip39-generator.test.cjs](../../../tests/tools/bip39-generator.test.cjs).
