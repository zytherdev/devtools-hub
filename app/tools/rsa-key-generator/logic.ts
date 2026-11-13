import type { ToolOptions } from '@/app/tools/types'

export const SUPPORTED_RSA_KEY_SIZES = [2048, 3072, 4096] as const
export const SUPPORTED_RSA_ALGORITHMS = ['RSA-OAEP', 'RSA-PSS'] as const
export const SUPPORTED_OUTPUT_FORMATS = ['pem', 'jwk'] as const

export type RsaAlgorithm = typeof SUPPORTED_RSA_ALGORITHMS[number]
export type RsaOutputFormat = typeof SUPPORTED_OUTPUT_FORMATS[number]

export interface RsaKeyPairOutput {
  algorithm: RsaAlgorithm
  modulusLength: number
  format: RsaOutputFormat
  publicKey: string
  privateKey: string
}

const ALLOWED_OPTIONS = new Set(['modulusLength', 'algorithm', 'format'])

function parseOptions(options: ToolOptions = {}): {
  modulusLength: number
  algorithm: RsaAlgorithm
  format: RsaOutputFormat
} {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('RSA options must be an object containing string values.')
  }

  for (const [key, value] of Object.entries(options)) {
    if (!ALLOWED_OPTIONS.has(key)) throw new Error(`Unknown RSA Key Generator option: "${key}".`)
    if (typeof value !== 'string') throw new Error(`RSA option "${key}" must be a string.`)
  }

  const sizeValue = options.modulusLength ?? '2048'
  const modulusLength = SUPPORTED_RSA_KEY_SIZES.find(size => String(size) === sizeValue)
  if (!modulusLength) {
    throw new RangeError('RSA modulus length must be one of 2048, 3072, or 4096 bits.')
  }

  const algorithmValue = options.algorithm ?? 'RSA-OAEP'
  if (!SUPPORTED_RSA_ALGORITHMS.includes(algorithmValue as RsaAlgorithm)) {
    throw new Error('RSA algorithm must be "RSA-OAEP" or "RSA-PSS".')
  }

  const formatValue = options.format ?? 'pem'
  if (!SUPPORTED_OUTPUT_FORMATS.includes(formatValue as RsaOutputFormat)) {
    throw new Error('RSA output format must be "pem" or "jwk".')
  }

  return {
    modulusLength,
    algorithm: algorithmValue as RsaAlgorithm,
    format: formatValue as RsaOutputFormat,
  }
}

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunkSize = 0x8000
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, Math.min(offset + chunkSize, bytes.length))
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

function encodePem(label: 'PUBLIC KEY' | 'PRIVATE KEY', der: ArrayBuffer): string {
  const base64 = toBase64(new Uint8Array(der))
  const lines = base64.match(/.{1,64}/g)?.join('\n') ?? ''
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`
}

async function exportKey(key: CryptoKey, format: RsaOutputFormat, label: 'public' | 'private'): Promise<string> {
  if (format === 'jwk') {
    const jwk = await crypto.subtle.exportKey('jwk', key)
    return JSON.stringify(jwk, null, 2)
  }

  const exportFormat = label === 'public' ? 'spki' : 'pkcs8'
  const der = await crypto.subtle.exportKey(exportFormat, key)
  return encodePem(label === 'public' ? 'PUBLIC KEY' : 'PRIVATE KEY', der)
}

/** Generate exportable RSA keys in this runtime; callers must explicitly choose when to reveal privateKey. */
export async function generateRsaKeyPair(options: ToolOptions = {}): Promise<RsaKeyPairOutput> {
  const { modulusLength, algorithm, format } = parseOptions(options)
  const webCrypto = globalThis.crypto
  if (!webCrypto?.subtle || typeof btoa !== 'function') {
    throw new Error('Web Crypto is unavailable. Open this page in a modern browser over HTTPS or localhost.')
  }

  try {
    const pair = await webCrypto.subtle.generateKey(
      {
        name: algorithm,
        modulusLength,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: 'SHA-256',
      },
      true,
      algorithm === 'RSA-OAEP' ? ['encrypt', 'decrypt'] : ['sign', 'verify'],
    )

    const [publicKey, privateKey] = await Promise.all([
      exportKey(pair.publicKey, format, 'public'),
      exportKey(pair.privateKey, format, 'private'),
    ])

    return { algorithm, modulusLength, format, publicKey, privateKey }
  } catch (cause) {
    if (cause instanceof Error && /Web Crypto is unavailable/.test(cause.message)) throw cause
    throw new Error('RSA key generation or export failed in this browser. No key material was sent to a server.')
  }
}

/** Compatibility entry point for the tool runner; RSA generation does not take input text. */
export async function run(input: string, options: ToolOptions = {}): Promise<string> {
  if (typeof input !== 'string') throw new Error('RSA input must be text.')
  if (input.length > 0) throw new Error('RSA Key Generator does not accept input text.')
  return JSON.stringify(await generateRsaKeyPair(options), null, 2)
}
