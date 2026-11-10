type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }
type Schema = Record<string, unknown>

const MAX_INPUT_LENGTH = 1_000_000
const MAX_DEPTH = 100
const MAX_NODES = 100_000

/** Infer a JSON Schema from one JSON value and return formatted schema JSON. */
export function generateJsonSchema(input: string, options: Record<string, string>): string {
  if (options.mode === 'validate') {
    throw new Error('Validation mode is not implemented; choose inference mode or omit the mode option.')
  }
  if (options.mode && options.mode !== 'infer') {
    throw new Error(`Unsupported mode "${options.mode}". Supported mode: infer.`)
  }
  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new Error('Provide a JSON value to infer a schema from.')
  }
  if (input.length > MAX_INPUT_LENGTH) {
    throw new Error(`JSON input exceeds the ${MAX_INPUT_LENGTH.toLocaleString()}-character limit.`)
  }

  const indent = parseIndent(options.indent)
  const draft = parseDraft(options.draft ?? options.version)
  const requiredMode = options.required ?? 'observed'
  if (requiredMode !== 'observed' && requiredMode !== 'none') {
    throw new Error('Invalid required option. Use "observed" or "none".')
  }
  const additionalProperties = parseAdditionalProperties(options.additionalProperties)
  const title = options.title?.trim()
  if (title && title.length > 256) {
    throw new Error('Title must be 256 characters or fewer.')
  }

  let value: JsonValue
  try {
    value = JSON.parse(input) as JsonValue
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown parse error'
    throw new Error(`Invalid JSON input: ${detail}`)
  }

  let visitedNodes = 0
  const infer = (current: JsonValue, depth: number): Schema => {
    visitedNodes++
    if (visitedNodes > MAX_NODES) {
      throw new Error(`JSON input exceeds the ${MAX_NODES.toLocaleString()}-node inference limit.`)
    }
    if (depth > MAX_DEPTH) {
      throw new Error(`JSON nesting exceeds the maximum depth of ${MAX_DEPTH}.`)
    }

    if (current === null) return { type: 'null' }
    if (typeof current === 'boolean') return { type: 'boolean' }
    if (typeof current === 'string') return { type: 'string' }
    if (typeof current === 'number') return { type: Number.isInteger(current) ? 'integer' : 'number' }

    if (Array.isArray(current)) {
      if (current.length === 0) return { type: 'array', items: {} }
      const uniqueSchemas = new Map<string, Schema>()
      for (const item of current) {
        const itemSchema = infer(item, depth + 1)
        const key = JSON.stringify(itemSchema)
        if (!uniqueSchemas.has(key)) uniqueSchemas.set(key, itemSchema)
      }
      const alternatives = [...uniqueSchemas.entries()]
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
        .map(([, schema]) => schema)
      return {
        type: 'array',
        items: alternatives.length === 1 ? alternatives[0] : { anyOf: alternatives },
      }
    }

    const objectValue = current as { [key: string]: JsonValue }
    const properties: Record<string, Schema> = {}
    const keys = Object.keys(objectValue).sort()
    for (const key of keys) {
      // defineProperty preserves arbitrary JSON keys such as "__proto__" safely.
      Object.defineProperty(properties, key, {
        value: infer(objectValue[key], depth + 1),
        enumerable: true,
        configurable: true,
        writable: true,
      })
    }

    const schema: Schema = { type: 'object', properties }
    if (requiredMode === 'observed' && keys.length > 0) schema.required = keys
    schema.additionalProperties = additionalProperties
    return schema
  }

  const schema = infer(value, 0)
  if (title) schema.title = title
  if (draft === 'draft-07') {
    return JSON.stringify({ $schema: 'http://json-schema.org/draft-07/schema#', ...schema }, null, indent)
  }
  return JSON.stringify({ $schema: 'https://json-schema.org/draft/2020-12/schema', ...schema }, null, indent)
}

function parseIndent(value: string | undefined): number {
  if (value === undefined || value === '') return 2
  if (!/^(?:[0-8])$/.test(value)) {
    throw new Error('Invalid indent option. Use a whole number from 0 to 8.')
  }
  return Number(value)
}

function parseDraft(value: string | undefined): 'draft-07' | '2020-12' {
  if (value === undefined || value === '' || value === '2020-12' || value === 'draft-2020-12') {
    return '2020-12'
  }
  if (value === 'draft-07' || value === 'draft07' || value === '07') return 'draft-07'
  throw new Error('Invalid draft option. Use "2020-12" or "draft-07".')
}

function parseAdditionalProperties(value: string | undefined): boolean {
  if (value === undefined || value === '') return true
  if (value === 'true') return true
  if (value === 'false') return false
  throw new Error('Invalid additionalProperties option. Use "true" or "false".')
}
