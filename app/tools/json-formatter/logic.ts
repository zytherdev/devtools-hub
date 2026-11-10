import { stringify as stringifyYAML } from 'yaml'

export const MAX_INPUT_CHARS = 1_000_000
const MAX_JSON_DEPTH = 100
const MAX_OUTPUT_CHARS = 5_000_000

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

export type FormatterMode = 'format' | 'minify' | 'validate' | 'sort' | 'csv' | 'yaml' | 'escape' | 'unescape'
export type FormatterOptions = {
  mode?: FormatterMode
  indentSize?: number
  escapeFormulaInjection?: boolean
}

function checkInput(code: string): void {
  if (typeof code !== 'string') throw new Error('Input must be a string.')
  if (code.length > MAX_INPUT_CHARS) throw new Error(`Input exceeds the ${MAX_INPUT_CHARS.toLocaleString()} character limit.`)
}

function parseJSON(code: string): JsonValue {
  checkInput(code)
  if (!code.trim()) throw new Error('Input is empty.')

  let parsed: JsonValue
  try {
    parsed = JSON.parse(code) as JsonValue
  } catch (cause) {
    throw new Error(`Invalid JSON: ${(cause as Error).message}`)
  }

  assertJSONDepth(parsed)
  return parsed
}

function assertJSONDepth(value: JsonValue): void {
  const pending: Array<{ value: JsonValue; depth: number }> = [{ value, depth: 0 }]
  while (pending.length) {
    const current = pending.pop()!
    if (current.depth > MAX_JSON_DEPTH) {
      throw new Error(`JSON nesting exceeds the maximum depth of ${MAX_JSON_DEPTH}.`)
    }
    if (current.value !== null && typeof current.value === 'object') {
      for (const child of Array.isArray(current.value) ? current.value : Object.values(current.value)) {
        pending.push({ value: child, depth: current.depth + 1 })
      }
    }
  }
}

function validateIndent(indent: number): number {
  if (!Number.isInteger(indent) || indent < 0 || indent > 10) {
    throw new Error('Indent size must be an integer from 0 to 10.')
  }
  return indent
}

function ensureOutput(output: string): string {
  if (output.length > MAX_OUTPUT_CHARS) {
    throw new Error(`Output exceeds the ${MAX_OUTPUT_CHARS.toLocaleString()} character limit.`)
  }
  return output
}

export function formatJSON(code: string, indent = 2): string {
  const parsed = parseJSON(code)
  return ensureOutput(JSON.stringify(parsed, null, validateIndent(indent)))
}

export function minifyJSON(code: string): string {
  return ensureOutput(JSON.stringify(parseJSON(code)))
}

export function validateJSON(code: string): { valid: boolean; error?: string } {
  try {
    parseJSON(code)
    return { valid: true }
  } catch (cause) {
    return { valid: false, error: (cause as Error).message }
  }
}

export function escapeJSON(code: string): string {
  checkInput(code)
  return ensureOutput(code.replace(/[\\"\u0000-\u001f]/g, character => {
    switch (character) {
      case '\\': return '\\\\'
      case '"': return '\\"'
      case '\b': return '\\b'
      case '\f': return '\\f'
      case '\n': return '\\n'
      case '\r': return '\\r'
      case '\t': return '\\t'
      default: return `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`
    }
  }))
}

export function unescapeJSON(code: string): string {
  checkInput(code)
  try {
    // Parsing a JSON string literal rejects incomplete/unknown escapes and raw controls.
    return JSON.parse(`"${code}"`) as string
  } catch (cause) {
    throw new Error(`Invalid JSON escape sequence: ${(cause as Error).message}`)
  }
}

function sortObject(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(sortObject)
  if (value !== null && typeof value === 'object') {
    // A null-prototype object safely preserves an own "__proto__" key.
    const sorted: Record<string, JsonValue> = Object.create(null) as Record<string, JsonValue>
    for (const key of Object.keys(value).sort()) sorted[key] = sortObject(value[key])
    return sorted
  }
  return value
}

export function sortJSONKeys(code: string, indent = 2): string {
  const sorted = sortObject(parseJSON(code))
  return ensureOutput(JSON.stringify(sorted, null, validateIndent(indent)))
}

function csvValue(value: JsonValue): string {
  if (value === null) return 'null'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

function encodeCSVCell(value: string, protectFormulas: boolean): string {
  // Spreadsheet applications may trim leading whitespace/control characters before interpreting formulas.
  const safeValue = protectFormulas && /^[\u0000-\u0020\uFEFF]*[=+@-]/.test(value) ? `'${value}` : value
  return `"${safeValue.replace(/"/g, '""')}"`
}

export function jsonToCSV(code: string, options: { escapeFormulaInjection?: boolean } = {}): string {
  const parsed = parseJSON(code)
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('JSON for CSV conversion must be a non-empty array of objects.')
  }
  if (parsed.some(row => row === null || typeof row !== 'object' || Array.isArray(row))) {
    throw new Error('Every row in the JSON array must be an object.')
  }

  const rows = parsed as Array<Record<string, JsonValue>>
  const headers = [...new Set(rows.flatMap(row => Object.keys(row)))]
  if (headers.length === 0) throw new Error('CSV conversion requires at least one object property.')
  if (typeof options.escapeFormulaInjection !== 'undefined' && typeof options.escapeFormulaInjection !== 'boolean') {
    throw new Error('CSV formula-injection protection option must be a boolean.')
  }
  const protectFormulas = options.escapeFormulaInjection !== false
  const encode = (value: string) => encodeCSVCell(value, protectFormulas)
  const output = [
    headers.map(encode).join(','),
    ...rows.map(row => headers.map(header => encode(Object.hasOwn(row, header) ? csvValue(row[header]) : '')).join(',')),
  ].join('\r\n')
  return ensureOutput(output)
}

export function jsonToYAML(code: string): string {
  const parsed = parseJSON(code)
  return ensureOutput(stringifyYAML(parsed, { lineWidth: 0 }))
}

export function run(input: string, options: FormatterOptions = {}): string {
  const mode = options.mode ?? 'format'
  switch (mode) {
    case 'format': return formatJSON(input, options.indentSize ?? 2)
    case 'minify': return minifyJSON(input)
    case 'validate': {
      const validation = validateJSON(input)
      if (!validation.valid) throw new Error(validation.error ?? 'Invalid JSON.')
      return formatJSON(input, options.indentSize ?? 2)
    }
    case 'sort': return sortJSONKeys(input, options.indentSize ?? 2)
    case 'csv': return jsonToCSV(input, { escapeFormulaInjection: options.escapeFormulaInjection })
    case 'yaml': return jsonToYAML(input)
    case 'escape': return escapeJSON(input)
    case 'unescape': return unescapeJSON(input)
    default: throw new Error('Unsupported formatter mode.')
  }
}
