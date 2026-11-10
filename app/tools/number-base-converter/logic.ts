import type { ToolOptions } from '@/app/tools/types'

function parseBase(value: string | undefined, name: string, fallback: number): number {
  const candidate = value ?? String(fallback)
  if (typeof candidate !== 'string' || !/^\d{1,2}$/.test(candidate)) throw new Error(`${name} must be a base from 2 to 36.`)
  const base = Number(candidate)
  if (!Number.isInteger(base) || base < 2 || base > 36) throw new Error(`${name} must be a base from 2 to 36.`)
  return base
}

function parseInteger(text: string, base: number): bigint {
  let digits = text
  let sign = BigInt(1)
  if (digits.startsWith('-') || digits.startsWith('+')) {
    if (digits[0] === '-') sign = BigInt(-1)
    digits = digits.slice(1)
  }
  if (digits.length === 0) throw new Error('Input must contain digits for the selected base.')
  let value = BigInt(0)
  for (const character of digits.toLowerCase()) {
    const code = character.charCodeAt(0)
    const digit = code >= 48 && code <= 57 ? code - 48 : code >= 97 && code <= 122 ? code - 87 : -1
    if (digit < 0 || digit >= base) throw new Error(`Digit ${character} is not valid in base ${base}.`)
    value = value * BigInt(base) + BigInt(digit)
  }
  return value * sign
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string' || input.trim().length === 0 || input.length > 1_000) throw new Error('Input must contain 1 to 1,000 base digits.')
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('Options must be an object.')
  const unknown = Object.keys(options).find(key => !['fromBase', 'toBase'].includes(key))
  if (unknown) throw new Error(`Unknown option: ${unknown}.`)
  for (const [key, value] of Object.entries(options)) if (typeof value !== 'string') throw new Error(`${key} must be a string.`)
  const fromBase = parseBase(options.fromBase, 'fromBase', 10)
  const toBase = parseBase(options.toBase, 'toBase', 16)
  const value = parseInteger(input.trim(), fromBase)
  return value.toString(toBase)
}
