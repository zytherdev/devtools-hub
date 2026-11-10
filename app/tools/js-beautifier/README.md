# JavaScript Beautifier

**Status:** Implemented

Format JavaScript, JSX, TypeScript, and TSX in the browser using Prettier's bundled Babel and TypeScript parsers. Select the source syntax explicitly before formatting; there is no heuristic detection, so syntax-specific constructs such as lowercase type aliases, `satisfies`, and generic TSX arrows are parsed according to the selected mode.

## Availability

Available at `/js-beautifier`. The tool provides format, copy, and download actions. Downloads use a syntax-matching extension: `.js`, `.jsx`, `.ts`, or `.tsx`. The catalog's default output extension is `.js`.

## Example input

The catalog sample is also available through **Load sample**:

~~~tsx
type ApiResponse<T> = { data: T; ok: boolean };
const Greeting = <T,>({ name, value }: { name: string; value: T }) => (
  <div className="greeting">Hello, {name}: {String(value)}</div>
);
~~~

## Options

- **Source syntax:** JavaScript, JSX, TypeScript, or TSX. Choose the matching mode; TypeScript-only syntax requires TypeScript or TSX.
- **Indent:** 2, 4, or 8 spaces, or tabs.
- **Line width:** integer from 40 to 160 characters.
- Prettier uses single quotes, semicolons, and LF line endings.

Inputs are limited to 100,000 characters for responsiveness. Invalid syntax and invalid option values produce errors rather than formatted output. Formatting is asynchronous but runs locally in the page; it does not use a worker thread, so large files can still temporarily occupy the browser's main thread.

## Processing and privacy

Formatting, copying, and file creation happen in the browser. Tool source is not sent to a formatting service. Standard site hosting and asset requests are described in the project privacy page.

## Contribution files

- [definition.ts](definition.ts): metadata, sample input, defaults, and default output extension.
- [logic.ts](logic.ts): typed formatting API, parser selection, option/input validation, and size limit.
- [Tool.tsx](Tool.tsx): local UI with syntax selection, copy, and download.
- Focused tests: [tests/tools/js-beautifier.test.cjs](../../../tests/tools/js-beautifier.test.cjs).

Before submitting changes, run `npm run check`. See [Adding a tool](../../../docs/adding-a-tool.md) and [Architecture](../../../docs/architecture.md).
