import type { ToolOptions } from '@/app/tools/types'

export const HMAC_ALGORITHMS = ['SHA-256', 'SHA-384', 'SHA-512'] as const
export type HmacAlgorithm = (typeof HMAC_ALGORITHMS)[number]

export const HMAC_ENCODINGS = ['hex', 'base64', 'base64url'] as const
export type HmacEncoding = (typeof HMAC_ENCODINGS)[number]

const DEFAULT_ALGORITHM: HmacAlgorithm = 'SHA-256'
const DEFAULT_ENCODING: HmacEncoding = 'hex'
const MAX_INPUT_BYTES = 1024 * 1024
const MAX_SECRET_KEY_BYTES = 64 * 1024
const ALLOWED_OPTIONS = new Set(['secretKey', 'algorithm', 'encoding'])

interface HmacOptions {
  secretKey: string
  algorithm: HmacAlgorithm
  encoding: HmacEncoding
}

function validateOptions(options: unknown): HmacOptions {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('HMAC options must be an object.')
  }
  const prototype = Object.getPrototypeOf(options)
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError('HMAC options must be a plain object.')
  }

  for (const key of Object.keys(options)) {
    if (!ALLOWED_OPTIONS.has(key)) throw new Error(`Unknown HMAC option: "${key}".`)
  }

  const record = options as Record<string, unknown>
  const secretKey = Object.hasOwn(record, 'secretKey') ? record.secretKey : ''
  if (typeof secretKey !== 'string' || secretKey.length === 0) {
    throw new Error('A non-empty secretKey string is required.')
  }
  if (secretKey.length > MAX_SECRET_KEY_BYTES) {
    throw new RangeError('Secret key exceeds the 64 KiB HMAC key limit.')
  }

  const algorithm = Object.hasOwn(record, 'algorithm') ? record.algorithm : DEFAULT_ALGORITHM
  if (typeof algorithm !== 'string' || !(HMAC_ALGORITHMS as readonly string[]).includes(algorithm)) {
    throw new Error(`Algorithm must be one of: ${HMAC_ALGORITHMS.join(', ')}.`)
  }

  const encoding = Object.hasOwn(record, 'encoding') ? record.encoding : DEFAULT_ENCODING
  if (typeof encoding !== 'string' || !(HMAC_ENCODINGS as readonly string[]).includes(encoding)) {
    throw new Error(`Encoding must be one of: ${HMAC_ENCODINGS.join(', ')}.`)
  }

  return { secretKey, algorithm: algorithm as HmacAlgorithm, encoding: encoding as HmacEncoding }
}

function encodeUtf8(value: string, label: 'HMAC input' | 'Secret key', maxBytes: number): Uint8Array {
  const limitName = label === 'HMAC input' ? '1 MiB input' : '64 KiB key'
  if (value.length > maxBytes) throw new RangeError(`${label} exceeds the ${limitName} limit.`)
  const bytes = new TextEncoder().encode(value)
  if (bytes.byteLength > maxBytes) {
    throw new RangeError(`${label} exceeds the ${limitName} limit when encoded as UTF-8.`)
  }
  return bytes
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(copy).set(bytes)
  return copy
}

function encodeDigest(digest: ArrayBuffer, encoding: HmacEncoding): string {
  const bytes = new Uint8Array(digest)
  if (encoding === 'hex') {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  const base64 = btoa(binary)
  return encoding === 'base64url'
    ? base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
    : base64
}

/** Generate an HMAC locally with browser Web Crypto; neither the input nor key is sent elsewhere. */
export async function run(input: string, options: ToolOptions = {}): Promise<string> {
  const { secretKey, algorithm, encoding } = validateOptions(options)
  if (typeof input !== 'string') throw new TypeError('HMAC input must be text.')
  const inputBytes = encodeUtf8(input, 'HMAC input', MAX_INPUT_BYTES)
  const keyBytes = encodeUtf8(secretKey, 'Secret key', MAX_SECRET_KEY_BYTES)
  const subtle = globalThis.crypto?.subtle
  if (!subtle || typeof subtle.importKey !== 'function' || typeof subtle.sign !== 'function') {
    throw new Error('Browser Web Crypto is unavailable. Use a secure browser context to generate HMACs.')
  }

  try {
    const key = await subtle.importKey(
      'raw',
      toArrayBuffer(keyBytes),
      { name: 'HMAC', hash: { name: algorithm } },
      false,
      ['sign'],
    )
    const signature = await subtle.sign('HMAC', key, toArrayBuffer(inputBytes))
    return encodeDigest(signature, encoding)
  } catch {
    throw new Error(`The ${algorithm} HMAC algorithm is unavailable in this browser.`)
  }
}
