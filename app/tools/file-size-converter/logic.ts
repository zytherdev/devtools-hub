import type { ToolOptions } from '@/app/tools/types'

const UNITS: Record<string, number> = {
  B: 1,
  KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12, PB: 1e15,
  KiB: 2 ** 10, MiB: 2 ** 20, GiB: 2 ** 30, TiB: 2 ** 40, PiB: 2 ** 50, EiB: 2 ** 60,
}

function parsePrecision(value: string | undefined): number {
  const candidate = value ?? '3'
  if (typeof candidate !== 'string' || !/^\d+$/.test(candidate)) throw new Error('precision must be a whole number from 0 to 12.')
  const precision = Number(candidate)
  if (!Number.isInteger(precision) || precision < 0 || precision > 12) throw new Error('precision must be a whole number from 0 to 12.')
  return precision
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string' || input.length > 100 || !/^[+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(input.trim())) throw new Error('Input must be a non-negative finite size with at most 100 characters.')
  const value = Number(input.trim())
  if (!Number.isFinite(value)) throw new Error('Input size must be finite.')
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('Options must be an object.')
  const unknown = Object.keys(options).find(key => !['from', 'to', 'precision'].includes(key))
  if (unknown) throw new Error(`Unknown option: ${unknown}.`)
  for (const [key, option] of Object.entries(options)) if (typeof option !== 'string') throw new Error(`${key} must be a string.`)
  const from = options.from ?? 'B'
  const to = options.to ?? 'KiB'
  if (!Object.hasOwn(UNITS, from) || !Object.hasOwn(UNITS, to)) throw new Error('Unknown size unit. Use B, KB–PB, or KiB–EiB.')
  const precision = parsePrecision(options.precision)
  const result = value * (UNITS[from] / UNITS[to])
  if (!Number.isFinite(result)) throw new Error('Converted size is outside the supported numeric range.')
  const rounded = Number(result.toFixed(precision))
  return JSON.stringify({ input: value, from, to, result: Object.is(rounded, -0) ? 0 : rounded })
}
