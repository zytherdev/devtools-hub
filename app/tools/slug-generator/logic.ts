import type { ToolOptions } from '@/app/tools/types'

const MAX_INPUT_CHARACTERS = 100_000

function parseMaximum(value: string | undefined): number {
  if (value === undefined) return 80
  if (typeof value !== 'string' || !/^\d+$/.test(value)) throw new Error('maxLength must be a whole number from 1 to 200.')
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 200) throw new Error('maxLength must be a whole number from 1 to 200.')
  return parsed
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string') throw new Error('Input must be text.')
  if (input.length > MAX_INPUT_CHARACTERS) throw new Error(`Input must be no more than ${MAX_INPUT_CHARACTERS.toLocaleString('en-US')} characters.`)
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('Options must be an object.')
  const allowed = new Set(['separator', 'maxLength', 'lowercase'])
  const unknown = Object.keys(options).find(key => !allowed.has(key))
  if (unknown) throw new Error(`Unknown option: ${unknown}.`)
  for (const [key, value] of Object.entries(options)) if (typeof value !== 'string') throw new Error(`${key} must be a string.`)

  const separator = options.separator ?? '-'
  if (!['-', '_'].includes(separator)) throw new Error('separator must be a hyphen (-) or underscore (_).')
  const maxLength = parseMaximum(options.maxLength)
  const lowercase = options.lowercase ?? 'true'
  if (lowercase !== 'true' && lowercase !== 'false') throw new Error('lowercase must be true or false.')

  const base = input.normalize('NFD').replace(/\p{M}+/gu, '')
  const caseAdjusted = lowercase === 'true' ? base.toLocaleLowerCase() : base
  const normalizedSlug = caseAdjusted
    .replace(/[^\p{L}\p{N}]+/gu, separator)
    .replace(new RegExp(`^\\${separator}+|\\${separator}+$`, 'g'), '')
  const slug = Array.from(normalizedSlug)
    .slice(0, maxLength)
    .join('')
    .replace(new RegExp(`\\${separator}+$`, 'g'), '')
  return slug
}
