# Tool Implementation Coverage

**Reference: November 13, 2026.** The catalog contains 86 tools: 78 have connected implementations and 8 are explicitly marked as planned. Each tool has a canonical folder at `app/tools/<slug>/`; appearing in the catalog alone does not mean that it processes inputs. Update this page whenever an implementation’s status changes.

## Implemented

| Area | Slugs |
| --- | --- |
| CSS and styles | `css-minifier`, `css-beautifier`, `gradient-generator`, `box-shadow-generator`, `svg-to-css` |
| JavaScript | `js-minifier`, `js-beautifier`, `html-to-jsx`, `curl-to-code` |
| HTML and markup | `html-minifier`, `html-beautifier`, `markdown-to-html`, `favicon-generator` |
| Data | `json-formatter`, `xml-formatter`, `yaml-formatter`, `csv-formatter`, `toml-formatter`, `xml-to-json`, `yaml-to-json`, `json-to-xml`, `csv-to-json`, `toml-json-converter`, `php-json-converter`, `json-schema-generator` |
| Encoders and decoders | `base64-encoder`, `url-encoder`, `html-encoder`, `jwt-decoder`, `jwt-generator`, `unicode-converter`, `ascii-converter`, `mime-type-validator` |
| Generators | `uuid-generator`, `password-generator`, `qr-generator`, `robots-txt-generator`, `sitemap-generator`, `random-number-generator`, `cron-generator`, `barcode-generator`, `openapi-generator`, `mock-api-generator` |
| Text | `regex-tester`, `text-case-converter`, `word-counter`, `diff-checker`, `json-diff`, `lorem-ipsum`, `remove-duplicate-lines`, `slug-generator`, `line-sorter` |
| Converters | `color-converter`, `unit-converter`, `timestamp-converter`, `number-base-converter`, `currency-converter`, `file-size-converter`, `roman-numeral` |
| Database and DevOps | `sql-formatter`, `docker-compose-converter`, `kubernetes-decoder`, `chmod-calculator` |
| Security and cryptography | `password-strength`, `email-validator`, `hash-generator`, `hash-verifier`, `hmac-generator` |
| Date and time | `cron-validator`, `eta-calculator`, `date-difference`, `timezone-converter`, `text-statistics` |
| Network and lookup | `subnet-calculator`, `user-agent-parser` |
| Miscellaneous | `http-status-codes`, `emoji-picker`, `benchmark-tool` |

Each implemented tool contains metadata and example/default options in `definition.ts`, processing logic in `logic.ts`, and a UI entry in `Tool.tsx`. `app/tools/registry.ts` registers the metadata; `app/tools/componentRegistry.ts` statically registers the UI entries used by the shared dynamic route. Simple interfaces reuse `UniversalTool`; richer controls follow the same shared visual system.

## Planned in the catalog

All planned tools follow the same folder contract and explicitly display their planned status instead of presenting a nonfunctional editor. To start an implementation, choose a slug below and update its definition, logic, interface, README, and tool-specific tests together.

| Area | Planned slugs |
| --- | --- |
| Encoders and decoders | — |
| Generators | — |
| Text and strings | — |
| Converters | — |
| Database and DevOps | — |
| Security and cryptography | `ssl-checker`, `rsa-key-generator`, `bcrypt-generator`, `aes-encryptor`, `certificate-decoder` |
| Date and time | — |
| Network and lookup | `ip-lookup`, `mac-lookup` |
| Miscellaneous | `bip39-generator` |

## Completion criteria

A tool is considered implemented only when `definition.ts` declares `status: 'implemented'`, `logic.ts` performs validated and bounded operations, `Tool.tsx` is connected through the component registry, its README describes options and limitations, and tool-specific tests cover valid and invalid/boundary cases. Any external request must be disclosed in the interface and privacy documentation.
