import type { ToolOptions } from '@/app/tools/types'

const ROMAN_VALUES: Array<[string, number]> = [
  ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400], ['C', 100], ['XC', 90], ['L', 50], ['XL', 40], ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1],
]

function toRoman(value: number): string {
  let remainder = value
  let output = ''
  for (const [symbol, amount] of ROMAN_VALUES) {
    while (remainder >= amount) {
      output += symbol
      remainder -= amount
    }
  }
  return output
}

function fromRoman(input: string): number {
  const roman = input.toUpperCase()
  if (roman.length === 0 || roman.length > 15 || !/^[IVXLCDM]+$/.test(roman)) throw new Error('Enter a Roman numeral using I, V, X, L, C, D, and M.')
  let total = 0
  let index = 0
  for (const [symbol, amount] of ROMAN_VALUES) {
    while (roman.startsWith(symbol, index)) {
      total += amount
      index += symbol.length
    }
  }
  if (index !== roman.length || total < 1 || total > 3999 || toRoman(total) !== roman) throw new Error('Roman numeral is not in canonical form (range I to MMMCMXCIX).')
  return total
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string' || input.trim().length === 0 || input.length > 100) throw new Error('Input must contain 1 to 100 characters.')
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('Options must be an object.')
  const unknown = Object.keys(options).find(key => key !== 'mode')
  if (unknown) throw new Error(`Unknown option: ${unknown}.`)
  if (options.mode !== undefined && typeof options.mode !== 'string') throw new Error('mode must be a string.')
  const mode = options.mode ?? 'arabic-to-roman'
  const value = input.trim()
  if (mode === 'arabic-to-roman') {
    if (!/^(?:0|[1-9]\d*)$/.test(value)) throw new Error('Enter a whole Arabic number from 1 to 3999.')
    const number = Number(value)
    if (!Number.isInteger(number) || number < 1 || number > 3999) throw new Error('Arabic number must be from 1 to 3999.')
    return toRoman(number)
  }
  if (mode === 'roman-to-arabic') return String(fromRoman(value))
  throw new Error('mode must be arabic-to-roman or roman-to-arabic.')
}
