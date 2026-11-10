# Tool implementation coverage

**Snapshot: November 10, 2026.** The metadata catalog contains 86 tool entries. At this snapshot, 28 have a connected implementation and 58 remain catalogued but pending. The `tools.ts` catalog is a discovery list, not proof that a route has a working executor. This page is intentionally maintained with implementation batches; update it whenever the coverage changes.

## Implemented

| Area | Slugs |
| --- | --- |
| CSS & style | `css-minifier`, `css-beautifier`, `gradient-generator`, `box-shadow-generator`, `svg-to-css` |
| JavaScript | `js-minifier`, `js-beautifier`, `html-to-jsx`, `curl-to-code` |
| HTML & markup | `html-minifier`, `html-beautifier`, `markdown-to-html`, `favicon-generator` |
| Data | `json-formatter`, `xml-formatter`, `yaml-formatter`, `csv-formatter`, `toml-formatter`, `xml-to-json`, `yaml-to-json`, `json-to-xml`, `csv-to-json`, `toml-json-converter`, `php-json-converter`, `json-schema-generator` |
| Encoders | `base64-encoder` |
| Text | `regex-tester` |
| Converters | `color-converter` |

Specialized interfaces are registered in `app/(tools)/[slug]/page.tsx`. Generic handlers are connected through `app/lib/tools/toolEngine.ts` and `app/lib/tools/dataTools.ts`.

## Pending in the catalog

Pick a slug from this list when proposing a new implementation, then remove it from the pending section and add it to the implemented table only after the route is connected and tested.

| Area | Pending slugs |
| --- | --- |
| Encoders & decoders | `url-encoder`, `html-encoder`, `jwt-decoder`, `jwt-generator`, `unicode-converter`, `ascii-converter`, `mime-type-validator` |
| Generators | `uuid-generator`, `password-generator`, `qr-generator`, `robots-txt-generator`, `sitemap-generator`, `random-number-generator`, `cron-generator`, `barcode-generator`, `openapi-generator`, `mock-api-generator` |
| Text & string | `text-case-converter`, `word-counter`, `diff-checker`, `json-diff`, `lorem-ipsum`, `remove-duplicate-lines`, `slug-generator`, `line-sorter` |
| Converters | `unit-converter`, `timestamp-converter`, `number-base-converter`, `currency-converter`, `file-size-converter`, `roman-numeral` |
| Database & DevOps | `sql-formatter`, `docker-compose-converter`, `kubernetes-decoder`, `chmod-calculator`, `subnet-calculator` |
| Security & crypto | `ssl-checker`, `password-strength`, `email-validator`, `hash-generator`, `hash-verifier`, `rsa-key-generator`, `bcrypt-generator`, `hmac-generator`, `aes-encryptor`, `certificate-decoder` |
| Date & time | `cron-validator`, `eta-calculator`, `date-difference`, `timezone-converter`, `text-statistics` |
| Network & lookup | `ip-lookup`, `user-agent-parser`, `mac-lookup` |
| Miscellaneous | `http-status-codes`, `emoji-picker`, `bip39-generator`, `benchmark-tool` |

## Completion criteria

A pending tool is complete only when it has a validated implementation, a registered generic executor or specialized component, a representative example, consistent shared UI, and tests for successful and invalid/boundary inputs. If it uses a network service, its data flow must be disclosed in the UI and privacy documentation.
