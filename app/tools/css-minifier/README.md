# CSS Minifier

**Status:** Implemented

Minify CSS by removing ordinary comments and unnecessary whitespace while preserving selector descendant combinators, strings, and the internal whitespace of custom property values. License comments beginning with `/*!` are retained.

## Availability and interface

Available at `/css-minifier`. The page provides a CSS input area, a sample, inline validation/status messages, current-result size statistics, copy, and a **Download .css** action that saves `minified.css`. Press Ctrl/⌘ + Enter while the input is focused to minify. There is no Advanced mode or configurable options panel.

## Example input

The catalog example is available from the page's **Load sample** button and in [definition.ts](definition.ts):

```css
.card { color: #222; padding: 1rem; }
```

## Processing, validation, and limits

Processing is local in the browser; the CSS input is not uploaded. Input is limited to 1,000,000 characters. The lightweight lexical scanner reports unterminated comments or strings and unmatched/unclosed braces, brackets, or parentheses. It is not a full CSS parser or optimizer: it does not rewrite colors, remove units, reorder declarations, or validate every CSS grammar rule. Custom-property values are kept verbatim (including comments and whitespace inside the value) while surrounding declarations can still be minified.

## Contribution files

- [definition.ts](definition.ts): tool metadata, example input, and `.css` output extension.
- [logic.ts](logic.ts): typed `run(input, options)` entry point and scanner.
- [Tool.tsx](Tool.tsx): accessible client-side input/output interface.
- Focused tests: [tests/tools/css-minifier.test.cjs](../../../tests/tools/css-minifier.test.cjs).

Before submitting changes, run `npm run check`. See [Adding a tool](../../../docs/adding-a-tool.md) and [Architecture](../../../docs/architecture.md).
