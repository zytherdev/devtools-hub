# Text Case Converter

**Status:** Implemented

Convert text locally between nine formats: `camel`, `pascal`, `snake`, `kebab`, `constant`, `title`, `sentence`, `lower` and `upper`. The result is plain text (`.txt`).

## Input and options

The input can contain up to 100,000 characters. The loadable example is:

~~~text
Hello, World! review 2:Text
~~~

The only accepted option is `mode`; the default is `camel`.

~~~json
{"mode":"camel"}
~~~

| Mode | Result for `Hello, World! review 2:Text` | Behavior |
| --- | --- | --- |
| `camel` | `helloWorldReview2Text` | First word in lowercase; subsequent words capitalized, with no separator. |
| `pascal` | `HelloWorldReview2Text` | Initial capital on every word, with no separator. |
| `snake` | `hello_world_review_2_text` | Lowercase, separated by `_`. |
| `kebab` | `hello-world-review-2-text` | Lowercase, separated by `-`. |
| `constant` | `HELLO_WORLD_REVIEW_2_TEXT` | Uppercase, separated by `_`. |
| `title` | `Hello World Review 2 Text` | Initial capital on each word, separated by spaces. |
| `sentence` | `Hello, world! review 2:text` | Entire text in lowercase, except for the first letter, which is uppercase; punctuation and spacing are preserved. |
| `lower` | `hello, world! review 2:text` | Converts the entire string to lowercase; preserves punctuation and spacing. |
| `upper` | `HELLO, WORLD! REVIEW 2:TEXT` | Converts the entire string to uppercase; preserves punctuation and spacing. |

In word-forming modes, Unicode letters and numbers are recognized, including accented letters. Punctuation and spaces separate words; uppercase/lowercase boundaries (for example, `meuTexto` and `HTTPServidor`) and changes between letters and numbers are also recognized. Word separation normalizes delimiters to the separator for the selected mode. Inputs with no tokens, such as an empty string or a string containing only punctuation, are valid and do not cause an error.

## Validation and privacy

Inputs longer than 100,000 characters, invalid modes, and options other than `mode` return a validation error. No network requests are made: processing occurs locally in the browser.

## Contribution files

- [definition.ts](definition.ts): metadata, sample, default mode, and output extension.
- [logic.ts](logic.ts): Unicode tokenization, conversions, and validation.
- [Tool.tsx](Tool.tsx): shared `UniversalTool` interface.
- Tests: [tests/tools/text-case-converter.test.cjs](../../../tests/tools/text-case-converter.test.cjs).
