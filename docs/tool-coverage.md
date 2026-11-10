# Cobertura de implementação das ferramentas

**Referência: 10 de novembro de 2026.** O catálogo contém 86 ferramentas: 53 têm implementação conectada e 33 estão explicitamente marcadas como planejadas. Cada ferramenta tem uma pasta canônica em `app/tools/<slug>/`; aparecer no catálogo, por si só, não significa que processe entradas. Atualize esta página sempre que o status de uma implementação mudar.

## Implementadas

| Área | Slugs |
| --- | --- |
| CSS e estilos | `css-minifier`, `css-beautifier`, `gradient-generator`, `box-shadow-generator`, `svg-to-css` |
| JavaScript | `js-minifier`, `js-beautifier`, `html-to-jsx`, `curl-to-code` |
| HTML e marcação | `html-minifier`, `html-beautifier`, `markdown-to-html`, `favicon-generator` |
| Dados | `json-formatter`, `xml-formatter`, `yaml-formatter`, `csv-formatter`, `toml-formatter`, `xml-to-json`, `yaml-to-json`, `json-to-xml`, `csv-to-json`, `toml-json-converter`, `php-json-converter`, `json-schema-generator` |
| Codificadores e decodificadores | `base64-encoder`, `url-encoder`, `html-encoder`, `jwt-decoder`, `jwt-generator`, `unicode-converter`, `ascii-converter`, `mime-type-validator` |
| Geradores | `uuid-generator`, `password-generator`, `qr-generator`, `robots-txt-generator`, `sitemap-generator`, `random-number-generator`, `cron-generator`, `barcode-generator`, `openapi-generator`, `mock-api-generator` |
| Texto | `regex-tester`, `text-case-converter`, `word-counter`, `diff-checker`, `json-diff`, `lorem-ipsum`, `remove-duplicate-lines`, `slug-generator`, `line-sorter` |
| Conversores | `color-converter` |

Cada ferramenta implementada contém metadados e opções de exemplo/padrão em `definition.ts`, processamento em `logic.ts` e uma entrada de interface em `Tool.tsx`. `app/tools/registry.ts` registra os metadados; `app/tools/componentRegistry.ts` registra estaticamente as entradas de interface usadas pela rota dinâmica compartilhada. Interfaces simples reutilizam `UniversalTool`; controles mais ricos seguem o mesmo sistema visual compartilhado.

## Planejadas no catálogo

Todas as ferramentas planejadas seguem o mesmo contrato de pastas e exibem explicitamente o status planejado, em vez de apresentar um editor sem funcionamento. Para iniciar uma implementação, escolha um slug abaixo e atualize em conjunto sua definição, lógica, interface, README e testes específicos.

| Área | Slugs planejados |
| --- | --- |
| Codificadores e decodificadores | — |
| Geradores | — |
| Texto e strings | — |
| Conversores | `unit-converter`, `timestamp-converter`, `number-base-converter`, `currency-converter`, `file-size-converter`, `roman-numeral` |
| Banco de dados e DevOps | `sql-formatter`, `docker-compose-converter`, `kubernetes-decoder`, `chmod-calculator`, `subnet-calculator` |
| Segurança e criptografia | `ssl-checker`, `password-strength`, `email-validator`, `hash-generator`, `hash-verifier`, `rsa-key-generator`, `bcrypt-generator`, `hmac-generator`, `aes-encryptor`, `certificate-decoder` |
| Data e hora | `cron-validator`, `eta-calculator`, `date-difference`, `timezone-converter`, `text-statistics` |
| Rede e consulta | `ip-lookup`, `user-agent-parser`, `mac-lookup` |
| Diversos | `http-status-codes`, `emoji-picker`, `bip39-generator`, `benchmark-tool` |

## Critérios de conclusão

Uma ferramenta só é considerada implementada quando `definition.ts` declara `status: 'implemented'`, `logic.ts` executa operações validadas e limitadas, `Tool.tsx` está conectado pelo registro de componentes, seu README descreve opções e limitações e os testes específicos cobrem casos válidos e inválidos/de limite. Toda solicitação externa deve ser informada na interface e na documentação de privacidade.
