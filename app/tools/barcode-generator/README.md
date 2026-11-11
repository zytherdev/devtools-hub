# Barcode generator

**Status:** Implemented

Generates barcodes as SVGs in the browser using the local `bwip-js` library. The output can be previewed on the page and downloaded as `.svg`.

## Formats and options

Enter a value and select a format:

- `code128` (default): general text, up to 256 UTF-8 bytes.
- `code39`: text supported by the Code 39 symbology.
- `ean13`: 12 or 13 digits.
- `ean8`: 7 or 8 digits.
- `upca`: 11 or 12 digits.
- `itf14`: 13 or 14 digits.

Default options:

~~~json
{"format":"code128","scale":"3","height":"12","includeText":"true"}
~~~

- `scale`: integer from 1 to 8.
- `height`: height in millimeters, from 5 to 40.
- `includeText`: `true` to display the human-readable content below the bars or `false` to hide it.

The library validates the characters and requirements for each symbology. Check digits and reading rules vary by format; verify your inventory/printing system specifications before using this in production.

## Limits and privacy

The input cannot exceed 256 UTF-8 bytes or contain control characters or line breaks. The final SVG is limited to 500,000 characters. Encoding is local, with no data sent or external services queried.

## Contribution files

- [definition.ts](definition.ts): metadata, default format, and options.
- [logic.ts](logic.ts): validation and SVG rendering with `bwip-js`.
- [Tool.tsx](Tool.tsx): shared `UniversalTool` interface.
- Tests: [tests/tools/barcode-generator.test.cjs](../../../tests/tools/barcode-generator.test.cjs).
