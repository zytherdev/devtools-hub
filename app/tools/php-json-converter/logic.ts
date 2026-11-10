type ConverterOptions = Record<string, string>

type PhpKey = string | number

type PhpArray = { kind: 'php-array'; entries: Array<[PhpKey, unknown]> }

const MAX_INPUT_LENGTH = 2_000_000
const MAX_OUTPUT_LENGTH = 4_000_000
const MAX_DEPTH = 64
const MAX_NODES = 100_000
const INTEGER_LITERAL = /-?(?:0|[1-9]\d*)/
const FLOAT_LITERAL = /-?(?:(?:\d+\.\d*|\.\d+|\d+)(?:[eE][+-]?\d+)?)/

function assertSize(value: string, maximum: number, label: string): void {
  if (value.length > maximum) throw new Error(`${label} exceeds the ${maximum.toLocaleString()} character size limit.`)
}

function getIndent(options: ConverterOptions): number {
  const value = options.indent ?? '2'
  if (!/^[0-8]$/.test(value)) throw new Error('Invalid option "indent": expected an integer from 0 through 8.')
  return Number(value)
}

class LimitedParser {
  private index = 0
  private nodes = 0

  constructor(private readonly source: string, private readonly mode: 'array' | 'serialized') {}

  parse(): unknown {
    const value = this.mode === 'array' ? this.parseArrayRoot() : this.parseSerializedValue(0)
    this.skipWhitespace()
    if (this.index !== this.source.length) this.fail('Unexpected trailing syntax.')
    return value
  }

  private fail(message: string): never {
    throw new Error(`${this.mode === 'array' ? 'Unsupported or invalid PHP array syntax' : 'Unsupported or invalid PHP serialized data'} at character ${this.index + 1}: ${message}`)
  }

  private countNode(): void {
    this.nodes += 1
    if (this.nodes > MAX_NODES) this.fail(`node limit (${MAX_NODES.toLocaleString()}) exceeded.`)
  }

  private skipWhitespace(): void {
    while (/\s/.test(this.source[this.index] ?? '')) this.index += 1
  }

  private consume(expected: string): boolean {
    if (this.source.startsWith(expected, this.index)) {
      this.index += expected.length
      return true
    }
    return false
  }

  private expect(expected: string): void {
    if (!this.consume(expected)) this.fail(`Expected ${JSON.stringify(expected)}.`)
  }

  private parseArrayRoot(): PhpArray {
    this.skipWhitespace()
    if (this.source.startsWith('array', this.index) && !/[\w$]/.test(this.source[this.index + 5] ?? '')) {
      this.index += 5
      this.skipWhitespace()
      this.expect('(')
      const value = this.parsePhpArray(')', 0)
      this.skipWhitespace()
      this.expect(')')
      return value
    }
    if (this.consume('[')) {
      const value = this.parsePhpArray(']', 0)
      this.skipWhitespace()
      this.expect(']')
      return value
    }
    this.fail('Expected a standalone array(...) or [...] expression; PHP code and expressions are not evaluated.')
  }

  private parsePhpArray(end: ')' | ']', depth: number): PhpArray {
    if (depth >= MAX_DEPTH) this.fail(`nesting depth limit (${MAX_DEPTH}) exceeded.`)
    const entries: Array<[PhpKey, unknown]> = []
    const seen = new Set<string>()
    let nextIndex = 0
    this.skipWhitespace()
    if (this.source[this.index] === end) return { kind: 'php-array', entries }
    while (true) {
      this.skipWhitespace()
      const first = this.parsePhpValue(depth + 1)
      this.skipWhitespace()
      let key: PhpKey
      let value: unknown
      if (this.consume('=>')) {
        key = this.normalizePhpLiteralKey(first)
        this.skipWhitespace()
        value = this.parsePhpValue(depth + 1)
      } else {
        key = nextIndex
        value = first
      }
      key = this.normalizePhpLiteralKey(key)
      const identity = `${typeof key}:${String(key)}`
      if (seen.has(identity)) this.fail(`Duplicate array key ${JSON.stringify(String(key))} is rejected.`)
      seen.add(identity)
      if (typeof key === 'number' && key >= nextIndex) nextIndex = key + 1
      entries.push([key, value])
      this.skipWhitespace()
      if (this.consume(',')) {
        this.skipWhitespace()
        if (this.source[this.index] === end) return { kind: 'php-array', entries }
        continue
      }
      if (this.source[this.index] === end) return { kind: 'php-array', entries }
      this.fail(`Expected a comma or ${JSON.stringify(end)} after an array item.`)
    }
  }

  private normalizePhpLiteralKey(key: unknown): PhpKey {
    if (typeof key === 'number' && Number.isSafeInteger(key)) return key
    if (typeof key === 'string') {
      if (/^(?:0|-?[1-9]\d*)$/.test(key)) {
        const numeric = Number(key)
        if (Number.isSafeInteger(numeric)) return numeric
      }
      return key
    }
    this.fail('PHP array keys must be integer or string literals.')
  }

  private parsePhpValue(depth: number): unknown {
    if (depth > MAX_DEPTH) this.fail(`nesting depth limit (${MAX_DEPTH}) exceeded.`)
    this.skipWhitespace()
    this.countNode()
    if (this.source.startsWith('array', this.index) && !/[\w$]/.test(this.source[this.index + 5] ?? '')) {
      this.index += 5
      this.skipWhitespace()
      this.expect('(')
      const result = this.parsePhpArray(')', depth)
      this.skipWhitespace()
      this.expect(')')
      return result
    }
    if (this.consume('[')) {
      const result = this.parsePhpArray(']', depth)
      this.skipWhitespace()
      this.expect(']')
      return result
    }
    const char = this.source[this.index]
    if (char === "'" || char === '"') return this.parsePhpQuotedString()
    const word = /^(true|false|null)\b/i.exec(this.source.slice(this.index))
    if (word) {
      this.index += word[0].length
      if (word[0].toLowerCase() === 'true') return true
      if (word[0].toLowerCase() === 'false') return false
      return null
    }
    const number = FLOAT_LITERAL.exec(this.source.slice(this.index))
    if (number && (number[0].includes('.') || /[eE]/.test(number[0]))) {
      this.index += number[0].length
      const value = Number(number[0])
      if (!Number.isFinite(value)) this.fail('Non-finite numbers are not supported.')
      return value
    }
    const integer = INTEGER_LITERAL.exec(this.source.slice(this.index))
    if (integer) {
      this.index += integer[0].length
      const value = Number(integer[0])
      if (!Number.isSafeInteger(value)) this.fail('Integer is outside JavaScript’s safe integer range; precision could be lost.')
      return value
    }
    if (char === '$' || char === '&') this.fail('Variables and references are not supported.')
    if (!char) this.fail('Expected a scalar or nested array.')
    this.fail(`Unsupported token ${JSON.stringify(char)}; only strings, numbers, true, false, null, and arrays are supported.`)
  }

  private parsePhpQuotedString(): string {
    const quote = this.source[this.index++]
    let result = ''
    while (this.index < this.source.length) {
      const char = this.source[this.index++]
      if (char === quote) return result
      if (char !== '\\') {
        if (quote === '"' && char === '$') this.fail('Unescaped variable interpolation in double-quoted strings is not supported; use a literal single-quoted string or escape the dollar sign.')
        result += char
        continue
      }
      if (this.index >= this.source.length) this.fail('Unterminated escape in string literal.')
      const escaped = this.source[this.index++]
      if (quote === "'") {
        result += escaped === "'" || escaped === '\\' ? escaped : `\\${escaped}`
        continue
      }
      const simple: Record<string, string> = { n: '\n', r: '\r', t: '\t', v: '\v', e: '\x1b', f: '\f', '\\': '\\', '"': '"', '$': '$' }
      if (Object.prototype.hasOwnProperty.call(simple, escaped)) {
        result += simple[escaped]
        continue
      }
      if (escaped === 'x' || escaped === 'X') {
        const hex = /^[0-9a-fA-F]{1,2}/.exec(this.source.slice(this.index))
        if (!hex) this.fail('Hex string escapes require one or two hexadecimal digits.')
        result += String.fromCharCode(parseInt(hex[0], 16))
        this.index += hex[0].length
        continue
      }
      if (/[0-7]/.test(escaped)) {
        const octal = /^[0-7]{0,2}/.exec(this.source.slice(this.index))![0]
        result += String.fromCharCode(parseInt(escaped + octal, 8) & 0xff)
        this.index += octal.length
        continue
      }
      result += `\\${escaped}`
    }
    this.fail('Unterminated quoted string.')
  }

  private parseSerializedValue(depth: number): unknown {
    if (depth > MAX_DEPTH) this.fail(`nesting depth limit (${MAX_DEPTH}) exceeded.`)
    this.countNode()
    const token = this.source[this.index]
    if (token === 'N') {
      this.index += 1
      this.expect(';')
      return null
    }
    if (token === 'b') {
      this.index += 1
      this.expect(':')
      const value = this.readUntil(';')
      if (value !== '0' && value !== '1') this.fail('Boolean token must be b:0; or b:1;.')
      return value === '1'
    }
    if (token === 'i') {
      this.index += 1
      this.expect(':')
      const text = this.readUntil(';')
      if (!/^-?(?:0|[1-9]\d*)$/.test(text)) this.fail('Invalid serialized integer.')
      const value = Number(text)
      if (!Number.isSafeInteger(value)) this.fail('Serialized integer is outside JavaScript’s safe integer range; precision could be lost.')
      return value
    }
    if (token === 'd') {
      this.index += 1
      this.expect(':')
      const text = this.readUntil(';')
      if (!/^(?:-?(?:(?:\d+\.\d*|\.\d+|\d+)(?:[eE][+-]?\d+)?|INF)|NAN)$/i.test(text)) this.fail('Invalid serialized number.')
      const value = Number(text)
      if (!Number.isFinite(value)) this.fail('Non-finite serialized numbers are not supported in JSON.')
      return value
    }
    if (token === 's') {
      this.index += 1
      this.expect(':')
      const byteLengthText = this.readUntil(':')
      if (!/^(?:0|[1-9]\d*)$/.test(byteLengthText)) this.fail('Invalid serialized string byte length.')
      const byteLength = Number(byteLengthText)
      if (!Number.isSafeInteger(byteLength) || byteLength > MAX_INPUT_LENGTH) this.fail('Serialized string byte length exceeds the supported limit.')
      this.expect('"')
      const value = this.readUtf8Bytes(byteLength)
      this.expect('"')
      this.expect(';')
      return value
    }
    if (token === 'a') {
      this.index += 1
      this.expect(':')
      const countText = this.readUntil(':')
      if (!/^(?:0|[1-9]\d*)$/.test(countText)) this.fail('Invalid serialized array item count.')
      const count = Number(countText)
      if (!Number.isSafeInteger(count) || count > MAX_NODES) this.fail(`Serialized array item count exceeds the node limit (${MAX_NODES.toLocaleString()}).`)
      this.expect('{')
      const entries: Array<[PhpKey, unknown]> = []
      const seen = new Set<string>()
      for (let i = 0; i < count; i += 1) {
        const key = this.parseSerializedValue(depth + 1)
        if (typeof key !== 'string' && (typeof key !== 'number' || !Number.isSafeInteger(key))) this.fail('Serialized PHP array keys must be integers or strings.')
        const identity = `${typeof key}:${String(key)}`
        if (seen.has(identity)) this.fail(`Duplicate serialized array key ${JSON.stringify(String(key))} is rejected.`)
        seen.add(identity)
        const value = this.parseSerializedValue(depth + 1)
        entries.push([key, value])
      }
      this.expect('}')
      return { kind: 'php-array', entries }
    }
    if (token === 'O' || token === 'C' || token === 'E' || token === 'R' || token === 'r') {
      this.fail(`Serialized token ${JSON.stringify(token)} is explicitly unsupported; objects, custom objects, enums, and references are rejected.`)
    }
    if (!token) this.fail('Expected a serialized value token.')
    this.fail(`Unsupported serialized token ${JSON.stringify(token)}; only N, b, i, d, s, and a tokens are supported.`)
  }

  private readUntil(delimiter: string): string {
    const end = this.source.indexOf(delimiter, this.index)
    if (end < 0) this.fail(`Expected ${JSON.stringify(delimiter)}.`)
    const value = this.source.slice(this.index, end)
    this.index = end + delimiter.length
    return value
  }

  private readUtf8Bytes(expectedBytes: number): string {
    const start = this.index
    let bytes = 0
    while (bytes < expectedBytes) {
      if (this.index >= this.source.length) this.fail('Serialized string ended before its declared UTF-8 byte length.')
      const point = this.source.codePointAt(this.index)!
      const char = String.fromCodePoint(point)
      if (point >= 0xd800 && point <= 0xdfff) this.fail('Unpaired surrogate cannot be represented as valid UTF-8.')
      const width = point <= 0x7f ? 1 : point <= 0x7ff ? 2 : point <= 0xffff ? 3 : 4
      if (bytes + width > expectedBytes) this.fail('Serialized string byte length ends inside a UTF-8 character.')
      bytes += width
      this.index += char.length
    }
    const value = this.source.slice(start, this.index)
    if (new TextEncoder().encode(value).length !== expectedBytes) this.fail('Serialized string does not match its declared UTF-8 byte length.')
    return value
  }
}

function normalizeForJson(value: unknown, path: string): unknown {
  if (typeof value !== 'object' || value === null) return value
  if (!('kind' in value) || (value as { kind?: unknown }).kind !== 'php-array') return value
  const entries = (value as PhpArray).entries
  const isList = entries.every(([key], index) => typeof key === 'number' && key === index)
  if (isList) return entries.map(([, child], index) => normalizeForJson(child, `${path}[${index}]`))
  const result: Record<string, unknown> = Object.create(null) as Record<string, unknown>
  for (const [key, child] of entries) {
    const jsonKey = String(key)
    if (Object.prototype.hasOwnProperty.call(result, jsonKey)) {
      throw new Error(`PHP array keys collide as JSON object key ${JSON.stringify(jsonKey)} at ${path}; conversion would lose data.`)
    }
    result[jsonKey] = normalizeForJson(child, `${path}[${JSON.stringify(jsonKey)}]`)
  }
  return result
}

/** Convert a limited PHP array literal or PHP serialized value to JSON; never executes PHP. */
export function convertPhpJson(input: string, options: Record<string, string>): string {
  if (typeof input !== 'string') throw new Error('Input must be a string containing a PHP array or serialized value.')
  const safeOptions: ConverterOptions = options ?? {}
  const indent = getIndent(safeOptions)
  const format = safeOptions.format ?? 'auto'
  if (format !== 'auto' && format !== 'array' && format !== 'serialized') {
    throw new Error('Invalid option "format": expected "auto", "array", or "serialized".')
  }
  assertSize(input, MAX_INPUT_LENGTH, 'Input')
  if (!input.trim()) throw new Error('Paste a PHP array or serialized value to convert.')

  let mode: 'array' | 'serialized'
  if (format === 'array') mode = 'array'
  else if (format === 'serialized') mode = 'serialized'
  else {
    const first = input.trimStart()[0]
    mode = first === '[' || input.trimStart().startsWith('array') ? 'array' : 'serialized'
  }

  const parsed = new LimitedParser(input, mode).parse()
  const output = JSON.stringify(normalizeForJson(parsed, '$'), null, indent)
  assertSize(output, MAX_OUTPUT_LENGTH, 'Converted output')
  return output
}

export function run(input: string, options: Record<string, string> = {}): string {
  return convertPhpJson(input, options)
}
