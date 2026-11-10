# Color Converter

**Status:** Implemented

Convert HEX, RGB, HSL, HSV, CMYK, and supported named colors. Preview color harmonies, WCAG relative luminance, and the better-contrast black/white text choice.

## Availability

Available at /color-converter. All parsing and conversion run locally in the browser.

## Example input

The catalog sample is stored in [definition.ts](definition.ts):

~~~json
"#3b82f6"
~~~

## Default options

The logic entry point defaults to HEX output:

~~~json
{"format":"hex"}
~~~

The optional `format` value is one of `hex`, `rgb`, `hsl`, `hsv`, `cmyk`, or `name`; other options are rejected. Inputs are limited to 128 characters. Accepted input syntax is:

- HEX: `#abc` or `#aabbcc`.
- RGB: `rgb(59, 130, 246)` (integer channels, 0–255).
- HSL: `hsl(217, 91%, 60%)` (integer hue 0–360; saturation/lightness 0–100%).
- HSV: `hsv(217, 76%, 96%)` (integer hue 0–360; saturation/value 0–100%).
- CMYK: `cmyk(76%, 47%, 0%, 4%)` (integer percentages 0–100%).
- 23 case-insensitive names: `black`, `white`, `red`, `green`, `blue`, `yellow`, `cyan`, `magenta`, `orange`, `purple`, `pink`, `brown`, `gray`, `lightgray`, `darkgray`, `olive`, `lime`, `teal`, `navy`, `maroon`, `coral`, `gold`, and `silver`.

Alpha/transparency, fractional channels, other CSS color syntaxes, and additional CSS color names are not supported. Output is rounded to whole percentages where applicable. Editing the input clears previous results; changing output format only reformats the last committed valid color.

## Processing and privacy

Complementary color rotates HSL hue by 180° while preserving saturation and lightness. Contrast uses WCAG relative luminance and selects the higher-contrast choice between black and white. This foreground recommendation alone is not a certification of the contrast compliance of a complete interface. The tool does not intentionally upload input; standard site hosting and asset requests are described in the project privacy page.

## Contribution files

- [definition.ts](definition.ts): metadata, category, status, sample input, defaults, and output extension.
- [logic.ts](logic.ts): typed run(input, options) entry point and input validation.
- [Tool.tsx](Tool.tsx): UI entry connected through [componentRegistry](../componentRegistry.ts).
- lib/: helpers private to this tool, when needed.
- Focused tests: [tests/tools/color-converter.test.cjs](../../../tests/tools/color-converter.test.cjs).

Before submitting changes, run npm run check. See [Adding a tool](../../../docs/adding-a-tool.md) and [Architecture](../../../docs/architecture.md).
