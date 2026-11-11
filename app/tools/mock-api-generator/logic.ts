import type { ToolOptions } from '@/app/tools/types'

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }
type JsonObject = { [key: string]: JsonValue }

export const MAX_INPUT_CHARS = 100_000
export const MAX_OUTPUT_BYTES = 1_000_000
export const MAX_JSON_DEPTH = 20
export const MAX_CONTAINER_ITEMS = 10_000
export const MAX_JSON_NODES = 20_000
const ALLOWED_OPTIONS = new Set(['count', 'wrapper', 'idField'])
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f-\u009f]/u

/** Generate deterministic JSON fixtures from a template object without network access or dynamic execution. */
export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string') throw new Error('Input must be a JSON string.')
  if (input.length > MAX_INPUT_CHARS) {
    throw new Error(`Input exceeds the ${MAX_INPUT_CHARS.toLocaleString('en-US')}-character limit.`)
  }
  if (!input.trim()) throw new Error('Provide a JSON template object.')

  const settings = validateOptions(options)
  let parsed: unknown
  try {
    parsed = JSON.parse(input) as unknown
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : 'unknown syntax error'
    throw new Error(`Invalid JSON: ${detail}`)
  }
  if (!isPlainObject(parsed)) {
    throw new Error('The template must be a plain JSON object, not an array or primitive value.')
  }
  validateTemplate(parsed)

  const records: JsonObject[] = []
  for (let index = 1; index <= settings.count; index++) {
    const record = JSON.parse(JSON.stringify(parsed)) as JsonObject
    if (settings.idField) {
      Object.defineProperty(record, settings.idField, {
        value: index,
        enumerable: true,
        configurable: true,
        writable: true,
      })
    }
    records.push(record)
  }

  const result: JsonValue = settings.wrapper
    ? { [settings.wrapper]: records, meta: { count: settings.count } }
    : records
  const output = JSON.stringify(result, null, 2)
  const outputBytes = new TextEncoder().encode(output).byteLength
  if (outputBytes > MAX_OUTPUT_BYTES) {
    throw new Error(`Output exceeds the ${MAX_OUTPUT_BYTES.toLocaleString('en-US')}-byte limit.`)
  }
  return output
}

function validateOptions(options: ToolOptions): { count: number; wrapper: string; idField: string } {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('Options must be a JSON object.')
  }
  for (const key of Object.keys(options)) {
    if (!ALLOWED_OPTIONS.has(key)) throw new Error(`Unknown option: ${key}.`)
  }

  const countText = options.count ?? '3'
  if (typeof countText !== 'string' || !/^\d+$/u.test(countText)) {
    throw new Error('count must be an integer from 1 to 100.')
  }
  const count = Number(countText)
  if (!Number.isInteger(count) || count < 1 || count > 100) {
    throw new Error('count must be an integer from 1 to 100.')
  }
  const wrapper = validateOptionText(options.wrapper ?? 'data', 'wrapper')
  const idField = validateOptionText(options.idField ?? 'id', 'idField')
  if (wrapper === 'meta') {
    throw new Error('wrapper cannot be "meta" because that name is reserved for output metadata.')
  }
  return { count, wrapper, idField }
}

function validateOptionText(value: string, name: string): string {
  if (typeof value !== 'string') throw new Error(`${name} must be text.`)
  if (value.length > 64) throw new Error(`${name} must be no more than 64 characters.`)
  if (CONTROL_CHARACTERS.test(value)) throw new Error(`${name} cannot contain control characters.`)
  return value
}

function isPlainObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype
}

function validateTemplate(template: JsonObject): void {
  const pending: Array<{ value: JsonValue; depth: number }> = [{ value: template, depth: 0 }]
  let nodeCount = 0
  while (pending.length > 0) {
    const { value, depth } = pending.pop()!
    nodeCount++
    if (nodeCount > MAX_JSON_NODES) {
      throw new Error(`Template exceeds the ${MAX_JSON_NODES.toLocaleString('en-US')}-value limit.`)
    }
    if (depth > MAX_JSON_DEPTH) {
      throw new Error(`Template exceeds the maximum depth of ${MAX_JSON_DEPTH}.`)
    }
    if (typeof value === 'number' && !Number.isFinite(value)) {
      throw new Error('Template contains a number outside the JSON numeric range.')
    }
    if (Array.isArray(value)) {
      if (value.length > MAX_CONTAINER_ITEMS) {
        throw new Error(`Arrays may contain no more than ${MAX_CONTAINER_ITEMS.toLocaleString('en-US')} items.`)
      }
      for (const child of value) pending.push({ value: child, depth: depth + 1 })
    } else if (value !== null && typeof value === 'object') {
      if (!isPlainObject(value)) throw new Error('Template may contain only plain JSON objects.')
      const keys = Object.keys(value)
      if (keys.length > MAX_CONTAINER_ITEMS) {
        throw new Error(`Objects may contain no more than ${MAX_CONTAINER_ITEMS.toLocaleString('en-US')} properties.`)
      }
      for (const key of keys) pending.push({ value: value[key], depth: depth + 1 })
    }
  }
}
