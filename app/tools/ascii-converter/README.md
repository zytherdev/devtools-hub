# ASCII Converter

**Status:** Implemented

Converts ASCII characters to space-separated numeric codes and back. Choose the direction and the decimal, hexadecimal, or binary representation in the tool options.

## Usage and options

The options object accepts exactly the following text values:

- `mode`: `text-to-codes` or `codes-to-text` (default: `text-to-codes`).
- `base`: `decimal`, `hex`, or `binary` (default: `decimal`). Defines the numeric representation for both encoding and decoding.

For example, the input `ASCII` with the default options produces `65 83 67 73 73`. To decode, use `mode: "codes-to-text"`; the hexadecimal input `41 53 43 49 49` requires `base: "hex"`, and binary input requires `base: "binary"`.

Numeric input must contain a sequence of digits separated by one or more whitespace characters. Each item must use only digits valid for the chosen base, with no `0x`/`0b` prefixes, punctuation, or separators such as commas. Each value must be in the inclusive range 0 to 127. Leading zeros are accepted; hexadecimal digits are case-insensitive. Empty input or input consisting only of whitespace produces empty output.

## ASCII and control characters

The converter supports the full 7-bit ASCII range. In text-to-codes mode, each character must have a Unicode code point between 0 and 127. C0 controls (0–31), printable characters (32–126), and DEL (127) are preserved and encoded. Any code point above 127—including accented characters, typographic punctuation, and emojis—is rejected, with its position and Unicode value reported; nothing is transliterated or silently replaced.

In codes-to-text mode, all values between 0 and 127 are converted to the corresponding character. Printable ASCII (32–126) appears normally; controls (0–31 and 127) are included literally and may appear invisible or produce special effects in some editors and terminals. Take care when copying these controls. This tool handles only 7-bit ASCII; it is not a decoder for binary files or arbitrary bytes.

## Limits and privacy

Input is limited to 100,000 UTF-16 code units, and generated output to 800,000 characters. Invalid options, malformed items, and out-of-range numbers return an explanatory error. Processing is deterministic and entirely local in the browser: no data is sent to external services or stored by the tool.

## Example

Input: `ASCII`<br>
Options: `{"mode":"text-to-codes","base":"decimal"}`<br>
Output: `65 83 67 73 73`
