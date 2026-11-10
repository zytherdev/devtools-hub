# Tool implementation coverage

**Snapshot: November 10, 2026.** The catalog contains 86 entries: 33 have a connected implementation and 53 are explicitly marked as planned. Every entry has one canonical folder under `app/tools/<slug>/`; listing a tool is not, by itself, proof that it can process input. Update this page whenever implementation status changes.

## Implemented

| Area | Slugs |
| --- | --- |
| CSS & style | `css-minifier`, `css-beautifier`, `gradient-generator`, `box-shadow-generator`, `svg-to-css` |
| JavaScript | `js-minifier`, `js-beautifier`, `html-to-jsx`, `curl-to-code` |
| HTML & markup | `html-minifier`, `html-beautifier`, `markdown-to-html`, `favicon-generator` |
| Data | `json-formatter`, `xml-formatter`, `yaml-formatter`, `csv-formatter`, `toml-formatter`, `xml-to-json`, `yaml-to-json`, `json-to-xml`, `csv-to-json`, `toml-json-converter`, `php-json-converter`, `json-schema-generator` |
| Encoders & decoders | `base64-encoder`, `url-encoder`, `html-encoder`, `jwt-decoder`, `jwt-generator`, `unicode-converter` |
| Text | `regex-tester` |
| Converters | `color-converter` |

Each implemented tool has its metadata and sample/default options in `definition.ts`, processing in `logic.ts`, and a page entry in `Tool.tsx`. `app/tools/registry.ts` registers metadata; `app/tools/componentRegistry.ts` statically registers UI entry points for the shared dynamic route. Simple interfaces reuse `UniversalTool`, while richer controls use the same shared design system.

## Pending in the catalog

All pending entries have the same folder/files contract and show an explicit planned state rather than a non-working editor. Choose one of these slugs for a new implementation, then update its definition, logic, UI, README, and focused test together.

| Area | Pending slugs |
| --- | --- |
| Encoders & decoders | `ascii-converter`, `mime-type-validator` |
| Generators | `uuid-generator`, `password-generator`, `qr-generator`, `robots-txt-generator`, `sitemap-generator`, `random-number-generator`, `cron-generator`, `barcode-generator`, `openapi-generator`, `mock-api-generator` |
| Text & string | `text-case-converter`, `word-counter`, `diff-checker`, `json-diff`, `lorem-ipsum`, `remove-duplicate-lines`, `slug-generator`, `line-sorter` |
| Converters | `unit-converter`, `timestamp-converter`, `number-base-converter`, `currency-converter`, `file-size-converter`, `roman-numeral` |
| Database & DevOps | `sql-formatter`, `docker-compose-converter`, `kubernetes-decoder`, `chmod-calculator`, `subnet-calculator` |
| Security & crypto | `ssl-checker`, `password-strength`, `email-validator`, `hash-generator`, `hash-verifier`, `rsa-key-generator`, `bcrypt-generator`, `hmac-generator`, `aes-encryptor`, `certificate-decoder` |
| Date & time | `cron-validator`, `eta-calculator`, `date-difference`, `timezone-converter`, `text-statistics` |
| Network & lookup | `ip-lookup`, `user-agent-parser`, `mac-lookup` |
| Miscellaneous | `http-status-codes`, `emoji-picker`, `bip39-generator`, `benchmark-tool` |

## Completion criteria

A tool is implemented only when its `definition.ts` says `status: 'implemented'`, its `logic.ts` performs validated and bounded work, `Tool.tsx` is connected through the component registry, its per-tool README describes options and limitations, and focused tests cover success and invalid/boundary cases. Any external request must be disclosed in the UI and privacy documentation.
