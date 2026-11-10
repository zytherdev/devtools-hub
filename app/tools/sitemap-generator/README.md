# Gerador de Sitemap

**Status:** Implementado

Gera um sitemap XML a partir de URLs do site, uma por linha. O resultado segue o namespace padrão de sitemap e pode ser baixado como arquivo `.xml`.

## Uso e opções

Cada URL precisa ser absoluta e usar `http` ou `https`. URLs com credenciais ou fragmentos são rejeitadas. Entradas duplicadas são normalizadas e removidas.

Opções padrão:

~~~json
{"changeFrequency":"weekly","priority":"0.5","lastModified":""}
~~~

- `changeFrequency`: `always`, `hourly`, `daily`, `weekly`, `monthly`, `yearly`, `never` ou vazio para omitir a etiqueta.
- `priority`: número decimal de `0.0` a `1.0` (até duas casas decimais) ou vazio para omitir a etiqueta.
- `lastModified`: data real no formato `YYYY-MM-DD` ou vazio para omitir a etiqueta.

Os valores opcionais são aplicados a cada URL. Caracteres especiais em localizações são escapados em XML. Verifique se todas as URLs representam páginas canônicas que você deseja disponibilizar aos mecanismos de busca.

## Limites e privacidade

São aceitas até 50.000 URLs e 5.000.000 caracteres de entrada; a saída é limitada a 10.000.000 de caracteres. O processamento é local, sem consultar nem enviar URLs a serviços externos.

## Arquivos de contribuição

- [definition.ts](definition.ts): metadados, opções e exemplo de entrada.
- [logic.ts](logic.ts): validação, normalização e serialização XML.
- [Tool.tsx](Tool.tsx): interface compartilhada `UniversalTool`.
- Testes: [tests/tools/sitemap-generator.test.cjs](../../../tests/tools/sitemap-generator.test.cjs).
