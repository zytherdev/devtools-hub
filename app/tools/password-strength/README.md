# Password Strength Checker

**Status:** Implemented

Get a bounded, local estimate of password strength and practical suggestions for improvement. The result reports a score from 0 to 4, a descriptive level, the character count, and feedback. The entered password is never included in the result.

## Limits and behavior

The checker accepts passwords of up to 256 Unicode characters. Its small, deterministic heuristic considers length, character variety, a short list of common passwords, repeated characters, and a few obvious sequences. It does not estimate real-world cracking time, check breached-password databases, recognize personal context, or model every attack technique. The estimate is not a guarantee of security; do not use it as the only basis for choosing or approving a password.

The `run(password, options)` entry point accepts only an empty options object. Unknown options, non-string passwords, and inputs beyond the character limit are rejected. An empty password is accepted and receives a very weak result with guidance.

## Processing and privacy

All strength evaluation runs locally in the browser. The checker does not save or transmit the entered password, and the password is not copied into the result. Avoid entering passwords into shared or untrusted devices; normal site hosting and asset requests are covered by the project privacy page.

## Contribution files

- [definition.ts](definition.ts): tool metadata and defaults.
- [logic.ts](logic.ts): bounded local heuristic and strict option validation.
- [Tool.tsx](Tool.tsx): password-masked, length-bounded interface.
- Focused tests: [tests/tools/password-strength.test.cjs](../../../tests/tools/password-strength.test.cjs).
