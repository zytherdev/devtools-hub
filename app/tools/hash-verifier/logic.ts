import type { ToolOptions } from '@/app/tools/types'

export const HASH_ALGORITHMS = ['SHA-256', 'SHA-384', 'SHA-512'] as const
export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number]

export const MAX_INPUT_BYTES = 1024 * 1024
const DIGEST_LENGTHS: Record<HashAlgorithm, number> = {
  'SHA-256': 64,
  'SHA-384': 96,
  'SHA-512': 128,
}

type VerificationResult = {
  algorithm: HashAlgorithm
  expectedDigest: string
  computedDigest: string
  matches: boolean
}

function validateAlgorithm(value: unknown): HashAlgorithm {
  if (typeof value !== 'string' || !(HASH_ALGORITHMS as readonly string[]).includes(value)) {
    throw new Error(`Algorithm must be one of: ${HASH_ALGORITHMS.join(', ')}.`)
  }
  return value as HashAlgorithm
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

function validateExpectedDigest(value: unknown, algorithm: HashAlgorithm): string {
  if (typeof value !== 'string') throw new TypeError('Expected digest must be hexadecimal text.')
  const length = DIGEST_LENGTHS[algorithm]
  if (value.length !== length || !/^[0-9a-fA-F]+$/.test(value)) {
    throw new Error(`Expected ${algorithm} digest must contain exactly ${length} hexadecimal characters.`)
  }
  return value.toLowerCase()
}

function equalDigestHex(left: string, right: string): boolean {
  if (left.length !== right.length) return false
  let difference = 0
  for (let index = 0; index < left.length; index++) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }
  return difference === 0
}

/** Verify UTF-8 text against an expected Web Crypto digest without network access. */
export async function verifyHash(
  input: string,
  expectedDigest: string,
  algorithm: HashAlgorithm = 'SHA-256',
): Promise<VerificationResult> {
  const checkedAlgorithm = validateAlgorithm(algorithm)
  const normalizedExpected = validateExpectedDigest(expectedDigest, checkedAlgorithm)
  const bytes = encodeInput(input)
  const subtle = globalThis.crypto?.subtle
  if (!subtle || typeof subtle.digest !== 'function') {
    throw new Error('Browser Web Crypto is unavailable. Use a secure browser context to verify hashes.')
  }

  let digest: ArrayBuffer
  try {
    const digestInput = new ArrayBuffer(bytes.byteLength)
    new Uint8Array(digestInput).set(bytes)
    digest = await subtle.digest(checkedAlgorithm, digestInput)
  } catch {
    throw new Error(`The ${checkedAlgorithm} hash algorithm is unavailable in this browser.`)
  }

  const computedDigest = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('')
  return {
    algorithm: checkedAlgorithm,
    expectedDigest: normalizedExpected,
    computedDigest,
    matches: equalDigestHex(computedDigest, normalizedExpected),
  }
}

/** Run through the shared tool contract using the expected digest in options. */
export async function run(input: string, options: ToolOptions = {}): Promise<string> {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Hash options must be an object.')
  }
  for (const key of Object.keys(options)) {
    if (key !== 'algorithm' && key !== 'expectedDigest') {
      throw new Error(`Unknown hash option: "${key}".`)
    }
  }

  const algorithm = Object.hasOwn(options, 'algorithm') ? validateAlgorithm(options.algorithm) : 'SHA-256'
  if (!Object.hasOwn(options, 'expectedDigest')) {
    throw new Error('Expected digest is required.')
  }
  const result = await verifyHash(input, options.expectedDigest, algorithm)
  return [
    result.matches ? 'MATCH' : 'NO MATCH',
    `Algorithm: ${result.algorithm}`,
    `Computed digest: ${result.computedDigest}`,
  ].join('\n')
}
