const MAX_PAYLOAD_LENGTH = 128 * 1024
const MAX_HEADER_LENGTH = 16 * 1024
const MAX_SECRET_LENGTH = 16 * 1024
const MAX_JSON_DEPTH = 64
const MAX_JSON_NODES = 20_000
const MAX_TOKEN_LENGTH = 256 * 1024
const MAX_EXPIRATION_SECONDS = 10 * 365 * 24 * 60 * 60
const ALLOWED_OPTIONS = new Set(['secret', 'header', 'expiresIn'])
const textEncoder = new TextEncoder()

type JsonObject = Record<string, unknown>

function assertWellFormedUnicode(value: string, label: string): void {
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index)
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1)
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        throw new Error(`${label} contains an unpaired UTF-16 high surrogate; provide valid Unicode text.`)
      }
      index++
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      throw new Error(`${label} contains an unpaired UTF-16 low surrogate; provide valid Unicode text.`)
    }
  }
}

/** Parses bounded JSON, rejects duplicate object keys, and preserves objects without prototype setters. */
class StrictJsonParser {
  private index = 0
  private nodes = 0

  constructor(private readonly source: string, private readonly label: string) {}

  parse(): unknown {
    const value = this.parseValue(0)
    this.skipWhitespace()
    if (this.index !== this.source.length) this.fail('contains unexpected trailing characters')
    return value
  }

  private parseValue(depth: number): unknown {
    this.skipWhitespace()
    this.nodes++
    if (this.nodes > MAX_JSON_NODES) {
      throw new RangeError(`${this.label} exceeds the ${MAX_JSON_NODES.toLocaleString()}-value processing limit.`)
    }

    const character = this.source[this.index]
    if (character === '{') return this.parseObject(depth + 1)
    if (character === '[') return this.parseArray(depth + 1)
    if (character === '"') return this.parseString()
    if (character === 't' && this.source.startsWith('true', this.index)) { this.index += 4; return true }
    if (character === 'f' && this.source.startsWith('false', this.index)) { this.index += 5; return false }
    if (character === 'n' && this.source.startsWith('null', this.index)) { this.index += 4; return null }
    if (character === '-' || (character >= '0' && character <= '9')) return this.parseNumber()
    this.fail('is not valid JSON')
  }

  private parseObject(depth: number): JsonObject {
    this.assertDepth(depth)
    this.index++
    this.skipWhitespace()
    const result: JsonObject = Object.create(null) as JsonObject
    const keys = new Set<string>()
    if (this.source[this.index] === '}') { this.index++; return result }

    while (this.index < this.source.length) {
      this.skipWhitespace()
      if (this.source[this.index] !== '"') this.fail('contains an object key that is not a JSON string')
      const key = this.parseString()
      if (keys.has(key)) this.fail(`contains a duplicate object key (${JSON.stringify(key)})`)
      keys.add(key)
      this.skipWhitespace()
      if (this.source[this.index] !== ':') this.fail('contains an object key without a colon')
      this.index++
      const value = this.parseValue(depth)
      Object.defineProperty(result, key, { value, enumerable: true, configurable: true, writable: true })
      this.skipWhitespace()
      const delimiter = this.source[this.index]
      if (delimiter === '}') { this.index++; return result }
      if (delimiter !== ',') this.fail('contains an unterminated object or invalid delimiter')
      this.index++
    }
    this.fail('contains an unterminated object')
  }

  private parseArray(depth: number): unknown[] {
    this.assertDepth(depth)
    this.index++
    this.skipWhitespace()
    const result: unknown[] = []
    if (this.source[this.index] === ']') { this.index++; return result }

    while (this.index < this.source.length) {
      result.push(this.parseValue(depth))
      this.skipWhitespace()
      const delimiter = this.source[this.index]
      if (delimiter === ']') { this.index++; return result }
      if (delimiter !== ',') this.fail('contains an unterminated array or invalid delimiter')
      this.index++
    }
    this.fail('contains an unterminated array')
  }

  private parseString(): string {
    const start = this.index
    this.index++
    while (this.index < this.source.length) {
      const code = this.source.charCodeAt(this.index)
      if (code === 0x22) {
        this.index++
        let value: string
        try {
          value = JSON.parse(this.source.slice(start, this.index)) as string
        } catch {
          this.fail('contains a malformed JSON string')
        }
        assertWellFormedUnicode(value, this.label)
        return value
      }
      if (code < 0x20) this.fail('contains an unescaped control character in a string')
      if (code === 0x5c) {
        this.index++
        const escape = this.source[this.index]
        if (escape === 'u') {
          if (!/^[\da-fA-F]{4}$/.test(this.source.slice(this.index + 1, this.index + 5))) {
            this.fail('contains a malformed Unicode escape')
          }
          this.index += 5
          continue
        }
        if (!escape || !/["\\/bfnrt]/.test(escape)) this.fail('contains an invalid string escape')
        this.index++
        continue
      }
      this.index++
    }
    this.fail('contains an unterminated JSON string')
  }

  private parseNumber(): number {
    const match = this.source.slice(this.index).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/)
    if (!match) this.fail('contains an invalid JSON number')
    this.index += match[0].length
    const value = Number(match[0])
    if (!Number.isFinite(value)) this.fail('contains a number outside the finite JSON range')
    return value
  }

  private assertDepth(depth: number): void {
    if (depth > MAX_JSON_DEPTH) {
      throw new RangeError(`${this.label} exceeds the ${MAX_JSON_DEPTH}-level nesting limit.`)
    }
  }

  private skipWhitespace(): void {
    while (this.source[this.index] === ' ' || this.source[this.index] === '\t' || this.source[this.index] === '\r' || this.source[this.index] === '\n') this.index++
  }

  private fail(detail: string): never {
    throw new Error(`${this.label} ${detail}.`)
  }
}

function parseJsonObject(source: string, label: string): JsonObject {
  let value: unknown
  try {
    value = new StrictJsonParser(source, label).parse()
  } catch (error) {
    if (error instanceof RangeError) throw error
    if (error instanceof Error && error.message.startsWith(`${label} `)) throw error
    throw new Error(`${label} is not valid JSON.`)
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be a JSON object.`)
  }
  return value as JsonObject
}

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const end = Math.min(offset + chunkSize, bytes.length)
    for (let index = offset; index < end; index++) binary += String.fromCharCode(bytes[index])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function parseOptions(options: Record<string, string>): { secret: string; header: JsonObject; expiresIn?: number } {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('JWT Generator options must be an object containing string values.')
  }

  for (const key of Object.keys(options)) {
    if (!ALLOWED_OPTIONS.has(key)) throw new Error(`Unknown JWT Generator option: "${key}".`)
    if (typeof options[key] !== 'string') throw new Error(`JWT Generator option "${key}" must be a string.`)
  }

  const secret = options.secret
  if (typeof secret !== 'string' || secret.length === 0 || !secret.trim()) {
    throw new Error('JWT Generator option "secret" is required and must not be empty.')
  }
  if (secret.length > MAX_SECRET_LENGTH) throw new RangeError('JWT secret exceeds the 16 KiB processing limit.')
  assertWellFormedUnicode(secret, 'JWT secret')

  let header: JsonObject = Object.assign(Object.create(null) as JsonObject, { alg: 'HS256', typ: 'JWT' })
  if (options.header !== undefined) {
    if (!options.header) throw new Error('JWT Generator option "header" must be a JSON object containing alg="HS256".')
    if (options.header.length > MAX_HEADER_LENGTH) throw new RangeError('JWT header exceeds the 16 KiB processing limit.')
    header = parseJsonObject(options.header, 'JWT header')
  }
  if (header.alg !== 'HS256') throw new Error('JWT header "alg" must be exactly "HS256"; other algorithms and alg=none are not supported.')
  for (const key of Object.keys(header)) {
    if (key !== 'alg' && key !== 'typ') throw new Error(`JWT header field "${key}" is not supported; only alg and typ are allowed.`)
  }
  if (header.typ !== undefined && (typeof header.typ !== 'string' || header.typ.length === 0 || header.typ.length > 128)) {
    throw new Error('JWT header "typ", when provided, must be a non-empty string of at most 128 characters.')
  }

  let expiresIn: number | undefined
  if (options.expiresIn !== undefined) {
    if (!/^[1-9]\d*$/.test(options.expiresIn)) {
      throw new Error('JWT Generator option "expiresIn" must be a positive whole number of seconds.')
    }
    expiresIn = Number(options.expiresIn)
    if (!Number.isSafeInteger(expiresIn) || expiresIn > MAX_EXPIRATION_SECONDS) {
      throw new RangeError('JWT "expiresIn" must not exceed 10 years (315,360,000 seconds).')
    }
  }
  return { secret, header, expiresIn }
}

/** Generate a compact HS256 JWT locally. This does not contact a service or expose the signing secret. */
export async function generateJwt(input: string, options: Record<string, string>): Promise<string> {
  if (typeof input !== 'string') throw new Error('JWT payload input must be text containing a JSON object.')
  if (!input.trim()) throw new Error('Paste a JSON object to use as the JWT payload.')
  if (input.length > MAX_PAYLOAD_LENGTH) throw new RangeError('JWT payload exceeds the 128 KiB processing limit.')
  const { secret, header, expiresIn } = parseOptions(options)
  const payload = parseJsonObject(input, 'JWT payload')
  if (expiresIn !== undefined) {
    if (Object.prototype.hasOwnProperty.call(payload, 'exp')) {
      throw new Error('JWT payload already contains "exp"; remove it or omit the "expiresIn" option.')
    }
    payload.exp = Math.floor(Date.now() / 1000) + expiresIn
  }

  const encodedHeader = encodeBase64Url(textEncoder.encode(JSON.stringify(header)))
  const encodedPayload = encodeBase64Url(textEncoder.encode(JSON.stringify(payload)))
  const signingInput = `${encodedHeader}.${encodedPayload}`
  if (signingInput.length > MAX_TOKEN_LENGTH) throw new RangeError('JWT encoded content exceeds the 256 KiB processing limit.')

  const cryptoProvider = globalThis.crypto
  if (!cryptoProvider?.subtle) throw new Error('Web Crypto is unavailable; JWT signing cannot be performed in this environment.')
  try {
    const key = await cryptoProvider.subtle.importKey(
      'raw',
      textEncoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )
    const signature = await cryptoProvider.subtle.sign('HMAC', key, textEncoder.encode(signingInput))
    const token = `${signingInput}.${encodeBase64Url(new Uint8Array(signature))}`
    if (token.length > MAX_TOKEN_LENGTH) throw new RangeError('Generated JWT exceeds the 256 KiB output limit.')
    return token
  } catch (error) {
    if (error instanceof RangeError) throw error
    throw new Error('JWT signing failed; verify that Web Crypto is available and try again.')
  }
}

export async function run(input: string, options: Record<string, string> = {}): Promise<string> {
  return generateJwt(input, options)
}
