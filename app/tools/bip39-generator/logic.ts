import { entropyToMnemonic } from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import type { ToolOptions } from '@/app/tools/types'

const VALID_STRENGTHS = new Set(['128', '160', '192', '224', '256'])
const WORD_COUNT_BY_STRENGTH: Record<string, number> = {
  '128': 12,
  '160': 15,
  '192': 18,
  '224': 21,
  '256': 24,
}

function getSecureEntropy(byteLength: number): Uint8Array {
  const provider = globalThis.crypto
  if (!provider || typeof provider.getRandomValues !== 'function') {
    throw new Error('Web Crypto is unavailable; no mnemonic was generated.')
  }

  const entropy = new Uint8Array(byteLength)
  try {
    provider.getRandomValues(entropy)
  } catch {
    throw new Error('Web Crypto could not provide secure random bytes; no mnemonic was generated.')
  }
  return entropy
}

export function maskMnemonic(mnemonic: string): string {
  if (typeof mnemonic !== 'string' || mnemonic.length === 0) return ''
  return mnemonic.trim().split(/\s+/).map(() => '•••••').join(' ')
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string' || input.length !== 0) {
    throw new Error('BIP39 Mnemonic Generator does not accept input text.')
  }
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('Options must be an object.')
  }

  const unknownOption = Object.keys(options).find(key => key !== 'strength')
  if (unknownOption) throw new Error(`Unknown option "${unknownOption}". Supported option: "strength".`)
  for (const [key, value] of Object.entries(options)) {
    if (typeof value !== 'string') throw new Error(`Option "${key}" must be a string.`)
  }

  const strength = options.strength ?? '128'
  if (!VALID_STRENGTHS.has(strength)) {
    throw new Error('Strength must be one of 128, 160, 192, 224, or 256 bits.')
  }

  const entropy = getSecureEntropy(Number(strength) / 8)
  try {
    const mnemonic = entropyToMnemonic(entropy, wordlist)
    if (mnemonic.split(' ').length !== WORD_COUNT_BY_STRENGTH[strength]) {
      throw new Error('BIP39 generation returned an unexpected mnemonic length.')
    }
    return mnemonic
  } finally {
    entropy.fill(0)
  }
}
