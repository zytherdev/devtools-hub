# Gradient Generator

**Status:** Implemented

Create and preview CSS linear, radial, and conic gradients locally. Edit color stops, choose radial shape and position, select presets, copy CSS, or download a `.css` rule.

## Options and output

- Gradient types: linear, radial, and conic. Linear and conic gradients expose an angle control; radial gradients expose shape (`circle` or `ellipse`) and position controls and do not use an angle.
- Color stops: 2–6, with positions from 0% to 100%. Stops are ordered by position when CSS is generated. Invalid colors or positions are shown as errors and block the CSS output rather than being discarded or clamped.
- Colors: supported HEX, RGB(A), HSL(A), and a documented small set of common named colors. CSS color names outside that set are not accepted.
- Output: a CSS declaration, a complete `.gradient` rule, and a downloadable `gradient.css` file.
- Presets and random gradients are starting points; any edit clears the selected-preset state.

## Limitations

This is a local CSS gradient editor, not a general CSS color parser. Radial position choices are the provided center/edge/corner keywords; arbitrary CSS positions and radial sizing keywords are not offered. The generated output is a single `background` declaration in a `.gradient` rule.

## Processing and privacy

Gradient generation and preview run in the browser. Copy uses the browser clipboard API, and the download is created locally in the browser. Gradient input is not sent to a remote processor.

## Contribution files

- [definition.ts](definition.ts): catalog metadata and `.css` output extension.
- [logic.ts](logic.ts): validation, gradient CSS generation, presets, and stop helpers.
- [Tool.tsx](Tool.tsx): accessible interactive editor connected through [componentRegistry](../componentRegistry.ts).
- Focused tests: [tests/tools/gradient-generator.test.cjs](../../../tests/tools/gradient-generator.test.cjs).

Before submitting changes, run `npm run check`. See [Adding a tool](../../../docs/adding-a-tool.md) and [Architecture](../../../docs/architecture.md).
