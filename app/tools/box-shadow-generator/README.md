# Box Shadow Generator

**Status:** Implemented

Create and preview CSS `box-shadow` declarations with live controls, eight presets, editable shadow layers, inset mode, color input, and an explicit `none` state.

## Use

The tool starts with the Subtle preset. Use the sliders to adjust offsets, blur, and spread; change inset mode; and edit the color as a CSS color. The native color picker displays the RGB channels of the current color. Since `<input type="color">` cannot represent transparency, its selection applies an opaque RGB color; use the text field to retain alpha transparency such as `rgba(59, 130, 246, 0.4)`.

Add up to five layers and remove any selected layer, including the final layer. **Clear (none)** clears all layers and emits `box-shadow: none;`. Presets and manual edits update the preview and CSS immediately. The Copy CSS action copies a declaration; Copy Full copies a complete `.element` rule; Reset restores the Subtle preset.

## Accepted values and limits

- Offset X and Y: integers in the UI from -50 to 50 pixels.
- Blur: integers from 0 to 100 pixels.
- Spread: integers from -50 to 50 pixels.
- At most five shadow layers.
- Colors: 3/4/6/8 digit hex; comma-separated `rgb()`/`rgba()` with integer RGB channels from 0 to 255 and alpha from 0 to 1; `hsl()`/`hsla()` with hue 0–360 and saturation/lightness 0–100%; or one of the named colors `red`, `blue`, `green`, `yellow`, `orange`, `purple`, `pink`, `brown`, `black`, `white`, `gray`, `cyan`, `magenta`, `lime`, `teal`, `navy`, `maroon`, `coral`, `gold`, `silver`, and `transparent`.
- Unsupported or malformed colors are shown inline and are not applied to the generated CSS. Invalid runtime data throws a useful validation error; it is never silently replaced with a fallback color.

## Output and privacy

The output is CSS (`.css`) shown inline and copied only when requested. Processing is local in the browser; the tool does not intentionally send shadow settings or generated CSS to an external service. Normal site hosting and asset requests are covered by the project privacy page.

## Implementation and tests

- [definition.ts](definition.ts): catalog metadata and CSS output extension.
- [logic.ts](logic.ts): color validation/conversion, bounded layer operations, and CSS generation.
- [Tool.tsx](Tool.tsx): accessible controls, live preview, and inline feedback.
- Focused behavior tests: [tests/tools/box-shadow-generator.test.cjs](../../../tests/tools/box-shadow-generator.test.cjs).
