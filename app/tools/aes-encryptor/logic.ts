import type { ToolOptions } from '@/app/tools/types'

export const AES_MODES = ['encrypt', 'decrypt'] as const
export type AesMode = (typeof AES_MODES)[number]

export const AES_ALGORITHM = 'AES-256-GCM'
export const PBKDF2_ITERATIONS = 310_000
export const MAX_PLAINTEXT_BYTES = 1024 * 1024
export const MAX_PASSWORD_BYTES = 4096
export const MAX_PAYLOAD_CHARACTERS = 2 * 1024 * 1024
export const MAX_ENCRYPTIONS_PER_PAGE = 10_000

const SALT_BYTES = 16
const IV_BYTES = 12
const GCM_TAG_BYTES = 16
const MIN_PASSWORD_CHARACTERS = 12
const OPTION_NAMES = new Set(['mode', 'password'])
const ENVELOPE_KEYS = ['algorithm', 'ciphertext', 'encoding', 'iterations', 'iv', 'kdf', 'kdfHash', 'salt', 'version']
const generatedIvs = new Set<string>()

interface AesOptions {
  mode: AesMode
  password: string
}

interface EncryptedPayload {
  version: 1
  algorithm: typeof AES_ALGORITHM
  kdf: 'PBKDF2'
  kdfHash: 'SHA-256'
  iterations: typeof PBKDF2_ITERATIONS
  encoding: 'base64url'
  salt: string
  iv: string
  ciphertext: string
}

function validateOptions(options: unknown): AesOptions {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('AES options must be an object.')
  }
  const prototype = Object.getPrototypeOf(options)
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError('AES options must be a plain object.')
  }

  const record = options as Record<string, unknown>
  for (const key of Object.keys(record)) {
    if (!OPTION_NAMES.has(key)) throw new Error(`Unknown AES option: "${key}".`)
  }

  const mode = Object.hasOwn(record, 'mode') ? record.mode : 'encrypt'
  if (typeof mode !== 'string' || !(AES_MODES as readonly string[]).includes(mode)) {
    throw new Error(`Mode must be one of: ${AES_MODES.join(', ')}.`)
  }

  const password = Object.hasOwn(record, 'password') ? record.password : ''
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('A non-empty password is required.')
  }
  if (password.length > MAX_PASSWORD_BYTES) {
    throw new RangeError('Password exceeds the 4 KiB UTF-8 limit.')
  }
  const passwordBytes = new TextEncoder().encode(password)
  if (passwordBytes.byteLength > MAX_PASSWORD_BYTES) {
    throw new RangeError('Password exceeds the 4 KiB UTF-8 limit.')
  }
  if (mode === 'encrypt' && Array.from(password).length < MIN_PASSWORD_CHARACTERS) {
    throw new Error(`Use a passphrase of at least ${MIN_PASSWORD_CHARACTERS} characters for encryption.`)
  }
  return { mode: mode as AesMode, password }
}

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function decodeBase64Url(value: unknown, field: string): Uint8Array {
  if (typeof value !== 'string' || value.length === 0 || !/^[A-Za-z0-9_-]+$/.test(value) || value.length % 4 === 1) {
    throw new Error(`Encrypted payload has an invalid ${field} encoding.`)
  }
  try {
    const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4)
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, character => character.charCodeAt(0))
    if (encodeBase64Url(bytes) !== value) throw new Error('Non-canonical encoding.')
    return bytes
  } catch {
    throw new Error(`Encrypted payload has an invalid ${field} encoding.`)
  }
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new ArrayBuffer(bytes.byteLength)
  new Uint8Array(copy).set(bytes)
  return copy
}

function getCrypto(): Crypto {
  const cryptoApi = globalThis.crypto
  if (!cryptoApi?.subtle || typeof cryptoApi.getRandomValues !== 'function') {
    throw new Error('Browser Web Crypto is unavailable. Use a secure browser context to encrypt or decrypt.')
  }
  return cryptoApi
}

function createUniqueIv(cryptoApi: Crypto): Uint8Array {
  if (generatedIvs.size >= MAX_ENCRYPTIONS_PER_PAGE) {
    throw new RangeError('This page reached its safe encryption limit. Reload before encrypting more data.')
  }
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const iv = cryptoApi.getRandomValues(new Uint8Array(IV_BYTES))
    const fingerprint = encodeBase64Url(iv)
    if (!generatedIvs.has(fingerprint)) {
      generatedIvs.add(fingerprint)
      return iv
    }
  }
  throw new Error('Could not create a fresh encryption nonce. Please try again.')
}

async function deriveAesKey(password: string, salt: Uint8Array, usages: KeyUsage[], cryptoApi: Crypto): Promise<CryptoKey> {
  const passwordMaterial = await cryptoApi.subtle.importKey(
    'raw',
    toArrayBuffer(new TextEncoder().encode(password)),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return cryptoApi.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: toArrayBuffer(salt), iterations: PBKDF2_ITERATIONS },
    passwordMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    usages,
  )
}

function validatePayload(input: string): { payload: EncryptedPayload; salt: Uint8Array; iv: Uint8Array; ciphertext: Uint8Array } {
  if (input.length > MAX_PAYLOAD_CHARACTERS) {
    throw new RangeError('Encrypted payload exceeds the 2 MiB character limit.')
  }

  let value: unknown
  try {
    value = JSON.parse(input)
  } catch {
    throw new Error('Input must be a valid AES encrypted JSON payload.')
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Encrypted payload must be a JSON object.')
  }
  const record = value as Record<string, unknown>
  const keys = Object.keys(record).sort()
  if (keys.length !== ENVELOPE_KEYS.length || keys.some((key, index) => key !== [...ENVELOPE_KEYS].sort()[index])) {
    throw new Error('Encrypted payload has an unsupported or unexpected structure.')
  }
  if (record.version !== 1 || record.algorithm !== AES_ALGORITHM || record.kdf !== 'PBKDF2' || record.kdfHash !== 'SHA-256' || record.iterations !== PBKDF2_ITERATIONS || record.encoding !== 'base64url') {
    throw new Error('Encrypted payload uses unsupported encryption parameters.')
  }

  const salt = decodeBase64Url(record.salt, 'salt')
  const iv = decodeBase64Url(record.iv, 'nonce')
  const ciphertext = decodeBase64Url(record.ciphertext, 'ciphertext')
  if (salt.byteLength !== SALT_BYTES) throw new Error('Encrypted payload has an invalid salt length.')
  if (iv.byteLength !== IV_BYTES) throw new Error('Encrypted payload has an invalid nonce length.')
  if (ciphertext.byteLength < GCM_TAG_BYTES || ciphertext.byteLength > MAX_PLAINTEXT_BYTES + GCM_TAG_BYTES) {
    throw new Error('Encrypted payload has an invalid ciphertext length.')
  }
  return { payload: record as unknown as EncryptedPayload, salt, iv, ciphertext }
}

/** Encrypt or decrypt locally using AES-256-GCM and a PBKDF2-derived password key. */
export async function run(input: string, options: ToolOptions = {}): Promise<string> {
  const { mode, password } = validateOptions(options)
  if (typeof input !== 'string') throw new TypeError('AES input must be text.')
  const cryptoApi = getCrypto()

  if (mode === 'encrypt') {
    const plaintext = new TextEncoder().encode(input)
    if (input.length > MAX_PLAINTEXT_BYTES || plaintext.byteLength > MAX_PLAINTEXT_BYTES) {
      throw new RangeError('Plaintext exceeds the 1 MiB UTF-8 limit.')
    }
    const salt = cryptoApi.getRandomValues(new Uint8Array(SALT_BYTES))
    const iv = createUniqueIv(cryptoApi)
    try {
      const key = await deriveAesKey(password, salt, ['encrypt'], cryptoApi)
      const ciphertext = await cryptoApi.subtle.encrypt({ name: 'AES-GCM', iv: toArrayBuffer(iv), tagLength: 128 }, key, toArrayBuffer(plaintext))
      const payload: EncryptedPayload = {
        version: 1,
        algorithm: AES_ALGORITHM,
        kdf: 'PBKDF2',
        kdfHash: 'SHA-256',
        iterations: PBKDF2_ITERATIONS,
        encoding: 'base64url',
        salt: encodeBase64Url(salt),
        iv: encodeBase64Url(iv),
        ciphertext: encodeBase64Url(new Uint8Array(ciphertext)),
      }
      return JSON.stringify(payload, null, 2)
    } catch {
      throw new Error('Encryption failed in this browser. No output was produced.')
    }
  }

  const { salt, iv, ciphertext } = validatePayload(input)
  try {
    const key = await deriveAesKey(password, salt, ['decrypt'], cryptoApi)
    const plaintext = await cryptoApi.subtle.decrypt({ name: 'AES-GCM', iv: toArrayBuffer(iv), tagLength: 128 }, key, toArrayBuffer(ciphertext))
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(plaintext)
    if (new TextEncoder().encode(decoded).byteLength > MAX_PLAINTEXT_BYTES) {
      throw new Error('Plaintext exceeds the supported limit.')
    }
    return decoded
  } catch {
    throw new Error('Unable to decrypt: the password may be incorrect or the payload may be modified or corrupted.')
  }
}
