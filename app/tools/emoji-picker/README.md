# Emoji Picker

**Status:** Implemented

Search a curated local emoji catalog by category or keyword, then copy an emoji to the clipboard.

## Availability and coverage

The picker includes a bounded set of common emoji across nine groups: smileys, people, animals, food, travel, activities, objects, symbols, and flags. It is not a complete Unicode emoji catalog, and it does not claim exhaustive coverage of skin-tone, family, profession, or regional-flag variants. Names and keywords are hand-curated for everyday search terms.

The page filters as you type, category buttons are keyboard-accessible and expose their selected state, and each result has a descriptive accessible name. Selecting a result copies its emoji character and announces success or a clipboard-permission error.

## Example input

The catalog sample is stored in [definition.ts](definition.ts) and can be loaded from the tool page. Its JSON representation is:

~~~json
"smile"
~~~

## Default options

The options panel starts with this JSON:

~~~json
{}
~~~

The runner accepts a search string up to 80 characters and the optional string options `category` (`all`, `smileys`, `people`, `animals`, `food`, `travel`, `activities`, `objects`, `symbols`, or `flags`) and `limit` (an integer from 1 to 100). It returns matching curated entries as JSON. Unknown options and invalid values are rejected; result processing is capped at 100 entries.

## Processing and privacy

Searching and category filtering use only the in-memory catalog in [logic.ts](logic.ts). Copying uses the browser clipboard API after a user action. The tool makes no network or external requests and adds no dependencies.

## Contribution files

- [definition.ts](definition.ts): metadata, category, status, sample input, defaults, and output extension.
- [logic.ts](logic.ts): curated catalog, bounded search, validation, and typed `run(input, options)` entry point.
- [Tool.tsx](Tool.tsx): accessible client-side picker connected through the tool component registry.
- Focused tests: [tests/tools/emoji-picker.test.cjs](../../../tests/tools/emoji-picker.test.cjs).

Before submitting changes, run `npm run check`. See [Adding a tool](../../../docs/adding-a-tool.md) and [Architecture](../../../docs/architecture.md).
