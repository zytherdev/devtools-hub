# Validador de MIME Type

**Status:** Implementado

Valida a sintaxe de um tipo MIME ou consulta tipos MIME comuns a partir de um nome de arquivo ou extensão. O processamento usa uma tabela local incluída no aplicativo e não faz solicitações de rede.

## Uso

Informe um valor MIME, como `Application/JSON; Charset=utf-8`, uma extensão, como `.jpg`, ou um nome de arquivo, como `archive.tar.gz`. A saída é formatada como JSON. Tipo/subtipo e nomes de parâmetros não diferenciam maiúsculas de minúsculas; valores de parâmetros válidos e strings entre aspas são verificados e preservados. Sufixos compostos incluídos na tabela são verificados antes dos sufixos mais curtos (por exemplo, `archive.tar.gz` corresponde a `application/gzip`).

A opção `mode` aceita:

- `lookup` (padrão): retorna o resultado da tabela local, quando houver correspondência.
- `validate`: informa separadamente se a sintaxe é válida e se o valor consta na tabela local.

A opção `target` aceita:

- `auto` (padrão): identifica a entrada como MIME quando começa com `tipo/subtipo`; caso contrário, interpreta como extensão ou nome de arquivo.
- `mime`: interpreta explicitamente um tipo MIME, com parâmetros opcionais.
- `extension`: interpreta explicitamente uma extensão ou um nome de arquivo.

Exemplo de opções em JSON:

~~~json
{"mode":"validate","target":"mime"}
~~~

Um tipo MIME ou extensão com sintaxe válida, mas ausente da tabela, retorna `valid: true` e `known: false`; uma sintaxe malformada gera um erro. Os parâmetros MIME têm a sintaxe verificada, mas não são usados para selecionar uma entrada da tabela. A consulta de extensão usa o sufixo final do nome do arquivo, dando precedência aos sufixos compostos conhecidos.

## Tabela local de referência

A tabela incorporada abrange formatos comuns de JSON/XML/PDF/arquivos compactados/documentos, web/código-fonte, imagem, áudio, vídeo e fontes. Ela é intencionalmente limitada, não é uma lista completa nem um registro IANA oficial. Algumas extensões têm várias convenções; esta tabela escolhe uma associação (por exemplo, `.xml` corresponde a `application/xml`). Os resultados refletem apenas esta lista local, não as associações do sistema operacional ou o comportamento de um servidor. Valores desconhecidos não são consultados externamente.

## Limites e privacidade

A entrada é limitada a 512 caracteres e a saída serializada a 8 KiB. A ferramenta faz apenas análise local de strings e consulta à tabela. Nenhuma entrada é enviada e não há consulta de rede ou dependência de registros remotos.

## Arquivos de contribuição

- [definition.ts](definition.ts): metadados do catálogo, opções e exemplo de entrada.
- [logic.ts](logic.ts): analisador limitado e tabela de MIME/extensões.
- [Tool.tsx](Tool.tsx): entrada compartilhada de `UniversalTool`.
- Testes específicos: [tests/tools/mime-type-validator.test.cjs](../../../tests/tools/mime-type-validator.test.cjs).
