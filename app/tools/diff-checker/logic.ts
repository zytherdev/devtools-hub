import type { ToolOptions } from '@/app/tools/types'

export const DEFAULT_SEPARATOR = '---8<---'
export const MAX_INPUT_LENGTH = 200_000
export const MAX_LINES_PER_SIDE = 2_000
export const MAX_OUTPUT_LENGTH = 500_000

const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F-\u009F]/u

function getSeparator(options: ToolOptions): string {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('Options must be an object.')
  }

  const keys = Reflect.ownKeys(options)
  for (const key of keys) {
    if (key !== 'separator') {
      throw new Error(`Unknown option: ${String(key)}.`)
    }
  }

  const separator = Object.hasOwn(options, 'separator')
    ? options.separator
    : DEFAULT_SEPARATOR

  if (typeof separator !== 'string') {
    throw new Error('The separator option must be a string.')
  }
  if (separator.length === 0) {
    throw new Error('The separator option cannot be empty.')
  }
  if (separator.length > 80) {
    throw new Error('The separator option must be no more than 80 characters.')
  }
  if (CONTROL_CHARACTERS.test(separator)) {
    throw new Error('The separator option cannot contain control characters.')
  }

  return separator
}

function linesFromRecords(records: string[]): string[] {
  if (records.length === 0) return []

  const text = records.join('\n')
  if (text.length === 0) return []

  const lines = text.split('\n')
  // A final line break terminates the last line; it does not create another empty line.
  if (lines[lines.length - 1] === '') lines.pop()
  return lines
}

function buildDiff(original: string[], updated: string[]): string[] {
  const originalCount = original.length
  const updatedCount = updated.length
  const lcs = Array.from(
    { length: originalCount + 1 },
    () => new Uint16Array(updatedCount + 1),
  )

  for (let i = originalCount - 1; i >= 0; i--) {
    const row = lcs[i]
    const nextRow = lcs[i + 1]
    for (let j = updatedCount - 1; j >= 0; j--) {
      row[j] = original[i] === updated[j]
        ? nextRow[j + 1] + 1
        : Math.max(nextRow[j], row[j + 1])
    }
  }

  const diff: string[] = []
  let i = 0
  let j = 0

  while (i < originalCount && j < updatedCount) {
    if (original[i] === updated[j]) {
      diff.push(` ${original[i]}`)
      i++
      j++
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      // On ties, emitting removals before additions keeps the result stable.
      diff.push(`-${original[i]}`)
      i++
    } else {
      diff.push(`+${updated[j]}`)
      j++
    }
  }

  while (i < originalCount) {
    diff.push(`-${original[i]}`)
    i++
  }
  while (j < updatedCount) {
    diff.push(`+${updated[j]}`)
    j++
  }

  return diff
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string.')
  }
  if (input.length > MAX_INPUT_LENGTH) {
    throw new Error('Input must be no more than 200,000 characters.')
  }

  const separator = getSeparator(options)
  const records = input.replace(/\r\n?/g, '\n').split('\n')
  const separatorIndexes: number[] = []

  for (let index = 0; index < records.length; index++) {
    if (records[index] === separator) separatorIndexes.push(index)
  }

  if (separatorIndexes.length === 0) {
    throw new Error(`Input must contain exactly one line ${JSON.stringify(separator)} as a separator.`)
  }
  if (separatorIndexes.length > 1) {
    throw new Error(`Input contains more than one line ${JSON.stringify(separator)} as a separator.`)
  }

  const separatorIndex = separatorIndexes[0]
  const original = linesFromRecords(records.slice(0, separatorIndex))
  const updated = linesFromRecords(records.slice(separatorIndex + 1))

  if (original.length > MAX_LINES_PER_SIDE) {
    throw new Error('Original text must contain no more than 2,000 lines.')
  }
  if (updated.length > MAX_LINES_PER_SIDE) {
    throw new Error('Updated text must contain no more than 2,000 lines.')
  }

  const output = ['--- Original', '+++ Updated', ...buildDiff(original, updated)].join('\n')
  if (output.length > MAX_OUTPUT_LENGTH) {
    throw new Error('Output exceeds the 500,000-character limit.')
  }
  return output
}
