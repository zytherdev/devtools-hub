import { decodeBase64 } from '@/app/lib/tools/base64'

const MAX_TOKEN_LENGTH = 128 * 1024
const MAX_SEGMENT_LENGTH = 64 * 1024
const MAX_JSON_DEPTH = 64
const MAX_JSON_NODES = 20_000
const ALLOWED_OPTIONS = new Set(['format'])
const SENSITIVE_CLAIM_NAME = /(?:pass(?:word)?|secret|token|jwk|api[_-]?key|private[_-]?key|credential|authorization|cookie|session|refresh)/i

function parseOptions(options: Record<string, string>): 'pretty' | 'compact' {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('JWT options must be an object containing string values.')
  }

  for (const key of Object.keys(options)) {
    if (!ALLOWED_OPTIONS.has(key)) throw new Error(`Unknown JWT Decoder option: "${key}".`)
    if (typeof options[key] !== 'string') throw new Error(`JWT Decoder option "${key}" must be a string.`)
  }

  const format = options.format ?? 'pretty'
  if (format !== 'pretty' && format !== 'compact') {
    throw new Error('JWT Decoder option "format" must be "pretty" or "compact".')
  }
  return format
}

function decodeBase64UrlSegment(segment: string, label: string, allowEmpty = false): Uint8Array {
  if (!segment && allowEmpty) return new Uint8Array(0)
  if (!segment) throw new Error(`JWT ${label} segment must not be empty.`)
  if (segment.length > MAX_SEGMENT_LENGTH) {
    throw new RangeError(`JWT ${label} segment exceeds the 64 KiB processing limit.`)
  }
  if (!/^[A-Za-z0-9_-]+$/.test(segment)) {
    throw new Error(`JWT ${label} segment contains invalid Base64URL characters or padding.`)
  }

  try {
    return decodeBase64(segment, { urlSafe: true, allowUnpadded: true })
  } catch {
    throw new Error(`JWT ${label} segment is malformed Base64URL.`)
  }
}

function assertJsonDepth(text: string, label: string): void {
  let depth = 0
  let inString = false
  let escaped = false

  for (let index = 0; index < text.length; index++) {
    const character = text[index]
    if (inString) {
      if (escaped) escaped = false
      else if (character === '\\') escaped = true
      else if (character === '"') inString = false
      continue
    }
    if (character === '"') inString = true
    else if (character === '{' || character === '[') {
      depth++
      if (depth > MAX_JSON_DEPTH) {
        throw new RangeError(`JWT ${label} JSON exceeds the ${MAX_JSON_DEPTH}-level nesting limit.`)
      }
    } else if (character === '}' || character === ']') depth--
  }
}

function decodeJsonObject(bytes: Uint8Array, label: string): Record<string, unknown> {
  let text: string
  try {
    // Fatal decoding rejects invalid UTF-8 rather than replacing malformed bytes.
    text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes)
  } catch {
    throw new Error(`JWT ${label} segment is not valid UTF-8.`)
  }

  assertJsonDepth(text, label)
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new Error(`JWT ${label} segment does not contain valid JSON.`)
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`JWT ${label} JSON must be an object.`)
  }
  return value as Record<string, unknown>
}

function redactSensitiveClaims(value: unknown): unknown {
  let visited = 0
  const visit = (current: unknown): unknown => {
    visited++
    if (visited > MAX_JSON_NODES) throw new RangeError('JWT JSON exceeds the 20,000-value inspection limit.')
    if (Array.isArray(current)) return current.map(visit)
    if (current && typeof current === 'object') {
      const safe: Record<string, unknown> = Object.create(null) as Record<string, unknown>
      for (const [key, item] of Object.entries(current)) {
        safe[key] = SENSITIVE_CLAIM_NAME.test(key) ? '[REDACTED]' : visit(item)
      }
      return safe
    }
    return current
  }
  return visit(value)
}

/** Decode a compact JWT locally for inspection; this does not verify its signature or trustworthiness. */
export function decodeJwt(input: string, options: Record<string, string>): string {
  if (typeof input !== 'string') throw new Error('JWT input must be text.')
  const format = parseOptions(options)
  if (!input) throw new Error('Paste a compact JWT to decode.')
  if (input.length > MAX_TOKEN_LENGTH) {
    throw new RangeError('JWT input exceeds the 128 KiB processing limit.')
  }
  if (input !== input.trim()) throw new Error('JWT must not contain surrounding whitespace.')

  const parts = input.split('.')
  if (parts.length !== 3) {
    throw new Error('Malformed JWT: expected exactly three dot-separated Base64URL segments (header.payload.signature).')
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts
  const header = decodeJsonObject(decodeBase64UrlSegment(encodedHeader, 'header'), 'header')
  const payload = decodeJsonObject(decodeBase64UrlSegment(encodedPayload, 'payload'), 'payload')
  const signatureBytes = decodeBase64UrlSegment(encodedSignature, 'signature', true)

  if (typeof header.alg !== 'string' || !header.alg.trim()) {
    throw new Error('JWT header must contain a non-empty string "alg" field.')
  }

  const result = {
    header: redactSensitiveClaims(header),
    payload: redactSensitiveClaims(payload),
    signature: {
      present: encodedSignature.length > 0,
      encodedLength: encodedSignature.length,
      decodedBytes: signatureBytes.length,
      value: '[NOT SHOWN]',
    },
    security: {
      signatureVerified: false,
      trusted: false,
      warning: 'This tool only decodes JWT structure and payload. It does not verify the signature, issuer, audience, expiration, or trustworthiness. Treat all decoded values as untrusted. Claims whose names indicate credentials or tokens are redacted; do not use this output to disclose or trust secrets.',
    },
  }

  return JSON.stringify(result, null, format === 'pretty' ? 2 : 0)
}

export function run(input: string, options: Record<string, string> = {}): string {
  return decodeJwt(input, options)
}
