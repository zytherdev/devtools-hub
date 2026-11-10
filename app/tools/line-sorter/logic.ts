import type { ToolOptions } from '@/app/tools/types'

const MAX_INPUT_CHARACTERS = 1_000_000
const MAX_LINES = 100_000
const ORDERS = new Set(['alphabetical-asc', 'alphabetical-desc', 'numeric-asc', 'numeric-desc', 'reverse'])

function flag(value: string | undefined, name: string, fallback: boolean): boolean {
  const candidate = value ?? String(fallback)
  if (candidate !== 'true' && candidate !== 'false') throw new Error(`${name} must be true or false.`)
  return candidate === 'true'
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string') throw new Error('Input must be text.')
  if (input.length > MAX_INPUT_CHARACTERS) throw new Error('Input exceeds the 1,000,000-character limit.')
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('Options must be an object.')
  const allowed = new Set(['order', 'unique', 'trimWhitespace', 'ignoreEmpty'])
  const unknown = Object.keys(options).find(key => !allowed.has(key))
  if (unknown) throw new Error(`Unknown option: ${unknown}.`)
  for (const [key, value] of Object.entries(options)) if (typeof value !== 'string') throw new Error(`${key} must be a string.`)

  const order = options.order ?? 'alphabetical-asc'
  if (!ORDERS.has(order)) throw new Error('order must be alphabetical-asc, alphabetical-desc, numeric-asc, numeric-desc, or reverse.')
  const unique = flag(options.unique, 'unique', false)
  const trimWhitespace = flag(options.trimWhitespace, 'trimWhitespace', false)
  const ignoreEmpty = flag(options.ignoreEmpty, 'ignoreEmpty', false)
  if (input === '') return ''

  const normalized = input.replace(/\r\n?/g, '\n')
  const lines = normalized.split('\n')
  if (normalized.endsWith('\n')) lines.pop()
  if (lines.length > MAX_LINES) throw new Error(`Input may contain at most ${MAX_LINES.toLocaleString('en-US')} lines.`)
  let result = lines.map(line => trimWhitespace ? line.trim() : line)
  if (ignoreEmpty) result = result.filter(line => line.length > 0)
  if (unique) {
    const seen = new Set<string>()
    result = result.filter(line => {
      if (seen.has(line)) return false
      seen.add(line)
      return true
    })
  }
  if (order === 'reverse') result.reverse()
  else {
    const direction = order.endsWith('desc') ? -1 : 1
    const numeric = order.startsWith('numeric')
    result = result.map((line, index) => ({ line, index })).sort((left, right) => {
      let comparison = 0
      if (numeric && /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(left.line.trim()) && /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(right.line.trim())) {
        comparison = Number(left.line) - Number(right.line)
      } else {
        comparison = left.line.localeCompare(right.line, undefined, { numeric: false, sensitivity: 'base' })
      }
      return comparison === 0 ? left.index - right.index : comparison * direction
    }).map(item => item.line)
  }
  return result.join('\n')
}
