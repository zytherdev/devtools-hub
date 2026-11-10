import type { ToolOptions } from '@/app/tools/types'

const MAX_INPUT_CHARACTERS = 1_000_000
const MAX_LINES = 100_000

function booleanOption(value: string | undefined, name: string, fallback: boolean): boolean {
  const candidate = value ?? String(fallback)
  if (candidate !== 'true' && candidate !== 'false') throw new Error(`${name} must be true or false.`)
  return candidate === 'true'
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string') throw new Error('Input must be text.')
  if (input.length > MAX_INPUT_CHARACTERS) throw new Error('Input exceeds the 1,000,000-character limit.')
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('Options must be an object.')
  const allowed = new Set(['caseSensitive', 'trimWhitespace', 'keepEmpty'])
  const unknown = Object.keys(options).find(key => !allowed.has(key))
  if (unknown) throw new Error(`Unknown option: ${unknown}.`)
  for (const [key, value] of Object.entries(options)) if (typeof value !== 'string') throw new Error(`${key} must be a string.`)

  const caseSensitive = booleanOption(options.caseSensitive, 'caseSensitive', true)
  const trimWhitespace = booleanOption(options.trimWhitespace, 'trimWhitespace', false)
  const keepEmpty = booleanOption(options.keepEmpty, 'keepEmpty', false)
  if (input === '') return ''
  const lines = input.replace(/\r\n?/g, '\n').split('\n')
  if (input.endsWith('\n') || input.endsWith('\r')) lines.pop()
  if (lines.length > MAX_LINES) throw new Error(`Input may contain at most ${MAX_LINES.toLocaleString('en-US')} lines.`)

  const seen = new Set<string>()
  const unique: string[] = []
  for (const original of lines) {
    const line = trimWhitespace ? original.trim() : original
    if (!keepEmpty && line === '') continue
    const key = caseSensitive ? line : line.toLocaleLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(line)
  }
  return unique.join('\n')
}
