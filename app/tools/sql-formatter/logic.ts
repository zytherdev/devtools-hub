import type { ToolOptions } from '@/app/tools/types'

type TokenKind = 'word' | 'quoted' | 'comment' | 'comma' | 'semicolon' | 'open' | 'close' | 'dot' | 'operator' | 'symbol'
type Token = { kind: TokenKind; text: string }

const KEYWORDS = new Set([
  'ALL', 'AND', 'AS', 'ASC', 'BETWEEN', 'BY', 'CASE', 'CREATE', 'CROSS', 'DELETE', 'DESC', 'DISTINCT',
  'ELSE', 'END', 'EXISTS', 'FROM', 'FULL', 'GROUP', 'HAVING', 'INNER', 'INSERT', 'INTO', 'IS', 'JOIN',
  'LEFT', 'LIKE', 'LIMIT', 'NOT', 'NULL', 'OFFSET', 'ON', 'OR', 'ORDER', 'OUTER', 'RIGHT', 'SELECT',
  'SET', 'THEN', 'UNION', 'UPDATE', 'VALUES', 'WHEN', 'WHERE',
])

const CLAUSES: string[][] = [
  ['GROUP', 'BY'],
  ['ORDER', 'BY'],
  ['INSERT', 'INTO'],
  ['DELETE', 'FROM'],
  ['LEFT', 'OUTER', 'JOIN'],
  ['RIGHT', 'OUTER', 'JOIN'],
  ['FULL', 'OUTER', 'JOIN'],
  ['LEFT', 'JOIN'],
  ['RIGHT', 'JOIN'],
  ['INNER', 'JOIN'],
  ['FULL', 'JOIN'],
  ['CROSS', 'JOIN'],
  ['SELECT'], ['FROM'], ['WHERE'], ['HAVING'], ['LIMIT'], ['UPDATE'], ['JOIN'], ['ON'], ['SET'],
]

function tokenize(input: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < input.length) {
    const char = input[i]
    if (/\s/.test(char)) {
      i += 1
      continue
    }

    if (char === '-' && input[i + 1] === '-') {
      const start = i
      i += 2
      while (i < input.length && input[i] !== '\n' && input[i] !== '\r') i += 1
      tokens.push({ kind: 'comment', text: input.slice(start, i) })
      continue
    }

    if (char === '/' && input[i + 1] === '*') {
      const start = i
      const end = input.indexOf('*/', i + 2)
      if (end === -1) throw new Error('Unterminated block comment.')
      i = end + 2
      tokens.push({ kind: 'comment', text: input.slice(start, i) })
      continue
    }

    if (char === "'" || char === '"' || char === '`' || char === '[') {
      const start = i
      const closing = char === '[' ? ']' : char
      i += 1
      let closed = false
      while (i < input.length) {
        if (input[i] === closing) {
          if (input[i + 1] === closing) {
            i += 2
            continue
          }
          i += 1
          closed = true
          break
        }
        if (input[i] === '\\' && i + 1 < input.length) i += 2
        else i += 1
      }
      if (!closed) throw new Error('Unterminated quoted string or identifier.')
      tokens.push({ kind: 'quoted', text: input.slice(start, i) })
      continue
    }

    if (/[A-Za-z_$\u0080-\uFFFF0-9]/.test(char)) {
      const start = i++
      while (i < input.length && /[A-Za-z0-9_$\u0080-\uFFFF]/.test(input[i])) i += 1
      tokens.push({ kind: 'word', text: input.slice(start, i) })
      continue
    }

    if (char === ',') tokens.push({ kind: 'comma', text: char })
    else if (char === ';') tokens.push({ kind: 'semicolon', text: char })
    else if (char === '(') tokens.push({ kind: 'open', text: char })
    else if (char === ')') tokens.push({ kind: 'close', text: char })
    else if (char === '.') tokens.push({ kind: 'dot', text: char })
    else if ('=<>!+-*/%|&^~:'.includes(char)) {
      const start = i
      i += 1
      while (i < input.length && '=<>!+-*/%|&^~:'.includes(input[i])) i += 1
      tokens.push({ kind: 'operator', text: input.slice(start, i) })
      continue
    } else tokens.push({ kind: 'symbol', text: char })
    i += 1
  }

  return tokens
}

function normalizeOptions(options: ToolOptions): { keywordCase: 'upper' | 'lower' | 'preserve'; indent: number } {
  const allowed = new Set(['keywordCase', 'indent'])
  for (const key of Object.keys(options)) {
    if (!allowed.has(key)) throw new Error(`Unknown option: ${key}.`)
  }
  const keywordCase = options.keywordCase ?? 'upper'
  if (!['upper', 'lower', 'preserve'].includes(keywordCase)) {
    throw new Error('keywordCase must be upper, lower, or preserve.')
  }
  const indentOption = options.indent ?? '2'
  if (indentOption !== '2' && indentOption !== '4') throw new Error('indent must be 2 or 4 spaces.')
  return { keywordCase: keywordCase as 'upper' | 'lower' | 'preserve', indent: Number(indentOption) }
}

function clauseAt(tokens: Token[], index: number): string[] | null {
  for (const phrase of CLAUSES) {
    if (phrase.every((word, offset) => {
      const token = tokens[index + offset]
      return token?.kind === 'word' && token.text.toUpperCase() === word
    })) return phrase
  }
  return null
}

function renderKeyword(text: string, keywordCase: 'upper' | 'lower' | 'preserve'): string {
  if (!KEYWORDS.has(text.toUpperCase()) || keywordCase === 'preserve') return text
  return keywordCase === 'upper' ? text.toUpperCase() : text.toLowerCase()
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string') throw new Error('Input must be a string.')
  if (input.length > 100_000) throw new Error('SQL input must be 100,000 characters or fewer.')
  if (!input.trim()) throw new Error('Paste a SQL statement to format.')

  const { keywordCase, indent } = normalizeOptions(options)
  const tokens = tokenize(input)
  let output = ''
  let depth = 0
  let pendingIndent = 0
  let previous: Token | null = null

  const trimSpaces = () => { output = output.replace(/[ \t]+$/g, '') }
  const newline = (indentLevel = 0) => {
    trimSpaces()
    if (output && !output.endsWith('\n')) output += '\n'
    pendingIndent = Math.max(0, indentLevel)
  }
  const append = (text: string) => {
    if (output.endsWith('\n')) output += ' '.repeat(pendingIndent * indent)
    pendingIndent = 0
    output += text
  }
  const space = () => {
    if (output && !/[\s]$/.test(output)) output += ' '
  }

  for (let i = 0; i < tokens.length;) {
    const token = tokens[i]
    const phrase = token.kind === 'word' ? clauseAt(tokens, i) : null
    if (phrase) {
      if (output.trim()) newline(0)
      for (let part = 0; part < phrase.length; part += 1) {
        if (part > 0) space()
        append(renderKeyword(tokens[i + part].text, keywordCase))
      }
      previous = tokens[i + phrase.length - 1]
      i += phrase.length
      continue
    }

    if (token.kind === 'comma') {
      trimSpaces()
      append(',')
      newline(depth + 1)
    } else if (token.kind === 'semicolon') {
      trimSpaces()
      append(';')
      newline(0)
    } else if (token.kind === 'comment') {
      if (output && !/[\s(.[,]$/.test(output)) space()
      append(token.text)
      if (token.text.startsWith('--')) newline(0)
      else space()
    } else if (token.kind === 'operator') {
      space()
      append(token.text)
      space()
    } else if (token.kind === 'dot') {
      trimSpaces()
      append('.')
    } else if (token.kind === 'open') {
      if (previous?.kind === 'word' && ['IN', 'VALUES', 'FROM', 'AS', 'ON', 'WHERE', 'SELECT', 'EXISTS'].includes(previous.text.toUpperCase())) space()
      append('(')
      depth += 1
    } else if (token.kind === 'close') {
      trimSpaces()
      append(')')
      depth = Math.max(0, depth - 1)
    } else if (token.kind === 'word') {
      if (previous && previous.kind !== 'open' && previous.kind !== 'dot') space()
      append(renderKeyword(token.text, keywordCase))
    } else if (token.kind === 'quoted') {
      if (previous && previous.kind !== 'open' && previous.kind !== 'dot') space()
      append(token.text)
    } else {
      if (previous && previous.kind !== 'open' && previous.kind !== 'dot') space()
      append(token.text)
    }
    previous = token
    i += 1
  }

  return output.trim()
}
