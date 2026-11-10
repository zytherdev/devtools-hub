# CSS Beautifier

**Status:** Implemented

Format CSS locally with Prettier's CSS/PostCSS parser. The formatter supports modern CSS syntax understood by the installed Prettier parser, including nested rules and current at-rules, and preserves the contents of quoted strings.

## Availability and output

Available at `/css-beautifier`. The page shows formatted CSS in a read-only output field and offers a copy-to-clipboard button. It does **not** currently provide a `.txt` or `.css` download; the catalog output extension is `css` to describe the formatted content, not a download feature.

## Controls and defaults

- **Indent:** 2 or 4 spaces, or tabs, through the shared formatter controls.
- **Line width:** 100 columns by default; accepted values are whole numbers from 40 to 160 and are passed to Prettier as `printWidth`.
- **End output with a newline:** off by default. When enabled, the result ends in one LF newline; when disabled, the formatter removes Prettier's final newline.

The sample in [definition.ts](definition.ts) is loaded by the page. Its JSON representation is:

~~~json
".layout{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));--space:1rem;gap:var(--space);content:\"keep   these spaces\"}@layer components{@container card (width>20rem){.layout{padding:2rem;& .title{color:oklch(45% .16 260)}}}}@starting-style{.layout{opacity:0}}"
~~~

The catalog defaults, which correspond to the formatter defaults, are:

~~~json
{
  "indentSize": "2",
  "indentChar": " ",
  "printWidth": "100",
  "endWithNewline": "false"
}
~~~

The `run(input, options)` entry point also accepts `wrapLineLength` as an alias for `printWidth`; supplying both is an error. `indentSize` must be a whole number from 1 to 8, `indentChar` must be a space or tab, and `endWithNewline` must be the string `"true"` or `"false"` in the generic tool options contract. Unknown options are rejected.

## Limits and privacy

Formatting is performed in the browser with the locally bundled Prettier standalone package and CSS/PostCSS plugin; pasted CSS is not intentionally uploaded. Input is limited to 100,000 JavaScript characters to bound synchronous parsing/printing work and reduce the risk of freezing the page on large inputs. Prettier reports CSS syntax errors; not every future or non-standard CSS extension is necessarily supported by its parser. Clipboard use occurs only when the user presses **Copy** and is subject to browser permission.

## Contribution files

- [definition.ts](definition.ts): metadata, sample, defaults, and output content type.
- [logic.ts](logic.ts): typed `run(input, options)`, validation, limits, and local formatting.
- [Tool.tsx](Tool.tsx): local newline control and shared formatter integration.
- Focused tests: [tests/tools/css-beautifier.test.cjs](../../../tests/tools/css-beautifier.test.cjs).

Run `npm run lint`, `npm run typecheck`, and `node --test tests/tools/css-beautifier.test.cjs` while working on this tool. See [Adding a tool](../../../docs/adding-a-tool.md) and [Architecture](../../../docs/architecture.md).
