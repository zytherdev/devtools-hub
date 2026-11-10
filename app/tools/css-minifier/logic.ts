import type { ToolOptions } from '@/app/tools/types'

const MAX_INPUT_LENGTH = 1_000_000
const NAME_CHAR = /[A-Za-z0-9_\u0080-\uFFFF.#%\\-]/
const DECLARATION_PUNCTUATION = /[{}:;,()]/
const SELECTOR_COMBINATOR = /[>+~|,{}]/
const CUSTOM_PROPERTY_NAME = /^--(?:\\.|[-_a-zA-Z0-9\u0080-\uFFFF])+$/

function needsSpace(previous: string, next: string, selectorContext: boolean): boolean {
  if (!previous || !next) return false
  if (selectorContext) {
    if (SELECTOR_COMBINATOR.test(previous) || SELECTOR_COMBINATOR.test(next)) return false
    if (/[:[.#*]/.test(next)) return true
    if (/[\])]/.test(previous)) return true
  }
  // Do not merge CSS name/number tokens, function tokens, or calc() operators.
  if ((previous === '+' || previous === '-') && NAME_CHAR.test(next)) return true
  if ((next === '+' || next === '-') && NAME_CHAR.test(previous)) return true
  if (NAME_CHAR.test(previous) && NAME_CHAR.test(next)) return true
  if (NAME_CHAR.test(previous) && (next === '(' || next === '[')) return true
  return !DECLARATION_PUNCTUATION.test(previous) && !DECLARATION_PUNCTUATION.test(next)
}

function minifyCSSSafely(code: string): string {
  if (typeof code !== 'string') throw new Error('CSS input must be a string.')
  if (code.length > MAX_INPUT_LENGTH) throw new Error(`CSS input must be ${MAX_INPUT_LENGTH.toLocaleString()} characters or fewer.`)
  if (!code) return ''

  let output = ''
  let pendingSpace = false
  let quote: '"' | "'" | null = null
  let escaped = false
  let customValue = false
  let customNesting: string[] = []
  let segmentStart = 0
  let i = 0
  const delimiters: string[] = []
  const blockKinds: boolean[] = []

  while (i < code.length) {
    const char = code[i]

    if (quote) {
      output += char
      if (escaped) escaped = false
      else if (char === '\\') escaped = true
      else if (char === quote) quote = null
      i++
      continue
    }

    if (char === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2)
      if (end < 0) throw new Error('CSS contains an unterminated comment.')
      const commentEnd = end + 2
      const comment = code.slice(i, commentEnd)
      if (customValue) {
        output += comment
      } else if (comment.startsWith('/*!')) {
        const selectorContext = blockKinds.length === 0 || blockKinds.at(-1) === true
        if (pendingSpace && output && needsSpace(output.at(-1) ?? '', comment[0], selectorContext)) output += ' '
        output += comment
        // Retain a separator if removing the comment would merge adjacent tokens.
        if (NAME_CHAR.test(comment.at(-1) ?? '') && NAME_CHAR.test(code[commentEnd] ?? '')) output += ' '
      } else if (NAME_CHAR.test(output.at(-1) ?? '') && NAME_CHAR.test(code[commentEnd] ?? '')) {
        pendingSpace = true
      }
      i = commentEnd
      continue
    }

    if (customValue) {
      if (char === '\\') {
        output += char
        if (i + 1 < code.length) output += code[i + 1]
        i += Math.min(2, code.length - i)
        continue
      }
      if ((char === ';' || char === '}') && customNesting.length === 0) {
        customValue = false
      } else {
        output += char
        if (char === '(' || char === '[' || char === '{') customNesting.push(char)
        else if (char === ')' || char === ']' || char === '}') {
          const expected = char === ')' ? '(' : char === ']' ? '[' : '{'
          if (customNesting.at(-1) !== expected) throw new Error('CSS contains an unmatched delimiter in a custom property value.')
          customNesting.pop()
        }
        i++
        continue
      }
    }

    if (/\s/.test(char)) {
      pendingSpace = true
      i++
      continue
    }

    const selectorContext = blockKinds.length === 0 || blockKinds.at(-1) === true
    const previous = output.at(-1) ?? ''
    if (pendingSpace && output && previous !== ' ' && needsSpace(previous, char, selectorContext)) output += ' '
    pendingSpace = false

    if (char === '"' || char === "'") {
      quote = char
      escaped = false
      output += char
      i++
      continue
    }

    if (char === '\\') {
      output += char
      if (i + 1 < code.length) output += code[i + 1]
      i += Math.min(2, code.length - i)
      continue
    }

    if (char === '{') {
      const prelude = output.slice(segmentStart).trim()
      delimiters.push(char)
      blockKinds.push(/^@/.test(prelude))
      output += char
      segmentStart = output.length
      i++
      continue
    }

    if (char === '}') {
      if (delimiters.at(-1) !== '{') throw new Error('CSS contains an unmatched closing brace.')
      delimiters.pop()
      blockKinds.pop()
      output += char
      segmentStart = output.length
      i++
      continue
    }

    if (char === '(' || char === '[') {
      delimiters.push(char)
      output += char
      i++
      continue
    }

    if (char === ')' || char === ']') {
      const expected = char === ')' ? '(' : '['
      if (delimiters.at(-1) !== expected) throw new Error(`CSS contains an unmatched closing ${char}.`)
      delimiters.pop()
      output += char
      i++
      continue
    }

    if (char === ':' && blockKinds.length > 0 && blockKinds.at(-1) === false) {
      const property = output.slice(segmentStart).trim()
      if (CUSTOM_PROPERTY_NAME.test(property)) {
        output += char
        customValue = true
        customNesting = []
        i++
        continue
      }
    }

    if (char === ';') {
      let nextNonWhitespace = i + 1
      while (nextNonWhitespace < code.length && /\s/.test(code[nextNonWhitespace])) nextNonWhitespace++
      if (code[nextNonWhitespace] === '}') {
        segmentStart = output.length
        i++
        continue
      }
    }

    output += char
    if (char === ';') segmentStart = output.length
    i++
  }

  if (quote) throw new Error('CSS contains an unterminated string.')
  if (customNesting.length > 0) throw new Error('CSS contains an unterminated delimiter in a custom property value.')
  if (delimiters.length > 0) throw new Error('CSS contains an unterminated block, bracket, or parenthesis.')
  return output.trim()
}

export function minifyCSS(code: string): string {
  return minifyCSSSafely(code)
}

export function run(input: string, options: ToolOptions = {}): string {
  if (Object.keys(options).length > 0) throw new Error(`Unknown CSS minifier option: ${Object.keys(options)[0]}.`)
  return minifyCSSSafely(input)
}
