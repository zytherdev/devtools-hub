# HTML Minifier

**Status:** Implemented

Remove ordinary HTML comments and compress safe whitespace without changing protected raw-text content.

## Availability

Available at `/html-minifier`. The output can be copied as HTML (`.html`).

## Example input

The sample loaded by the tool is defined in [definition.ts](definition.ts). It demonstrates a license comment, inline text whitespace, CSS, and a JavaScript string containing comment-like text.

## Options and limits

There are no processing options. Input is limited to 1,000,000 UTF-16 code units. The former Advanced control was removed because it did not provide a distinct transformation.

## Processing and preservation

Processing is local in the browser; input is not sent to a provider. Ordinary HTML comments are removed. Conditional, SSI, license, preservation, and other recognized directive comments are retained. Whitespace runs in ordinary HTML text and tag syntax are compressed, while quoted attribute values and the content of `script`, `style`, `textarea`, and `pre` are preserved. A raw-text close is recognized only when the tag name is followed by an HTML tag-name delimiter, so names such as `</scripture>` do not terminate `script` content. Malformed, unterminated comments/tags and CDATA sections are retained conservatively.

This is a conservative tokenizer, not a full HTML validator or standards-compliant parser. It does not guarantee that arbitrary invalid markup is repaired or that every possible HTML whitespace transformation is semantically neutral. Review output before deploying it.

## Contribution files

- [definition.ts](definition.ts): metadata, sample input, defaults, and output extension.
- [logic.ts](logic.ts): bounded `run(input, options)` processor and validation.
- [Tool.tsx](Tool.tsx): accessible UI entry using shared `ToolPanel` styles.
- Focused tests: [tests/tools/html-minifier.test.cjs](../../../tests/tools/html-minifier.test.cjs).

Before submitting changes, run `npm run check`. See [Adding a tool](../../../docs/adding-a-tool.md) and [Architecture](../../../docs/architecture.md).
