import type { ToolOptions } from '@/app/tools/types'

const MAX_INPUT_CHARACTERS = 1_000_000
const MAX_OUTPUT_CHARACTERS = 4_000_000
const MAX_NODES = 100_000
const MAX_DEPTH = 50

type JsonObject = Record<string, unknown>
type Difference = { path: string; value?: unknown; before?: unknown; after?: unknown }

function isObject(value: unknown): value is JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function pointer(path: string, key: string | number): string {
  return `${path}/${String(key).replace(/~/g, '~0').replace(/\//g, '~1')}`
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string') throw new Error('Input must be text.')
  if (input.length > MAX_INPUT_CHARACTERS) throw new Error(`Input must be no more than ${MAX_INPUT_CHARACTERS.toLocaleString('en-US')} characters.`)
  if (input.trim() === '') throw new Error('Provide a JSON object with before and after values.')
  if (!options || typeof options !== 'object' || Array.isArray(options) || Object.keys(options).length > 0) throw new Error('JSON Diff does not accept options.')

  let parsed: unknown
  try { parsed = JSON.parse(input) } catch { throw new Error('Input must be valid JSON.') }
  if (!isObject(parsed) || !Object.hasOwn(parsed, 'before') || !Object.hasOwn(parsed, 'after') || Object.keys(parsed).length !== 2) {
    throw new Error('Input must contain exactly the before and after properties.')
  }

  const added: Difference[] = []
  const removed: Difference[] = []
  const changed: Difference[] = []
  let visited = 0

  function compare(before: unknown, after: unknown, path: string, depth: number): void {
    visited += 1
    if (visited > MAX_NODES) throw new Error(`Comparison exceeds the ${MAX_NODES.toLocaleString('en-US')}-node limit.`)
    if (depth > MAX_DEPTH) throw new Error(`Comparison exceeds the maximum depth of ${MAX_DEPTH}.`)
    if (Object.is(before, after)) return

    if (isObject(before) && isObject(after)) {
      const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort()
      for (const key of keys) {
        const childPath = pointer(path, key)
        if (!Object.hasOwn(before, key)) added.push({ path: childPath, value: after[key] })
        else if (!Object.hasOwn(after, key)) removed.push({ path: childPath, value: before[key] })
        else compare(before[key], after[key], childPath, depth + 1)
      }
      return
    }

    if (Array.isArray(before) && Array.isArray(after) && before.length === after.length) {
      for (let index = 0; index < before.length; index += 1) compare(before[index], after[index], pointer(path, index), depth + 1)
      return
    }
    changed.push({ path, before, after })
  }

  compare(parsed.before, parsed.after, '', 0)
  const output = JSON.stringify({ added, removed, changed }, null, 2)
  if (output.length > MAX_OUTPUT_CHARACTERS) throw new Error(`Diff output exceeds the ${MAX_OUTPUT_CHARACTERS.toLocaleString('en-US')}-character limit.`)
  return output
}
