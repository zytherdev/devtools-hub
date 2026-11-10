import type { ToolOptions } from '@/app/tools/types'

type Unit = { dimension: string; factor: number }
const UNITS: Record<string, Unit> = {
  mm: { dimension: 'length', factor: 0.001 }, cm: { dimension: 'length', factor: 0.01 }, m: { dimension: 'length', factor: 1 }, km: { dimension: 'length', factor: 1000 },
  in: { dimension: 'length', factor: 0.0254 }, ft: { dimension: 'length', factor: 0.3048 }, yd: { dimension: 'length', factor: 0.9144 }, mi: { dimension: 'length', factor: 1609.344 },
  mg: { dimension: 'mass', factor: 0.000001 }, g: { dimension: 'mass', factor: 0.001 }, kg: { dimension: 'mass', factor: 1 }, oz: { dimension: 'mass', factor: 0.028349523125 }, lb: { dimension: 'mass', factor: 0.45359237 },
  ml: { dimension: 'volume', factor: 0.001 }, l: { dimension: 'volume', factor: 1 }, m3: { dimension: 'volume', factor: 1000 }, gal: { dimension: 'volume', factor: 3.785411784 },
  mm2: { dimension: 'area', factor: 0.000001 }, cm2: { dimension: 'area', factor: 0.0001 }, m2: { dimension: 'area', factor: 1 }, km2: { dimension: 'area', factor: 1_000_000 }, ft2: { dimension: 'area', factor: 0.09290304 }, acre: { dimension: 'area', factor: 4046.8564224 },
  ms: { dimension: 'time', factor: 0.001 }, s: { dimension: 'time', factor: 1 }, min: { dimension: 'time', factor: 60 }, h: { dimension: 'time', factor: 3600 }, day: { dimension: 'time', factor: 86400 },
}
const TEMPERATURES = new Set(['C', 'F', 'K'])

function precisionOption(value: string | undefined): number {
  if (value === undefined) return 4
  if (typeof value !== 'string' || !/^\d+$/.test(value)) throw new Error('precision must be a whole number from 0 to 12.')
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 12) throw new Error('precision must be a whole number from 0 to 12.')
  return parsed
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string' || input.length > 100) throw new Error('Input must be a number with no more than 100 characters.')
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(input.trim())) throw new Error('Input must be a finite decimal number.')
  const value = Number(input.trim())
  if (!Number.isFinite(value)) throw new Error('Input must be a finite decimal number.')
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('Options must be an object.')
  const unknown = Object.keys(options).find(key => !['from', 'to', 'precision'].includes(key))
  if (unknown) throw new Error(`Unknown option: ${unknown}.`)
  for (const [key, option] of Object.entries(options)) if (typeof option !== 'string') throw new Error(`${key} must be a string.`)

  const from = options.from ?? 'm'
  const to = options.to ?? 'km'
  const precision = precisionOption(options.precision)
  const isTemperatureFrom = TEMPERATURES.has(from)
  const isTemperatureTo = TEMPERATURES.has(to)
  if (isTemperatureFrom !== isTemperatureTo) throw new Error('The selected units belong to different dimensions.')

  let dimension: string
  let result: number
  if (isTemperatureFrom && isTemperatureTo) {
    dimension = 'temperature'
    const kelvin = from === 'C' ? value + 273.15 : from === 'F' ? (value - 32) * 5 / 9 + 273.15 : value
    if (kelvin < 0) throw new Error('Temperature cannot be below absolute zero.')
    result = to === 'C' ? kelvin - 273.15 : to === 'F' ? (kelvin - 273.15) * 9 / 5 + 32 : kelvin
  } else {
    const source = UNITS[from]
    const destination = UNITS[to]
    if (!source || !destination) throw new Error('Unknown unit. See the supported units in the documentation.')
    if (source.dimension !== destination.dimension) throw new Error('The selected units belong to different dimensions.')
    dimension = source.dimension
    result = value * source.factor / destination.factor
  }
  if (!Number.isFinite(result)) throw new Error('Converted value is outside the supported numeric range.')
  const rounded = Number(result.toFixed(precision))
  return JSON.stringify({ input: value, from, to, dimension, result: Object.is(rounded, -0) ? 0 : rounded })
}
