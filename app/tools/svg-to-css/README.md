# SVG to CSS Converter

**Status:** Implemented

Convert a pasted SVG into a CSS background-image rule, a mask rule (including WebKit properties), a `content` pseudo-element rule, or a standalone `url(...)` value. Generated output is CSS and downloads with the `.css` extension.

## Usage and options

Paste SVG markup and choose a format. CSS class selectors are enabled by default (`.icon`); when disabled, background and mask rules target `:root`, while content uses `:root::before`. URL-only mode returns a quoted CSS `url(...)` value without a selector.

“Remove XML declaration/comments” strips the leading XML declaration and XML comments, and trims outer whitespace. “Compact CSS formatting” removes formatting whitespace in the generated CSS; it does not rewrite the encoded SVG. These controls do not perform general SVG optimization.

The editor offers local sample SVGs, a preview generated only after conversion, copy feedback, and Ctrl+Enter (or ⌘+Enter) while focused in the SVG editor.

## Validation and limitations

Input is limited to 200,000 JavaScript characters. The local structural scanner checks XML tag nesting, quoted/unique attributes, XML character/entity references, one `<svg>` document root, and a `viewBox` or both `width` and `height` attributes. It is not a complete XML parser or SVG conformance validator. It does not check namespace bindings, SVG attribute semantics, rendering compatibility, or sanitize SVG content. DTD/custom entity declarations are unsupported; only predefined and numeric XML entity references are accepted.

No third-party parser is installed or used. Processing and preview happen locally in the browser; the SVG is not intentionally sent to a provider. Review generated CSS and input content before use, especially for SVGs from untrusted sources.

## Files and checks

- [definition.ts](definition.ts): canonical tool metadata and `.css` output extension.
- [logic.ts](logic.ts): bounded scanner, data URI encoding and CSS generation.
- [Tool.tsx](Tool.tsx): local editor, options, preview and accessible feedback.
- Focused tests: [tests/tools/svg-to-css.test.cjs](../../../tests/tools/svg-to-css.test.cjs).

Run `node --test tests/tools/svg-to-css.test.cjs` for the focused test file. See [Adding a tool](../../../docs/adding-a-tool.md) and [Architecture](../../../docs/architecture.md) for project conventions.
