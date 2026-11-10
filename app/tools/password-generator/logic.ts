import type { ToolOptions } from '@/app/tools/types'

const MIN_LENGTH = 8
const MAX_LENGTH = 256
const MAX_COUNT = 100
const AMBIGUOUS_CHARACTERS = new Set(['I', 'l', '1', 'O', '0', '|'])
const CHARACTER_CLASSES = [
  { option: 'uppercase', bit: 1, characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
  { option: 'lowercase', bit: 2, characters: 'abcdefghijklmnopqrstuvwxyz' },
  { option: 'numbers', bit: 4, characters: '0123456789' },
  { option: 'symbols', bit: 8, characters: `!"#$%&'()*+,-./:;<=>?@[\\]^_\x60{|}~` },
] as const
const ALLOWED_OPTIONS = new Set([
  'length',
  'count',
  'uppercase',
  'lowercase',
  'numbers',
  'symbols',
  'excludeAmbiguous',
])

type CharacterGroup = { bit: number; characters: string[] }

function parseBoundedInteger(value: string | undefined, fallback: number, label: string, min: number, max: number): number {
  const raw = value ?? String(fallback)
  if (!/^\d+$/.test(raw)) {
    throw new Error(`${label} must be a whole number from ${min} to ${max}.`)
  }
  const parsed = Number(raw)
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${label} must be a whole number from ${min} to ${max}.`)
  }
  return parsed
}

function parseBoolean(value: string | undefined, fallback: boolean, label: string): boolean {
  if (value === undefined) return fallback
  if (value === 'true') return true
  if (value === 'false') return false
  throw new Error(`${label} must be either true or false.`)
}

function getCryptoProvider(): Pick<Crypto, 'getRandomValues'> {
  const provider = globalThis.crypto
  if (!provider || typeof provider.getRandomValues !== 'function') {
    throw new Error('Web Crypto is not supported in this environment; no password was generated.')
  }
  return provider
}

/** Return an unbiased integer in [0, upperBound) using cryptographic rejection sampling. */
function randomBelow(upperBound: bigint, provider: Pick<Crypto, 'getRandomValues'>): bigint {
  if (upperBound <= BigInt(0)) throw new Error('Cannot sample an empty password alphabet.')

  const bitLength = (upperBound - BigInt(1)).toString(2).length
  const byteLength = Math.ceil(bitLength / 8)
  const excessBits = byteLength * 8 - bitLength

  // A bounded retry protects the UI from a broken provider without ever substituting
  // a weaker random source. Exhaustion fails closed.
  for (let attempt = 0; attempt < 128; attempt += 1) {
    const bytes = new Uint8Array(byteLength)
    try {
      provider.getRandomValues(bytes)
    } catch {
      throw new Error('Web Crypto could not provide random bytes; no password was generated.')
    }
    if (excessBits > 0) bytes[0] &= 0xff >>> excessBits

    let candidate = BigInt(0)
    for (const byte of bytes) candidate = (candidate << BigInt(8)) | BigInt(byte)
    if (candidate < upperBound) return candidate
  }

  throw new Error('Web Crypto could not provide an unbiased random sample; no password was generated.')
}

function countBits(value: number): number {
  let count = 0
  for (let mask = value; mask !== 0; mask &= mask - 1) count += 1
  return count
}

function createWaysCounter(groups: CharacterGroup[]) {
  const alphabetSize = groups.reduce((total, group) => total + group.characters.length, 0)
  const memo = new Map<string, bigint>()

  function ways(remaining: number, neededMask: number): bigint {
    if (neededMask === 0) return BigInt(alphabetSize) ** BigInt(remaining)
    if (remaining === 0 || remaining < countBits(neededMask)) return BigInt(0)

    const key = `${remaining}:${neededMask}`
    const cached = memo.get(key)
    if (cached !== undefined) return cached

    let total = BigInt(0)
    for (const group of groups) {
      const nextMask = neededMask & ~group.bit
      total += BigInt(group.characters.length) * ways(remaining - 1, nextMask)
    }
    memo.set(key, total)
    return total
  }

  return ways
}

function generatePassword(
  length: number,
  groups: CharacterGroup[],
  requiredMask: number,
  ways: (remaining: number, neededMask: number) => bigint,
  provider: Pick<Crypto, 'getRandomValues'>,
): string {
  let neededMask = requiredMask
  const password: string[] = []

  for (let position = 0; position < length; position += 1) {
    const remaining = length - position
    const totalWays = ways(remaining, neededMask)
    if (totalWays <= BigInt(0)) throw new Error('No password can satisfy the selected character classes at this length.')

    let ticket = randomBelow(totalWays, provider)
    for (const group of groups) {
      const nextMask = neededMask & ~group.bit
      const suffixWays = ways(remaining - 1, nextMask)
      const groupWays = BigInt(group.characters.length) * suffixWays
      if (ticket < groupWays) {
        const characterIndex = Number(ticket / suffixWays)
        password.push(group.characters[characterIndex])
        neededMask = nextMask
        break
      }
      ticket -= groupWays
    }
  }

  return password.join('')
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string' || input !== '') {
    throw new Error('Password Generator does not accept input text; configure options and run it with an empty input.')
  }
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('Options must be a JSON object.')
  }
  for (const key of Object.keys(options)) {
    if (!ALLOWED_OPTIONS.has(key)) throw new Error(`Unknown option "${key}".`)
    if (typeof options[key] !== 'string') throw new Error(`Option "${key}" must be a string.`)
  }

  const length = parseBoundedInteger(options.length, 20, 'Length', MIN_LENGTH, MAX_LENGTH)
  const count = parseBoundedInteger(options.count, 1, 'Count', 1, MAX_COUNT)
  const excludeAmbiguous = parseBoolean(options.excludeAmbiguous, false, 'excludeAmbiguous')
  const groups = CHARACTER_CLASSES.flatMap(({ option, bit, characters }) => {
    if (!parseBoolean(options[option], true, option)) return []
    const filtered = [...characters].filter(character => !excludeAmbiguous || !AMBIGUOUS_CHARACTERS.has(character))
    return filtered.length ? [{ bit, characters: filtered }] : []
  })
  const requiredMask = groups.reduce((mask, group) => mask | group.bit, 0)
  const alphabetSize = groups.reduce((total, group) => total + group.characters.length, 0)
  if (alphabetSize === 0 || requiredMask === 0) {
    throw new Error('Select at least one character class with a non-empty alphabet.')
  }

  const ways = createWaysCounter(groups)
  if (ways(length, requiredMask) === BigInt(0)) {
    throw new Error('The selected character classes cannot all be represented at this length.')
  }
  const provider = getCryptoProvider()
  return Array.from({ length: count }, () => generatePassword(length, groups, requiredMask, ways, provider)).join('\n')
}
