import * as TOML from '@iarna/toml'

type ConverterOptions = Record<string, string>

const MAX_INPUT_LENGTH = 5_000_000
const MAX_OUTPUT_LENGTH = 5_000_000
const JSON_NUMBER = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y

function assertSize(value: string, maximum: number, label: string): void {
  if (value.length > maximum) {
    throw new Error(`${label} exceeds the ${maximum.toLocaleString()} character size limit.`)
  }
}

function getIndent(options: ConverterOptions): number {
  const value = options.indent ?? '2'
  if (!/^[0-8]$/.test(value)) {
    throw new Error('Invalid option "indent": expected an integer from 0 through 8.')
  }
  return Number(value)
}

/** Detect integer-valued JSON number tokens that JavaScript cannot represent safely. */
function rejectUnsafeJsonIntegers(input: string): void {
  let index = 0
  while (index < input.length) {
    if (input[index] === '"') {
      index += 1
      while (index < input.length) {
        if (input[index] === '\\') {
          index += 2
        } else if (input[index] === '"') {
          index += 1
          break
        } else {
          index += 1
        }
      }
      continue
    }

    if (input[index] === '-' || (input[index] >= '0' && input[index] <= '9')) {
      JSON_NUMBER.lastIndex = index
      const match = JSON_NUMBER.exec(input)
      if (match) {
        const value = Number(match[0])
        if (Number.isInteger(value) && !Number.isSafeInteger(value)) {
          throw new Error(`JSON number ${match[0]} is outside JavaScript's safe integer range; precision could be lost.`)
        }
        index = JSON_NUMBER.lastIndex
        continue
      }
    }
    index += 1
  }
}

function assertTomlCompatible(value: unknown, path: string): void {
  if (value === null) {
    throw new Error(`JSON null is not supported by TOML (${path}). Replace it with a string, number, boolean, array, or object.`)
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error(`Non-finite numbers are not supported by TOML (${path}).`)
    if (Number.isInteger(value) && !Number.isSafeInteger(value)) {
      throw new Error(`Integer at ${path} is outside JavaScript's safe integer range; precision could be lost.`)
    }
    return
  }
  if (typeof value === 'string' || typeof value === 'boolean') return
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertTomlCompatible(item, `${path}[${index}]`))
    return
  }
  if (typeof value === 'object' && value !== null) {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      assertTomlCompatible(child, `${path}.${key}`)
    }
    return
  }
  throw new Error(`Unsupported JSON value at ${path}; TOML supports only strings, finite numbers, booleans, arrays, and objects.`)
}

function normalizeTomlDates(value: unknown, path: string): unknown {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new Error(`TOML date at ${path} is invalid.`)
    return value.toISOString()
  }
  if (typeof value === 'bigint') {
    throw new Error(`TOML integer at ${path} is outside JavaScript's safe integer range; precision could be lost.`)
  }
  if (typeof value === 'number' && Number.isInteger(value) && !Number.isSafeInteger(value)) {
    throw new Error(`TOML integer at ${path} is outside JavaScript's safe integer range; precision could be lost.`)
  }
  if (Array.isArray(value)) return value.map((item, index) => normalizeTomlDates(item, `${path}[${index}]`))
  if (typeof value === 'object' && value !== null) {
    const normalized: Record<string, unknown> = Object.create(null) as Record<string, unknown>
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      normalized[key] = normalizeTomlDates(child, `${path}.${key}`)
    }
    return normalized
  }
  return value
}

/** Convert TOML to JSON or JSON to TOML using the string-valued tool options. */
export function convertTomlJson(input: string, options: Record<string, string>): string {
  if (typeof input !== 'string') throw new Error('Input must be a string containing TOML or JSON.')
  const safeOptions: ConverterOptions = options ?? {}
  const direction = safeOptions.direction ?? 'toml-to-json'
  if (direction !== 'toml-to-json' && direction !== 'json-to-toml') {
    throw new Error('Invalid option "direction": expected "toml-to-json" or "json-to-toml".')
  }
  const indent = getIndent(safeOptions)
  assertSize(input, MAX_INPUT_LENGTH, 'Input')
  if (!input.trim()) throw new Error('Paste TOML or JSON data to convert.')

  let output: string
  if (direction === 'toml-to-json') {
    let parsed: TOML.JsonMap
    try {
      parsed = TOML.parse(input)
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(`Invalid TOML: ${detail}`)
    }
    const normalized = normalizeTomlDates(parsed, '$')
    output = JSON.stringify(normalized, null, indent)
  } else {
    rejectUnsafeJsonIntegers(input)
    let parsed: unknown
    try {
      parsed = JSON.parse(input) as unknown
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(`Invalid JSON: ${detail}`)
    }
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('JSON-to-TOML requires a root object (a JSON object enclosed in braces).')
    }
    assertTomlCompatible(parsed, '$')
    try {
      output = TOML.stringify(parsed as TOML.JsonMap)
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(`JSON values could not be represented as TOML: ${detail}`)
    }
  }

  assertSize(output, MAX_OUTPUT_LENGTH, 'Converted output')
  return output
}
