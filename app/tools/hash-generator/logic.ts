import type { ToolOptions } from '@/app/tools/types'

export const HASH_ALGORITHMS = ['SHA-256', 'SHA-384', 'SHA-512'] as const
export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number]

const DEFAULT_ALGORITHM: HashAlgorithm = 'SHA-256'
const MAX_INPUT_BYTES = 1024 * 1024

function validateOptions(options: ToolOptions): HashAlgorithm {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Hash options must be an object.')
  }

  for (const key of Object.keys(options)) {
    if (key !== 'algorithm') throw new Error(`Unknown hash option: "${key}".`)
  }

  const algorithm = Object.hasOwn(options, 'algorithm') ? options.algorithm : DEFAULT_ALGORITHM
  if (typeof algorithm !== 'string' || !(HASH_ALGORITHMS as readonly string[]).includes(algorithm)) {
    throw new Error(`Algorithm must be one of: ${HASH_ALGORITHMS.join(', ')}.`)
  }
  return algorithm as HashAlgorithm
}

function encodeInput(input: string): Uint8Array {
  if (typeof input !== 'string') throw new TypeError('Hash input must be text.')
  if (input.length > MAX_INPUT_BYTES) {
    throw new RangeError('Text exceeds the 1 MiB hash input limit.')
  }

  const bytes = new TextEncoder().encode(input)
  if (bytes.byteLength > MAX_INPUT_BYTES) {
    throw new RangeError('Text exceeds the 1 MiB hash input limit when encoded as UTF-8.')
  }
  return bytes
}

/** Hash text locally as UTF-8 and return its lowercase hexadecimal digest. */
export async function run(input: string, options: ToolOptions = {}): Promise<string> {
  const algorithm = validateOptions(options)
  const bytes = encodeInput(input)
  const subtle = globalThis.crypto?.subtle
  if (!subtle || typeof subtle.digest !== 'function') {
    throw new Error('Browser Web Crypto is unavailable. Use a secure browser context to generate hashes.')
  }

  let digest: ArrayBuffer
  try {
    const digestInput = new ArrayBuffer(bytes.byteLength)
    new Uint8Array(digestInput).set(bytes)
    digest = await subtle.digest(algorithm, digestInput)
  } catch {
    throw new Error(`The ${algorithm} hash algorithm is unavailable in this browser.`)
  }

  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
}
