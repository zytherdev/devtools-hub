# Gerador de Robots.txt

**Status:** Implementado

Gera um arquivo `robots.txt` local com diretivas de agente, caminhos permitidos e bloqueados, referências de sitemap e atraso de rastreamento.

## Uso e opções

Informe um caminho por linha na entrada para criar diretivas `Disallow`. Os caminhos devem começar com `/`; espaços, fragmentos e caracteres de controle não são aceitos. Caminhos repetidos são removidos.

Opções padrão:

~~~json
{"userAgent":"*","allow":"/","crawlDelay":"","sitemap":""}
~~~

- `userAgent`: `*` ou token de produto com letras, números, ponto, sublinhado e hífen (até 80 caracteres).
- `allow`: caminhos permitidos separados por linhas, seguindo as mesmas regras da entrada.
- `crawlDelay`: vazio para omitir a diretiva, ou um número inteiro de segundos entre 0 e 86.400.
- `sitemap`: URLs absolutas HTTP(S), uma por linha. Credenciais e fragmentos não são permitidos.

A saída contém as diretivas `User-agent`, `Allow`, `Disallow`, `Crawl-delay` e `Sitemap` apenas quando aplicáveis. O arquivo é texto simples e pode ser baixado como `robots-txt-generator.txt`.

## Limites e privacidade

A entrada é limitada a 100.000 caracteres, com até 1.000 caminhos por campo e até 50 sitemaps. Nenhuma solicitação de rede é feita; a ferramenta apenas valida e monta texto localmente. Revise as regras antes de publicar, pois políticas incorretas podem afetar a indexação do site.

## Arquivos de contribuição

- [definition.ts](definition.ts): metadados e opções padrão.
- [logic.ts](logic.ts): validação e montagem do arquivo.
- [Tool.tsx](Tool.tsx): interface compartilhada `UniversalTool`.
- Testes: [tests/tools/robots-txt-generator.test.cjs](../../../tests/tools/robots-txt-generator.test.cjs).
