import bcrypt from './vendor/bcryptjs/bcryptjs.cjs'
import type { ToolOptions } from '@/app/tools/types'

export const MIN_COST = 4
export const MAX_COST = 14
export const DEFAULT_COST = 10
export const MAX_PASSWORD_BYTES = 72

export type BcryptAction = 'hash' | 'verify'

const HASH_PATTERN = /^\$2[ab]\$(\d{2})\$[./A-Za-z0-9]{53}$/
const OPTION_KEYS = new Set(['action', 'cost', 'hash'])

function validatePassword(password: string): void {
  if (typeof password !== 'string') throw new TypeError('Password must be text.')
  if (password.length === 0) throw new Error('Password cannot be empty.')
  // Every UTF-16 code unit contributes at least one UTF-8 byte, so this also
  // bounds the allocation made by TextEncoder for unusually large inputs.
  if (password.length > MAX_PASSWORD_BYTES) {
    throw new RangeError(`Password exceeds bcrypt's ${MAX_PASSWORD_BYTES}-byte input limit.`)
  }
  const byteLength = new TextEncoder().encode(password).byteLength
  if (byteLength > MAX_PASSWORD_BYTES) {
    throw new RangeError(`Password exceeds bcrypt's ${MAX_PASSWORD_BYTES}-byte input limit when encoded as UTF-8.`)
  }
}

function validateCost(cost: number): number {
  if (!Number.isInteger(cost) || cost < MIN_COST || cost > MAX_COST) {
    throw new RangeError(`Bcrypt cost must be an integer from ${MIN_COST} to ${MAX_COST}.`)
  }
  return cost
}

function validateHash(encodedHash: string): void {
  if (typeof encodedHash !== 'string') throw new TypeError('Bcrypt hash must be text.')
  const match = HASH_PATTERN.exec(encodedHash)
  if (!match) throw new Error('Enter a valid bcrypt hash using the $2a$ or $2b$ format.')
  const cost = Number(match[1])
  if (cost < MIN_COST || cost > MAX_COST) {
    throw new RangeError(`Hash cost must be from ${MIN_COST} to ${MAX_COST} to keep browser work bounded.`)
  }
}

function parseOptions(options: ToolOptions = {}): { action: BcryptAction; cost: number; hash?: string } {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Bcrypt options must be an object.')
  }
  for (const key of Object.keys(options)) {
    if (!OPTION_KEYS.has(key)) throw new Error(`Unknown bcrypt option: "${key}".`)
  }

  const rawAction = Object.hasOwn(options, 'action') ? options.action : 'hash'
  if (rawAction !== 'hash' && rawAction !== 'verify') {
    throw new Error('Action must be either "hash" or "verify".')
  }

  if (rawAction === 'hash') {
    if (Object.hasOwn(options, 'hash')) throw new Error('The hash option is only used with the verify action.')
    const rawCost = Object.hasOwn(options, 'cost') ? options.cost : String(DEFAULT_COST)
    if (typeof rawCost !== 'string' || !/^\d+$/.test(rawCost)) {
      throw new Error('Cost must be an integer from 4 to 14.')
    }
    return { action: 'hash', cost: validateCost(Number(rawCost)) }
  }

  if (Object.hasOwn(options, 'cost')) throw new Error('The cost option is only used with the hash action.')
  const hash = options.hash
  if (typeof hash !== 'string') throw new Error('A bcrypt hash is required for verification.')
  return { action: 'verify', cost: DEFAULT_COST, hash }
}

/** Hash a password locally with a fresh random bcrypt salt. */
export async function hashPassword(password: string, cost = DEFAULT_COST): Promise<string> {
  validatePassword(password)
  validateCost(cost)
  try {
    return await bcrypt.hash(password, cost)
  } catch {
    throw new Error('Could not generate a bcrypt hash in this browser. Check that secure browser randomness is available.')
  }
}

/** Verify a password against a bounded, well-formed bcrypt hash locally. */
export async function verifyPassword(password: string, encodedHash: string): Promise<boolean> {
  validatePassword(password)
  validateHash(encodedHash)
  try {
    return await bcrypt.compare(password, encodedHash)
  } catch {
    throw new Error('Could not verify this bcrypt hash in the current browser.')
  }
}

/** Text-tool adapter: hash input by default, or verify with action/hash options. */
export async function run(input: string, options: ToolOptions = {}): Promise<string> {
  const parsed = parseOptions(options)
  if (parsed.action === 'hash') return hashPassword(input, parsed.cost)
  return (await verifyPassword(input, parsed.hash!)) ? 'Match' : 'No match'
}
