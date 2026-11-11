import type { ToolOptions } from '@/app/tools/types'

export const MAX_INPUT_LENGTH = 100
const MAX_RATE_LENGTH = 100
const ALLOWED_OPTIONS = new Set(['from', 'to', 'rate', 'precision'])
const DECIMAL_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/

function parseFiniteDecimal(value: string, label: string): number {
  const normalized = value.trim()
  if (!normalized || normalized.length > MAX_INPUT_LENGTH || !DECIMAL_PATTERN.test(normalized)) {
    throw new Error(`${label} must be a finite decimal number.`)
  }
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed)) throw new Error(`${label} must be a finite decimal number.`)
  return parsed
}

function parseCurrency(value: string | undefined, label: string, fallback: string): string {
  const currency = value ?? fallback
  if (!/^[A-Za-z]{3}$/.test(currency)) {
    throw new Error(`Option "${label}" must contain exactly three ASCII letters.`)
  }
  return currency.toUpperCase()
}

function parsePrecision(value: string | undefined): number {
  const text = value ?? '2'
  if (!/^\d+$/.test(text)) throw new Error('Option "precision" must be an integer from 0 to 6.')
  const precision = Number(text)
  if (!Number.isInteger(precision) || precision < 0 || precision > 6) {
    throw new Error('Option "precision" must be an integer from 0 to 6.')
  }
  return precision
}

function validateOptions(options: ToolOptions): void {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('Options must be an object containing supported settings.')
  }
  for (const key of Object.keys(options)) {
    if (!ALLOWED_OPTIONS.has(key)) throw new Error(`Unknown option: "${key}".`)
    if (typeof options[key] !== 'string') throw new Error(`Option "${key}" must be a string.`)
    if (options[key].length > MAX_RATE_LENGTH) throw new Error(`Option "${key}" exceeds the ${MAX_RATE_LENGTH}-character limit.`)
  }
}

/** Convert locally with the user-declared rate; no external or live rate is fetched. */
export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string' || input.length > MAX_INPUT_LENGTH) {
    throw new Error(`Amount must be a finite decimal with no more than ${MAX_INPUT_LENGTH} characters.`)
  }
  const amount = parseFiniteDecimal(input, 'Amount')
  validateOptions(options)

  const from = parseCurrency(options.from, 'from', 'USD')
  const to = parseCurrency(options.to, 'to', 'EUR')
  const rateText = options.rate ?? '1'
  if (rateText.length > MAX_RATE_LENGTH) throw new Error(`Option "rate" exceeds the ${MAX_RATE_LENGTH}-character limit.`)
  const rate = parseFiniteDecimal(rateText, 'Option "rate"')
  if (rate <= 0) throw new Error('Option "rate" must be a positive finite number.')
  const precision = parsePrecision(options.precision)

  const converted = amount * rate
  if (!Number.isFinite(converted)) throw new Error('Converted amount is outside the supported numeric range.')
  const rounded = Number(converted.toFixed(precision))
  const result = Object.is(rounded, -0) ? 0 : rounded

  return JSON.stringify({ from, to, rate, amount, result })
}
