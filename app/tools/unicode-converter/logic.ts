const MAX_TEXT_LENGTH = 1024 * 1024
const MAX_ENCODED_LENGTH = 8 * MAX_TEXT_LENGTH
const MAX_DECODE_INPUT_LENGTH = 8 * MAX_TEXT_LENGTH
const ALLOWED_OPTIONS = new Set(['operation', 'mode', 'action', 'format', 'encoding'])

type Operation = 'encode' | 'decode'
type Format = 'codepoint' | 'utf8' | 'utf16' | 'javascript'

function assertWellFormedUnicode(value: string): void {
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index)
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1)
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        throw new Error('Input contains an unpaired UTF-16 high surrogate; provide valid Unicode text.')
      }
      index++
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      throw new Error('Input contains an unpaired UTF-16 low surrogate; provide valid Unicode text.')
    }
  }
}

function parseOptions(options: Record<string, string>): { operation: Operation; format: Format } {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('Unicode options must be an object containing string values.')
  }

  for (const key of Object.keys(options)) {
    if (!ALLOWED_OPTIONS.has(key)) throw new Error(`Unknown Unicode option: "${key}".`)
    if (typeof options[key] !== 'string') throw new Error(`Unicode option "${key}" must be a string.`)
  }

  const operations = ['operation', 'mode', 'action']
    .filter(key => Object.prototype.hasOwnProperty.call(options, key))
    .map(key => options[key])
  if (operations.some(value => value !== 'encode' && value !== 'decode')) {
    throw new Error('Unicode operation must be "encode" or "decode".')
  }
  if (operations.some(value => value !== operations[0])) {
    throw new Error('Unicode operation aliases (operation, mode, action) must agree.')
  }

  const formats = ['format', 'encoding']
    .filter(key => Object.prototype.hasOwnProperty.call(options, key))
    .map(key => options[key])
  const normalized = formats.map(normalizeFormat)
  if (normalized.some(value => value !== normalized[0])) {
    throw new Error('Unicode format aliases (format, encoding) must agree.')
  }

  return {
    operation: (operations[0] || 'encode') as Operation,
    format: normalized[0] || 'codepoint',
  }
}

function normalizeFormat(value: string): Format {
  switch (value.toLowerCase()) {
    case 'unicode':
    case 'codepoint':
    case 'codepoints':
    case 'unicode-codepoint':
      return 'codepoint'
    case 'utf8':
    case 'utf-8':
      return 'utf8'
    case 'utf16':
    case 'utf-16':
      return 'utf16'
    case 'javascript':
    case 'js':
    case 'js-escape':
    case 'escape':
      return 'javascript'
    default:
      throw new Error('Unicode format must be "codepoint", "utf8", "utf16", or "javascript".')
  }
}

function assertInputLength(input: string, limit: number, description: string): void {
  if (input.length > limit) throw new RangeError(`${description} exceeds the ${Math.floor(limit / (1024 * 1024))} MiB processing limit.`)
}

function joinBounded(parts: string[], limit: number, description: string): string {
  let length = 0
  for (const part of parts) {
    length += part.length
    if (length > limit) throw new RangeError(`${description} exceeds the ${Math.floor(limit / (1024 * 1024))} MiB output limit.`)
  }
  return parts.join('')
}

function bytesForCodePoint(codePoint: number): number[] {
  if (codePoint <= 0x7f) return [codePoint]
  if (codePoint <= 0x7ff) return [0xc0 | (codePoint >> 6), 0x80 | (codePoint & 0x3f)]
  if (codePoint <= 0xffff) return [0xe0 | (codePoint >> 12), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f)]
  return [0xf0 | (codePoint >> 18), 0x80 | ((codePoint >> 12) & 0x3f), 0x80 | ((codePoint >> 6) & 0x3f), 0x80 | (codePoint & 0x3f)]
}

function encode(input: string, format: Format): string {
  assertInputLength(input, MAX_TEXT_LENGTH, 'Unicode text')
  assertWellFormedUnicode(input)
  const parts: string[] = []

  if (format === 'javascript') {
    for (let index = 0; index < input.length; index++) {
      parts.push(`\\u${input.charCodeAt(index).toString(16).padStart(4, '0').toUpperCase()}`)
    }
  } else if (format === 'utf16') {
    for (let index = 0; index < input.length; index++) {
      parts.push(input.charCodeAt(index).toString(16).padStart(4, '0').toUpperCase())
    }
    return joinBounded(parts.map((part, index) => index === 0 ? part : ` ${part}`), MAX_ENCODED_LENGTH, 'Encoded Unicode output')
  } else {
    for (const character of input) {
      const codePoint = character.codePointAt(0) as number
      if (format === 'codepoint') {
        parts.push(`U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`)
      } else {
        for (const byte of bytesForCodePoint(codePoint)) parts.push(byte.toString(16).padStart(2, '0').toUpperCase())
      }
    }
  }

  const separator = format === 'javascript' ? '' : ' '
  return joinBounded(parts.map((part, index) => index === 0 ? part : `${separator}${part}`), MAX_ENCODED_LENGTH, 'Encoded Unicode output')
}

function parseSeparatedHex(input: string, digitsPerToken: number, description: string): number[] {
  if (input.trim() === '') return []
  const tokens = input.trim().split(/[\s,]+/)
  if (tokens.length > MAX_TEXT_LENGTH * 4) throw new RangeError(`${description} contains too many values.`)
  return tokens.map(token => {
    const normalized = token.startsWith('0x') || token.startsWith('0X') ? token.slice(2) : token
    if (normalized.length !== digitsPerToken || !/^[0-9a-fA-F]+$/.test(normalized)) {
      throw new Error(`${description} must contain ${digitsPerToken}-digit hexadecimal values separated by spaces or commas.`)
    }
    return Number.parseInt(normalized, 16)
  })
}

function decodeCodePoints(input: string): string {
  if (input.trim() === '') return ''
  const tokens = input.trim().split(/[\s,]+/)
  if (tokens.length > MAX_TEXT_LENGTH) throw new RangeError('Unicode input contains too many code points.')
  const parts: string[] = []
  for (const token of tokens) {
    const match = /^U\+([0-9a-fA-F]{4,6})$/i.exec(token)
    if (!match) throw new Error(`Malformed Unicode code point "${token}"; expected U+ followed by 4 to 6 hexadecimal digits.`)
    const codePoint = Number.parseInt(match[1], 16)
    if (codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff)) {
      throw new Error(`Invalid Unicode scalar value in "${token}".`)
    }
    parts.push(String.fromCodePoint(codePoint))
  }
  return joinBounded(parts, MAX_TEXT_LENGTH, 'Decoded Unicode text')
}

function decodeUtf16(input: string): string {
  const units = parseSeparatedHex(input, 4, 'UTF-16 input')
  if (units.length > MAX_TEXT_LENGTH) throw new RangeError('UTF-16 input contains too many code units.')
  const parts: string[] = []
  for (const unit of units) parts.push(String.fromCharCode(unit))
  const result = parts.join('')
  assertWellFormedUnicode(result)
  if (result.length > MAX_TEXT_LENGTH) throw new RangeError('Decoded Unicode text exceeds the 1 MiB output limit.')
  return result
}

function decodeUtf8(input: string): string {
  const bytes = parseSeparatedHex(input, 2, 'UTF-8 input')
  if (bytes.length > MAX_DECODE_INPUT_LENGTH) throw new RangeError('UTF-8 input contains too many bytes.')
  const parts: string[] = []

  for (let index = 0; index < bytes.length;) {
    const first = bytes[index]
    let codePoint: number
    let continuationCount: number
    let minimum: number
    if (first <= 0x7f) {
      codePoint = first
      continuationCount = 0
      minimum = 0
    } else if (first >= 0xc2 && first <= 0xdf) {
      codePoint = first & 0x1f
      continuationCount = 1
      minimum = 0x80
    } else if (first >= 0xe0 && first <= 0xef) {
      codePoint = first & 0x0f
      continuationCount = 2
      minimum = 0x800
    } else if (first >= 0xf0 && first <= 0xf4) {
      codePoint = first & 0x07
      continuationCount = 3
      minimum = 0x10000
    } else {
      throw new Error(`Invalid UTF-8 leading byte at byte ${index + 1}.`)
    }

    if (index + continuationCount >= bytes.length) throw new Error('Truncated UTF-8 sequence; one or more continuation bytes are missing.')
    for (let offset = 1; offset <= continuationCount; offset++) {
      const next = bytes[index + offset]
      if (next < 0x80 || next > 0xbf) throw new Error(`Invalid UTF-8 continuation byte at byte ${index + offset + 1}.`)
      codePoint = (codePoint << 6) | (next & 0x3f)
    }
    if (codePoint < minimum || codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff)) {
      throw new Error(`Invalid UTF-8 sequence beginning at byte ${index + 1}.`)
    }
    parts.push(String.fromCodePoint(codePoint))
    index += continuationCount + 1
  }
  return joinBounded(parts, MAX_TEXT_LENGTH, 'Decoded Unicode text')
}

function decodeJavaScript(input: string): string {
  if (input.length > MAX_DECODE_INPUT_LENGTH) throw new RangeError('JavaScript Unicode escapes exceed the 8 MiB processing limit.')
  if (input.length % 6 !== 0 || !/^(?:\\u[0-9a-fA-F]{4})*$/i.test(input)) {
    throw new Error('Malformed JavaScript Unicode escapes; expected a contiguous sequence of \\uXXXX escapes.')
  }
  const parts: string[] = []
  for (let index = 0; index < input.length; index += 6) {
    parts.push(String.fromCharCode(Number.parseInt(input.slice(index + 2, index + 6), 16)))
  }
  const result = parts.join('')
  assertWellFormedUnicode(result)
  if (result.length > MAX_TEXT_LENGTH) throw new RangeError('Decoded Unicode text exceeds the 1 MiB output limit.')
  return result
}

/** Convert text to and from Unicode code points, UTF-8 bytes, UTF-16 units, or JS escapes locally. */
export function convertUnicode(input: string, options: Record<string, string>): string {
  if (typeof input !== 'string') throw new Error('Unicode input must be text.')
  const { operation, format } = parseOptions(options)
  if (operation === 'encode') return encode(input, format)
  assertInputLength(input, MAX_DECODE_INPUT_LENGTH, 'Unicode encoded input')
  return format === 'codepoint'
    ? decodeCodePoints(input)
    : format === 'utf8'
      ? decodeUtf8(input)
      : format === 'utf16'
        ? decodeUtf16(input)
        : decodeJavaScript(input)
}

export function run(input: string, options: Record<string, string> = {}): string {
  return convertUnicode(input, options)
}
