const MAX_BYTES = 64 * 1024 * 1024
const MAX_BASE64_CHARS = 4 * Math.ceil(MAX_BYTES / 3)
const STANDARD_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
const URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

type EncodeOptions = { urlSafe?: boolean; padding?: boolean }
type DecodeOptions = { urlSafe?: boolean; allowWhitespace?: boolean; allowUnpadded?: boolean }

/** Encode bytes as Base64 without relying on browser-specific binary-string APIs. */
export function encodeBase64(bytes: Uint8Array, options: EncodeOptions = {}): string {
  if (bytes.length > MAX_BYTES) throw new RangeError('Input exceeds the 64 MiB Base64 processing limit.')
  const alphabet = options.urlSafe ? URL_ALPHABET : STANDARD_ALPHABET
  const includePadding = options.padding !== false
  const chunks: string[] = []
  let chunk = ''

  for (let i = 0; i < bytes.length; i += 3) {
    const remaining = bytes.length - i
    const a = bytes[i]
    const b = remaining > 1 ? bytes[i + 1] : 0
    const c = remaining > 2 ? bytes[i + 2] : 0
    const n = (a << 16) | (b << 8) | c
    chunk += alphabet[(n >>> 18) & 63]
    chunk += alphabet[(n >>> 12) & 63]
    if (remaining > 1) chunk += alphabet[(n >>> 6) & 63]
    else if (includePadding) chunk += '='
    if (remaining > 2) chunk += alphabet[n & 63]
    else if (includePadding) chunk += '='

    if (chunk.length >= 32768) {
      chunks.push(chunk)
      chunk = ''
    }
  }

  if (chunk) chunks.push(chunk)
  return chunks.join('')
}

function sextet(code: number, urlSafe: boolean): number {
  if (code >= 65 && code <= 90) return code - 65
  if (code >= 97 && code <= 122) return code - 71
  if (code >= 48 && code <= 57) return code + 4
  if (urlSafe) {
    if (code === 45) return 62
    if (code === 95) return 63
  } else {
    if (code === 43) return 62
    if (code === 47) return 63
  }
  return -1
}

/** Decode strictly validated Base64 into bytes. */
export function decodeBase64(input: string, options: DecodeOptions = {}): Uint8Array {
  if (input.length > MAX_BASE64_CHARS) throw new RangeError('Input exceeds the 64 MiB Base64 processing limit.')
  let encoded = input
  if (options.allowWhitespace) {
    // Ignore only ASCII whitespace; other Unicode whitespace remains invalid.
    encoded = input.replace(/[\t\n\v\f\r ]/g, '')
  } else if (/[\t\n\v\f\r ]/.test(input)) {
    throw new Error('Whitespace is not allowed in Base64 input.')
  }

  if (encoded.length > MAX_BASE64_CHARS) throw new RangeError('Input exceeds the 64 MiB Base64 processing limit.')
  const urlSafe = options.urlSafe === true
  let padding = 0
  if (encoded.endsWith('=')) {
    padding = encoded.endsWith('==') ? 2 : 1
  }
  const dataLength = encoded.length - padding
  if (encoded.slice(0, dataLength).includes('=')) throw new Error('Base64 padding is only allowed at the end.')

  if (padding > 0) {
    if (encoded.length % 4 !== 0) throw new Error('Invalid Base64 padding or length.')
    const remainder = dataLength % 4
    if ((padding === 2 && remainder !== 2) || (padding === 1 && remainder !== 3)) {
      throw new Error('Invalid Base64 padding or length.')
    }
  } else {
    const remainder = dataLength % 4
    if (remainder === 1) throw new Error('Invalid Base64 length.')
    if (remainder !== 0 && options.allowUnpadded !== true) throw new Error('Unpadded Base64 is not allowed.')
  }

  const remainder = dataLength % 4
  if (remainder === 2 && (sextet(encoded.charCodeAt(dataLength - 1), urlSafe) & 15) !== 0) {
    throw new Error('Non-canonical Base64 trailing bits.')
  }
  if (remainder === 3 && (sextet(encoded.charCodeAt(dataLength - 1), urlSafe) & 3) !== 0) {
    throw new Error('Non-canonical Base64 trailing bits.')
  }

  for (let i = 0; i < dataLength; i++) {
    if (sextet(encoded.charCodeAt(i), urlSafe) < 0) throw new Error('Invalid character in Base64 input.')
  }

  const outputLength = Math.floor((dataLength * 6) / 8)
  if (outputLength > MAX_BYTES) throw new RangeError('Decoded data exceeds the 64 MiB processing limit.')
  const output = new Uint8Array(outputLength)
  let accumulator = 0
  let bits = 0
  let outputIndex = 0
  for (let i = 0; i < dataLength; i++) {
    accumulator = (accumulator << 6) | sextet(encoded.charCodeAt(i), urlSafe)
    bits += 6
    if (bits >= 8) {
      bits -= 8
      output[outputIndex++] = (accumulator >>> bits) & 255
      accumulator &= (1 << bits) - 1
    }
  }
  return output
}

function assertUtf8SizeWithinLimit(input: string): void {
  let byteLength = 0
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i)
    if (code <= 0x7f) byteLength++
    else if (code <= 0x7ff) byteLength += 2
    else if (code >= 0xd800 && code <= 0xdbff && i + 1 < input.length) {
      const next = input.charCodeAt(i + 1)
      if (next >= 0xdc00 && next <= 0xdfff) {
        byteLength += 4
        i++
      } else byteLength += 3
    } else byteLength += 3
    if (byteLength > MAX_BYTES) throw new RangeError('Text exceeds the 64 MiB Base64 processing limit.')
  }
}

/** Encode or decode Unicode text as UTF-8 Base64, using fatal UTF-8 decoding. */
export function transformBase64(input: string, options: Record<string, string>): string {
  const operation = options.operation ?? options.mode ?? options.action ?? 'encode'
  if (operation === 'encode') {
    assertUtf8SizeWithinLimit(input)
    const bytes = new TextEncoder().encode(input)
    return encodeBase64(bytes, {
      urlSafe: options.urlSafe === 'true',
      padding: options.padding !== 'false',
    })
  }
  if (operation === 'decode') {
    const bytes = decodeBase64(input, {
      urlSafe: options.urlSafe === 'true',
      allowWhitespace: options.allowWhitespace === 'true',
      allowUnpadded: options.allowUnpadded === 'true',
    })
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  }
  throw new Error('Base64 operation must be "encode" or "decode".')
}
