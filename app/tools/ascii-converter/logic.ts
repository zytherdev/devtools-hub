import type { ToolOptions } from '@/app/tools/types'

export const MAX_INPUT_LENGTH = 100_000
export const MAX_OUTPUT_LENGTH = 800_000
export const DEFAULT_MODE = 'text-to-codes'
export const DEFAULT_BASE = 'decimal'

const MODES = ['text-to-codes', 'codes-to-text'] as const
const BASES = ['decimal', 'hex', 'binary'] as const

type Mode = typeof MODES[number]
type Base = typeof BASES[number]

function validateOptions(options: unknown): { mode: Mode; base: Base } {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('Options must be an object containing mode and base strings.')
  }

  const entries = options as Record<string, unknown>
  for (const key of Object.keys(entries)) {
    if (key !== 'mode' && key !== 'base') {
      throw new Error(`Unsupported option "${key}". Supported options are mode and base.`)
    }
  }

  const mode = entries.mode === undefined ? DEFAULT_MODE : entries.mode
  if (typeof mode !== 'string' || !MODES.includes(mode as Mode)) {
    throw new Error('Unsupported mode. Choose "text-to-codes" or "codes-to-text".')
  }

  const base = entries.base === undefined ? DEFAULT_BASE : entries.base
  if (typeof base !== 'string' || !BASES.includes(base as Base)) {
    throw new Error('Unsupported base. Choose "decimal", "hex", or "binary".')
  }

  return { mode: mode as Mode, base: base as Base }
}

function encodeText(input: string, base: Base): string {
  const codes: string[] = []
  let offset = 0

  for (const character of input) {
    const codePoint = character.codePointAt(0)!
    if (codePoint > 0x7f) {
      const hex = codePoint.toString(16).toUpperCase().padStart(4, '0')
      throw new Error(`Character at position ${offset + 1} is U+${hex}; ASCII text must use code points 0–127.`)
    }
    codes.push(codePoint.toString(base === 'hex' ? 16 : base === 'binary' ? 2 : 10))
    offset += character.length
  }

  return codes.join(' ')
}

function parseToken(token: string, index: number, base: Base): number {
  const valid = base === 'decimal'
    ? /^[0-9]+$/.test(token)
    : base === 'hex'
      ? /^[0-9a-fA-F]+$/.test(token)
      : /^[01]+$/.test(token)

  if (!valid) {
    const shown = token.length > 32 ? `${token.slice(0, 29)}…` : token
    throw new Error(`Invalid ${base} token #${index + 1} ("${shown}"). Use whitespace-separated digits without prefixes.`)
  }

  const value = Number.parseInt(token, base === 'decimal' ? 10 : base === 'hex' ? 16 : 2)
  if (!Number.isSafeInteger(value) || value < 0 || value > 127) {
    throw new Error(`ASCII token #${index + 1} ("${token.slice(0, 32)}") is out of range; each value must be 0–127.`)
  }
  return value
}

function decodeCodes(input: string, base: Base): string {
  const tokens = input.trim() === '' ? [] : input.trim().split(/\s+/)
  return tokens.map((token, index) => String.fromCharCode(parseToken(token, index, base))).join('')
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string.')
  }
  if (input.length > MAX_INPUT_LENGTH) {
    throw new Error(`Input must be ${MAX_INPUT_LENGTH.toLocaleString()} characters or fewer.`)
  }

  const { mode, base } = validateOptions(options)
  const output = mode === 'text-to-codes' ? encodeText(input, base) : decodeCodes(input, base)
  if (output.length > MAX_OUTPUT_LENGTH) {
    throw new Error(`Output exceeds the ${MAX_OUTPUT_LENGTH.toLocaleString()}-character limit.`)
  }
  return output
}
