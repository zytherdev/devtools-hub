# JavaScript Minifier

**Status:** Implemented

Minify supported JavaScript source locally by parsing it into an AST and generating compact code. This is a syntax-preserving formatter/minifier, not a bundle-size optimizer: it does not perform dead-code elimination, identifier mangling, transpilation, or bundling.

## Availability and interface

Available at `/js-minifier`. The page includes an input editor, sample, inline error/status feedback, actual character-count comparison, copy, and **Download .js** (saved as `minified.js`). Copy/download become available only after a successful run. Editing the source or a failed run clears the prior result. Press Ctrl+Enter (or ⌘+Enter on macOS) while the input editor is focused to minify. There are no configurable parser options.

## Example input

The page's **Load sample** button and catalog metadata use this same example:

```js
/*! Example license */
const square = (value) => value * value;
export default square;
```

The module export is intentionally not at the start of a line; the parser selection tries script syntax, then module syntax when script parsing fails.

## Supported syntax and limitations

Parsing and generation use the installed Esprima 4 and Escodegen packages. The tool supports JavaScript syntax accepted by those versions (the ES2017-era grammar), including ordinary `import`/`export` module declarations. This is not a promise of support for every modern JavaScript proposal or syntax accepted by current browsers. JSX, TypeScript, Flow, optional chaining, nullish coalescing, and other syntax these parser/generator versions do not support are rejected; no JSX transformation is performed.

Ordinary comments are removed. Block comments whose content begins with `!`—the conventional `/*! ... */` license-comment form—are retained. Generated output is compact, but may be larger than the input; the UI reports growth accurately rather than claiming a negative saving or reduction.

Input is limited to 250,000 JavaScript string characters. Parsing and generation run synchronously in the browser; the explicit bound limits main-thread work. No worker is used. The source is not uploaded by the tool. Minified output should be reviewed and tested in the target environment before production use.

## Contribution files

- [definition.ts](definition.ts): tool metadata, canonical sample, defaults, and `.js` download extension.
- [logic.ts](logic.ts): bounded script/module parsing, license-comment preservation, compact generation, and size summary.
- [Tool.tsx](Tool.tsx): accessible local input/output interface.
- Focused behavior tests: [tests/tools/js-minifier.test.cjs](../../../tests/tools/js-minifier.test.cjs).

Before submitting changes, run `npm run check`. See [Adding a tool](../../../docs/adding-a-tool.md) and [Architecture](../../../docs/architecture.md).
