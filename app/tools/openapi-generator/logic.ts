import type { ToolOptions } from '@/app/tools/types'

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }
type JsonObject = { [key: string]: JsonValue }

const MAX_INPUT_LENGTH = 100_000
const MAX_OUTPUT_BYTES = 1_000_000
const MAX_SCHEMA_DEPTH = 16
const MAX_SCHEMA_NODES = 20_000
const METHODS = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options'])
const REFERENCE_KEYS = new Set(['$ref', '$dynamicRef', '$recursiveRef'])

/** Generate an OpenAPI 3.1 JSON document from a bounded, local JSON description. */
export function generateOpenApi(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new Error('Informe um objeto JSON com os dados da API.')
  }
  if (input.length > MAX_INPUT_LENGTH) {
    throw new Error(`A entrada excede o limite de ${MAX_INPUT_LENGTH.toLocaleString('pt-BR')} caracteres.`)
  }
  if (!options || typeof options !== 'object' || Array.isArray(options) || Object.keys(options).length > 0) {
    throw new Error('Este gerador não aceita opções; use um objeto vazio: {}.')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'erro de sintaxe desconhecido'
    throw new Error(`JSON inválido: ${detail}`)
  }

  const source = requireObject(parsed, 'A raiz da entrada deve ser um objeto JSON.')
  assertOnlyKeys(source, ['title', 'version', 'description', 'servers', 'endpoints'], 'entrada')

  const title = requireText(source.title, 'title', 128, true)
  const version = requireText(source.version, 'version', 64, true)
  const description = source.description === undefined ? '' : requireText(source.description, 'description', 2_000)
  const servers = requireArray(source.servers, 'servers')
  if (servers.length < 1 || servers.length > 20) {
    throw new Error('servers deve conter de 1 a 20 URLs.')
  }
  const validatedServers = servers.map((server, index) => validateServer(server, index))

  const rawEndpoints = requireArray(source.endpoints, 'endpoints')
  if (rawEndpoints.length < 1 || rawEndpoints.length > 100) {
    throw new Error('endpoints deve conter de 1 a 100 itens.')
  }

  const seenOperations = new Set<string>()
  const endpoints = rawEndpoints.map((rawEndpoint, index) => {
    const endpoint = requireObject(rawEndpoint, `endpoints[${index}] deve ser um objeto.`)
    assertOnlyKeys(endpoint, ['path', 'method', 'summary', 'responseDescription', 'responseSchema'], `endpoints[${index}]`)
    const path = requireText(endpoint.path, `endpoints[${index}].path`, 512, true)
    if (!path.startsWith('/') || path.includes('?') || path.includes('#')) {
      throw new Error(`endpoints[${index}].path deve começar com / e não pode conter query ou fragmento.`)
    }

    const methodText = requireText(endpoint.method, `endpoints[${index}].method`, 16, true)
    const method = methodText.toLowerCase()
    if (!METHODS.has(method)) {
      throw new Error(`Método HTTP inválido em endpoints[${index}].method. Use GET, POST, PUT, PATCH, DELETE, HEAD ou OPTIONS.`)
    }
    const operationKey = `${method}\u0000${path}`
    if (seenOperations.has(operationKey)) {
      throw new Error(`Operação duplicada: ${method.toUpperCase()} ${path}.`)
    }
    seenOperations.add(operationKey)

    const summary = requireText(endpoint.summary, `endpoints[${index}].summary`, 256)
    const responseDescription = requireText(endpoint.responseDescription, `endpoints[${index}].responseDescription`, 256, true)
    const responseSchema = requireObject(endpoint.responseSchema, `endpoints[${index}].responseSchema deve ser um objeto JSON Schema.`)
    validateResponseSchema(responseSchema, index)

    return { path, method, summary, responseDescription, responseSchema }
  })

  const paths: Record<string, Record<string, unknown>> = Object.create(null) as Record<string, Record<string, unknown>>
  for (const endpoint of endpoints) {
    if (!Object.hasOwn(paths, endpoint.path)) {
      Object.defineProperty(paths, endpoint.path, {
        value: Object.create(null) as Record<string, unknown>,
        enumerable: true,
        configurable: true,
        writable: true,
      })
    }
    paths[endpoint.path][endpoint.method] = {
      summary: endpoint.summary,
      responses: {
        '200': {
          description: endpoint.responseDescription,
          content: {
            'application/json': { schema: endpoint.responseSchema },
          },
        },
      },
    }
  }

  const info: Record<string, string> = { title, version }
  if (description) info.description = description
  const document = {
    openapi: '3.1.0',
    info,
    servers: validatedServers.map(url => ({ url })),
    paths,
  }
  const output = JSON.stringify(document, null, 2)
  const outputBytes = new TextEncoder().encode(output).byteLength
  if (outputBytes > MAX_OUTPUT_BYTES) {
    throw new Error(`A saída excede o limite de ${MAX_OUTPUT_BYTES.toLocaleString('pt-BR')} bytes.`)
  }
  return output
}

function requireObject(value: unknown, message: string): JsonObject {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new Error(message)
  return value as JsonObject
}

function requireArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${field} deve ser um array.`)
  return value
}

function requireText(value: unknown, field: string, maxLength: number, nonEmpty = false): string {
  if (typeof value !== 'string') throw new Error(`${field} deve ser um texto.`)
  if (value.length > maxLength) throw new Error(`${field} deve ter no máximo ${maxLength.toLocaleString('pt-BR')} caracteres.`)
  if (nonEmpty && value.trim().length === 0) throw new Error(`${field} não pode ficar vazio.`)
  return value
}

function assertOnlyKeys(value: JsonObject, allowed: string[], location: string): void {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) throw new Error(`Campo não reconhecido em ${location}: ${key}.`)
  }
}

function validateServer(value: unknown, index: number): string {
  const field = `servers[${index}]`
  const server = requireText(value, field, 2_048, true)
  if (server !== server.trim() || !/^https?:\/\//i.test(server)) {
    throw new Error(`${field} deve ser uma URL absoluta HTTP(S) sem espaços externos.`)
  }
  const authority = server.match(/^https?:\/\/([^/?#]*)/i)?.[1] ?? ''
  if (authority.includes('@') || server.includes('#')) {
    throw new Error(`${field} não pode conter credenciais nem fragmento (#).`)
  }
  let parsed: URL
  try {
    parsed = new URL(server)
  } catch {
    throw new Error(`${field} deve ser uma URL absoluta HTTP(S) válida.`)
  }
  if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password || parsed.hash) {
    throw new Error(`${field} deve ser uma URL absoluta HTTP(S) sem credenciais nem fragmento.`)
  }
  return server
}

function validateResponseSchema(schema: JsonObject, endpointIndex: number): void {
  let nodes = 0
  const visit = (value: JsonValue, depth: number): void => {
    nodes++
    if (nodes > MAX_SCHEMA_NODES) {
      throw new Error(`responseSchema em endpoints[${endpointIndex}] excede o limite de ${MAX_SCHEMA_NODES.toLocaleString('pt-BR')} valores.`)
    }
    if (depth > MAX_SCHEMA_DEPTH) {
      throw new Error(`responseSchema em endpoints[${endpointIndex}] excede a profundidade máxima de ${MAX_SCHEMA_DEPTH}.`)
    }
    if (typeof value === 'number' && !Number.isFinite(value)) {
      throw new Error(`responseSchema em endpoints[${endpointIndex}] contém um número não JSON.`)
    }
    if (Array.isArray(value)) {
      for (const item of value) visit(item, depth + 1)
      return
    }
    if (value !== null && typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) {
        if (REFERENCE_KEYS.has(key)) {
          throw new Error(`responseSchema em endpoints[${endpointIndex}] não aceita referências ${key}.`)
        }
        visit(item, depth + 1)
      }
    }
  }
  visit(schema, 0)
}

export function run(input: string, options: ToolOptions = {}): string {
  return generateOpenApi(input, options)
}
