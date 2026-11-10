# HTML to JSX Converter

**Status:** Implemented

Convert HTML fragments to JSX locally in the browser. The parser supports nested markup, raw-text `script`/`style` contents, common implicit `li`/`p` closures, JSX attribute mappings, inline styles, and common named/numeric character references.

## Availability and output

Available at `/html-to-jsx`. Copy the converted source or download it as a `.jsx` file.

## Example input

The catalog sample is stored in [definition.ts](definition.ts) and can be loaded from the tool page:

~~~html
<div class="container">
  <h1>Hello, World!</h1>
  <p style="color: blue; font-size: 16px;">This is a sample HTML to JSX conversion.</p>
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
    <li>Item 3</li>
  </ul>
  <input type="text" placeholder="Enter text" disabled />
</div>
~~~

## Options and limits

The UI lets you preserve comments or whitespace, choose whether empty elements are self-closing, convert inline styles to JSX objects, and choose `className`/`class` and `htmlFor`/`for` attribute spellings. Options are validated by [logic.ts](logic.ts). Input is limited to 100,000 characters, nesting to 100 elements, and generated output to 1,000,000 characters.

## Processing, privacy, and security limitations

Conversion runs in the browser and does not intentionally upload input. The converter removes inline event-handler attributes and filters selected obvious script/data URL schemes on URL-bearing attributes. This is targeted output filtering, **not an HTML security sanitizer**; it does not make arbitrary HTML safe to render or execute. Validate output for the needs of the application that consumes it. Standard site hosting and asset requests are described on the project privacy page.

The named-entity decoder handles a small local set of common entities plus numeric references. Unknown named entities are retained as written. No additional dependency is installed.

## Contribution files

- [definition.ts](definition.ts): metadata, sample input, defaults, and `.jsx` output extension.
- [logic.ts](logic.ts): typed `run(input, options)` entry point, parsing, validation, and limits.
- [Tool.tsx](Tool.tsx): accessible UI using the shared `ToolPanel` and design tokens.
- `lib/`: lexer, parser, JSX generator, mappings, and private helpers.
- Focused tests: [tests/tools/html-to-jsx.test.cjs](../../../tests/tools/html-to-jsx.test.cjs).

See [Adding a tool](../../../docs/adding-a-tool.md) and [Architecture](../../../docs/architecture.md) for repository conventions.
