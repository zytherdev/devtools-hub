# Password generator

**Status:** Implemented

Generates one or more cryptographically secure passwords entirely in the browser. Each password is displayed on a separate line.

## Options

Options are provided as JSON strings in the shared options panel:

- `length`: password length, from 8 to 256 characters (default `"20"`).
- `count`: number of passwords, from 1 to 100 (default `"1"`).
- `uppercase`, `lowercase`, `numbers`, `symbols`: enable or disable each character class (all are `"true"` by default). Each enabled class will be represented in every result.
- `excludeAmbiguous`: when `"true"`, removes `I`, `l`, `1`, `O`, `0`, and `|` (default `"false"`).

At least one class must be enabled. If all options are disabled, generation fails with an error message in the interface. The tool does not use input text.

## Security and privacy

Random choices use the browser's `Web Crypto getRandomValues` and rejection sampling; `Math.random` is never used. The sampler chooses uniformly among all possible strings of the requested length that satisfy the enabled classes, avoiding forced character replacement. If Web Crypto is unavailable or fails, generation stops without falling back to a weaker source of randomness.

Generation is local: there are no network requests, and this tool does not save or send secrets. Results remain visible on the current page until they are cleared or you navigate to another page. The shared interface provides manual copy and download actions; these user actions may transfer or persist a secret, depending on the browser and the chosen destination. For critical accounts, use a trusted password manager and review the generated password before storing it.

## Limits

The tool allows up to 256 characters per password and up to 100 passwords per run. The browser/environment must provide Web Crypto; there is no alternative using external services.
