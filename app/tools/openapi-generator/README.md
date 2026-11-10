# Gerador OpenAPI

**Status:** implementado.

Gera localmente uma especificação **OpenAPI 3.1.0 em JSON** a partir de um objeto JSON com título, versão, servidores, endpoints e schemas de resposta. A saída pode ser copiada ou baixada como `.json` na interface padrão do projeto.

## Exemplo de entrada

```json
{
  "title": "Example API",
  "version": "1.0.0",
  "description": "",
  "servers": ["https://api.example.com"],
  "endpoints": [
    {
      "path": "/users",
      "method": "get",
      "summary": "List users",
      "responseDescription": "Success",
      "responseSchema": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "id": { "type": "integer" },
            "name": { "type": "string" }
          }
        }
      }
    }
  ]
}
```

Cada endpoint gera uma operação com resposta `200` e conteúdo `application/json`, usando o `responseSchema` informado. Os schemas são transportados para a saída; a ferramenta não infere schemas nem valida completamente a semântica do vocabulário JSON Schema.

## Campos e validação

- `title` e `version` são textos obrigatórios, limitados a 128 e 64 caracteres.
- `description` é opcional (até 2.000 caracteres); se vazio, não aparece em `info`.
- `servers` deve conter de 1 a 20 URLs absolutas `http://` ou `https://`, cada uma com até 2.048 caracteres. Credenciais e fragmentos `#` são proibidos.
- `endpoints` deve conter de 1 a 100 itens. O método deve ser `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD` ou `OPTIONS`; método e caminho não podem se repetir.
- O `path` tem até 512 caracteres, deve começar com `/` e não pode incluir query (`?`) ou fragmento (`#`). `summary` e `responseDescription` têm até 256 caracteres.
- `responseSchema` deve ser um objeto JSON com no máximo 16 níveis de profundidade e 20.000 valores. `$ref`, `$dynamicRef` e `$recursiveRef` são rejeitados.
- A entrada inteira está limitada a 100.000 caracteres; a saída, a 1 MB. Campos fora do formato documentado e opções não vazias são rejeitados.

## Limitações e privacidade

O processamento ocorre no navegador e não faz requisições de rede; URLs de servidor são apenas incluídas na especificação gerada, nunca acessadas. Esta ferramenta não lê código-fonte, não importa documentos, não consulta servidores e não verifica se os endpoints existem. Cada operação recebe somente uma resposta `200` JSON; não há configuração de parâmetros, autenticação, segurança, erros adicionais, cabeçalhos ou conteúdo alternativo. Referências a schemas não são aceitas. A saída é uma especificação inicial que deve ser revisada antes de uso em produção.

## Arquivos

- `definition.ts`: metadados, exemplo, opções vazias e extensão JSON.
- `logic.ts`: validação limitada e geração local.
- `Tool.tsx`: composição com `UniversalTool` e slug `openapi-generator`.
- Testes focados: `tests/tools/openapi-generator.test.cjs`.
