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
    throw new Error('Provide a JSON object containing the API data.')
  }
  if (input.length > MAX_INPUT_LENGTH) {
    throw new Error(`Input exceeds the ${MAX_INPUT_LENGTH.toLocaleString('en-US')}-character limit.`)
  }
  if (!options || typeof options !== 'object' || Array.isArray(options) || Object.keys(options).length > 0) {
    throw new Error('This generator does not accept options; use an empty object: {}.')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(input)
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown syntax error'
    throw new Error(`Invalid JSON: ${detail}`)
  }

  const source = requireObject(parsed, 'The input root must be a JSON object.')
  assertOnlyKeys(source, ['title', 'version', 'description', 'servers', 'endpoints'], 'input')

  const title = requireText(source.title, 'title', 128, true)
  const version = requireText(source.version, 'version', 64, true)
  const description = source.description === undefined ? '' : requireText(source.description, 'description', 2_000)
  const servers = requireArray(source.servers, 'servers')
  if (servers.length < 1 || servers.length > 20) {
    throw new Error('servers must contain between 1 and 20 URLs.')
  }
  const validatedServers = servers.map((server, index) => validateServer(server, index))

  const rawEndpoints = requireArray(source.endpoints, 'endpoints')
  if (rawEndpoints.length < 1 || rawEndpoints.length > 100) {
    throw new Error('endpoints must contain between 1 and 100 items.')
  }

  const seenOperations = new Set<string>()
  const endpoints = rawEndpoints.map((rawEndpoint, index) => {
    const endpoint = requireObject(rawEndpoint, `endpoints[${index}] must be an object.`)
    assertOnlyKeys(endpoint, ['path', 'method', 'summary', 'responseDescription', 'responseSchema'], `endpoints[${index}]`)
    const path = requireText(endpoint.path, `endpoints[${index}].path`, 512, true)
    if (!path.startsWith('/') || path.includes('?') || path.includes('#')) {
      throw new Error(`endpoints[${index}].path must start with / and cannot contain a query or fragment.`)
    }

    const methodText = requireText(endpoint.method, `endpoints[${index}].method`, 16, true)
    const method = methodText.toLowerCase()
    if (!METHODS.has(method)) {
      throw new Error(`Invalid HTTP method in endpoints[${index}].method. Use GET, POST, PUT, PATCH, DELETE, HEAD, or OPTIONS.`)
    }
    const operationKey = `${method}\u0000${path}`
    if (seenOperations.has(operationKey)) {
      throw new Error(`Duplicate operation: ${method.toUpperCase()} ${path}.`)
    }
    seenOperations.add(operationKey)

    const summary = requireText(endpoint.summary, `endpoints[${index}].summary`, 256)
    const responseDescription = requireText(endpoint.responseDescription, `endpoints[${index}].responseDescription`, 256, true)
    const responseSchema = requireObject(endpoint.responseSchema, `endpoints[${index}].responseSchema must be a JSON Schema object.`)
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
    throw new Error(`Output exceeds the ${MAX_OUTPUT_BYTES.toLocaleString('en-US')}-byte limit.`)
  }
  return output
}

function requireObject(value: unknown, message: string): JsonObject {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new Error(message)
  return value as JsonObject
}

function requireArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array.`)
  return value
}

function requireText(value: unknown, field: string, maxLength: number, nonEmpty = false): string {
  if (typeof value !== 'string') throw new Error(`${field} must be text.`)
  if (value.length > maxLength) throw new Error(`${field} must be no more than ${maxLength.toLocaleString('en-US')} characters.`)
  if (nonEmpty && value.trim().length === 0) throw new Error(`${field} cannot be empty.`)
  return value
}

function assertOnlyKeys(value: JsonObject, allowed: string[], location: string): void {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) throw new Error(`Unrecognized field in ${location}: ${key}.`)
  }
}

function validateServer(value: unknown, index: number): string {
  const field = `servers[${index}]`
  const server = requireText(value, field, 2_048, true)
  if (server !== server.trim() || !/^https?:\/\//i.test(server)) {
    throw new Error(`${field} must be an absolute HTTP(S) URL with no surrounding whitespace.`)
  }
  const authority = server.match(/^https?:\/\/([^/?#]*)/i)?.[1] ?? ''
  if (authority.includes('@') || server.includes('#')) {
    throw new Error(`${field} cannot contain credentials or a fragment (#).`)
  }
  let parsed: URL
  try {
    parsed = new URL(server)
  } catch {
    throw new Error(`${field} must be a valid absolute HTTP(S) URL.`)
  }
  if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password || parsed.hash) {
    throw new Error(`${field} must be an absolute HTTP(S) URL without credentials or a fragment.`)
  }
  return server
}

function validateResponseSchema(schema: JsonObject, endpointIndex: number): void {
  let nodes = 0
  const visit = (value: JsonValue, depth: number): void => {
    nodes++
    if (nodes > MAX_SCHEMA_NODES) {
      throw new Error(`responseSchema in endpoints[${endpointIndex}] exceeds the ${MAX_SCHEMA_NODES.toLocaleString('en-US')}-value limit.`)
    }
    if (depth > MAX_SCHEMA_DEPTH) {
      throw new Error(`responseSchema in endpoints[${endpointIndex}] exceeds the maximum depth of ${MAX_SCHEMA_DEPTH}.`)
    }
    if (typeof value === 'number' && !Number.isFinite(value)) {
      throw new Error(`responseSchema in endpoints[${endpointIndex}] contains a non-JSON number.`)
    }
    if (Array.isArray(value)) {
      for (const item of value) visit(item, depth + 1)
      return
    }
    if (value !== null && typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) {
        if (REFERENCE_KEYS.has(key)) {
          throw new Error(`responseSchema in endpoints[${endpointIndex}] does not allow ${key} references.`)
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
