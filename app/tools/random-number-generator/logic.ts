import type { ToolOptions } from '@/app/tools/types'

const MAX_COUNT = 1_000
const MAX_SAFE = Number.MAX_SAFE_INTEGER

function parseInteger(value: string | undefined, name: string, fallback: number): number {
  const candidate = value ?? String(fallback)
  if (typeof candidate !== 'string' || !/^-?(?:0|[1-9]\d*)$/.test(candidate)) throw new Error(`${name} must be a safe whole number.`)
  const parsed = Number(candidate)
  if (!Number.isSafeInteger(parsed)) throw new Error(`${name} must be a safe whole number.`)
  return parsed
}

function randomBelow(limit: bigint): bigint {
  if (limit === BigInt(1)) return BigInt(0)
  const bitCount = limit.toString(2).length
  const byteCount = Math.ceil(bitCount / 8)
  const excessBits = byteCount * 8 - bitCount
  const bytes = new Uint8Array(byteCount)
  const cryptoProvider = globalThis.crypto
  if (!cryptoProvider || typeof cryptoProvider.getRandomValues !== 'function') throw new Error('Web Crypto is not supported; secure random generation is unavailable.')

  for (let attempt = 0; attempt < 128; attempt += 1) {
    try { cryptoProvider.getRandomValues(bytes) } catch { throw new Error('Web Crypto could not provide random bytes.') }
    let candidate = BigInt(0)
    for (const byte of bytes) candidate = (candidate << BigInt(8)) | BigInt(byte)
    candidate >>= BigInt(excessBits)
    if (candidate < limit) return candidate
  }
  throw new Error('Secure random sampling did not converge; try again.')
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string' || input.length !== 0) throw new Error('This tool does not accept input text.')
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('Options must be an object.')
  const allowed = new Set(['min', 'max', 'count', 'unique'])
  const unknown = Object.keys(options).find(key => !allowed.has(key))
  if (unknown) throw new Error(`Unknown option: ${unknown}.`)
  for (const [key, value] of Object.entries(options)) if (typeof value !== 'string') throw new Error(`${key} must be a string.`)

  const min = parseInteger(options.min, 'min', 1)
  const max = parseInteger(options.max, 'max', 100)
  const count = parseInteger(options.count, 'count', 10)
  const uniqueValue = options.unique ?? 'false'
  if (uniqueValue !== 'true' && uniqueValue !== 'false') throw new Error('unique must be true or false.')
  if (min > max) throw new Error('min must be less than or equal to max.')
  if (count < 1 || count > MAX_COUNT) throw new Error(`count must be a whole number from 1 to ${MAX_COUNT}.`)

  const lower = BigInt(min)
  const span = BigInt(max) - lower + BigInt(1)
  const unique = uniqueValue === 'true'
  if (unique && BigInt(count) > span) throw new Error('count cannot exceed the number of available unique values.')
  if (span > BigInt(MAX_SAFE) * BigInt(2) + BigInt(1)) throw new Error('Range is too wide.')

  const results: number[] = []
  const seen = new Set<number>()
  const maxAttempts = count * 1_000
  let attempts = 0
  while (results.length < count) {
    if (attempts++ >= maxAttempts) throw new Error('Could not sample enough unique numbers; try again.')
    const value = Number(lower + randomBelow(span))
    if (unique && seen.has(value)) continue
    seen.add(value)
    results.push(value)
  }
  return results.join('\n')
}
