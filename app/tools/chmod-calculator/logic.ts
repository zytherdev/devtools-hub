import type { ToolOptions } from '@/app/tools/types'

const MAX_INPUT_LENGTH = 4
const MODE_PATTERN = /^(?:[0-7]{3}|[0-7]{4})$/

function validateOptions(options: unknown): void {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('Options must be an empty object; this tool does not accept options.')
  }
  if (Object.keys(options).length > 0) {
    throw new Error('This tool does not accept options.')
  }
}

function symbolicGroup(value: number, specialBit: boolean, specialLower: string): string {
  const read = value & 4 ? 'r' : '-'
  const write = value & 2 ? 'w' : '-'
  const execute = value & 1 ? 'x' : '-'
  const specialCharacter = specialBit ? (value & 1 ? specialLower : specialLower.toUpperCase()) : execute
  return `${read}${write}${specialBit ? specialCharacter : execute}`
}

export function run(input: string, options: ToolOptions = {}): string {
  validateOptions(options)

  if (typeof input !== 'string') {
    throw new Error('Mode must be a 3- or 4-digit octal string (000–7777).')
  }
  if (input.length > MAX_INPUT_LENGTH) {
    throw new Error(`Mode must contain ${MAX_INPUT_LENGTH} characters or fewer.`)
  }
  if (!MODE_PATTERN.test(input)) {
    throw new Error('Invalid mode. Enter exactly 3 or 4 octal digits (0–7), without spaces or prefixes.')
  }

  const hasSpecialDigit = input.length === 4
  const special = hasSpecialDigit ? Number(input[0]) : 0
  const digits = hasSpecialDigit ? input.slice(1) : input
  const owner = Number(digits[0])
  const group = Number(digits[1])
  const others = Number(digits[2])
  const canonicalOctal = `${special}${digits}`
  const symbolic = [
    symbolicGroup(owner, Boolean(special & 4), 's'),
    symbolicGroup(group, Boolean(special & 2), 's'),
    symbolicGroup(others, Boolean(special & 1), 't'),
  ].join('')

  return JSON.stringify({
    octal: canonicalOctal,
    symbolic,
    owner,
    group,
    others,
  }, null, 2)
}
