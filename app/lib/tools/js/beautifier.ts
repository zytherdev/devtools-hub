
export interface JSBeautifyOptions {
  indentSize: number
  indentChar: ' ' | '\t'
  preserveNewlines: boolean
  maxPreserveNewlines: number
  endWithNewline: boolean
  spaceBeforeConditional: boolean
  spaceBeforeFunctionParen: boolean
  spaceBeforeAsyncArrow: boolean
  jslintHappy: boolean
  braceStyle: 'collapse' | 'expand' | 'end-expand' | 'none'
  breakChainedMethods: boolean
  e4x: boolean
  unescapeStrings: boolean
  wrapLineLength: number
}

export const defaultJSOptions: JSBeautifyOptions = {
  indentSize: 2,
  indentChar: ' ',
  preserveNewlines: true,
  maxPreserveNewlines: 2,
  endWithNewline: false,
  spaceBeforeConditional: true,
  spaceBeforeFunctionParen: false,
  spaceBeforeAsyncArrow: true,
  jslintHappy: false,
  braceStyle: 'collapse',
  breakChainedMethods: false,
  e4x: false,
  unescapeStrings: false,
  wrapLineLength: 80,
}

type TokenType =
  | 'keyword'
  | 'identifier'
  | 'number'
  | 'string'
  | 'template'
  | 'regex'
  | 'comment-line'
  | 'comment-block'
  | 'operator'
  | 'brace-open'
  | 'brace-close'
  | 'paren-open'
  | 'paren-close'
  | 'bracket-open'
  | 'bracket-close'
  | 'semicolon'
  | 'comma'
  | 'dot'
  | 'optional-chain'
  | 'colon'
  | 'question'
  | 'newline'
  | 'eof'

interface Token {
  type: TokenType
  value: string
  line: number
  column: number
}

type ContextType = 'block' | 'object' | 'array' | 'paren' | 'template'

interface Context {
  type: ContextType
  indent: number
}

const KEYWORDS = new Set([
  'as', 'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue',
  'debugger', 'default', 'delete', 'do', 'else', 'export', 'extends', 'finally',
  'for', 'from', 'function', 'get', 'if', 'implements', 'import', 'in', 'instanceof',
  'interface', 'let', 'new', 'of', 'package', 'private', 'protected', 'public',
  'return', 'set', 'static', 'super', 'switch', 'this', 'throw', 'try', 'typeof',
  'var', 'void', 'while', 'with', 'yield', 'enum', 'namespace', 'module', 'declare',
  'readonly', 'abstract', 'type', 'keyof', 'infer', 'is', 'satisfies',
])

const OPERATORS = [
  '>>>=',
  '===', '!==', '**=', '&&=', '||=', '??=', '>>>',
  '<<=', '>>=', '...', '=>', '==', '!=', '<=', '>=',
  '++', '--', '&&', '||', '??', '?.', '**', '+=', '-=',
  '*=', '/=', '%=', '&=', '|=', '^=', '<<', '>>', '?.[',
  '=', '+', '-', '*', '/', '%', '&', '|', '^', '!', '~',
  '<', '>', '?',
]

const PUNCTUATION: Record<string, TokenType> = {
  '{': 'brace-open',
  '}': 'brace-close',
  '(': 'paren-open',
  ')': 'paren-close',
  '[': 'bracket-open',
  ']': 'bracket-close',
  ';': 'semicolon',
  ',': 'comma',
  '.': 'dot',
  ':': 'colon',
  '?': 'question',
}

export function beautifyJS(
  code: string,
  options: Partial<JSBeautifyOptions> = {},
): string {
  if (typeof code !== 'string' || code.length === 0) return ''

  const opts = { ...defaultJSOptions, ...options }
  const tokens = tokenizeJS(code)
  let result = formatTokens(tokens, opts)

  result = result.trim()

  if (opts.endWithNewline && result.length > 0) {
    result += '\n'
  }

  return result
}

export function tokenizeJS(code: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  let line = 1
  let column = 0

  const push = (type: TokenType, value: string, startLine = line, startColumn = column) => {
    tokens.push({ type, value, line: startLine, column: startColumn })
  }

  const advance = (count = 1) => {
    for (let n = 0; n < count; n++) {
      if (code[i] === '\n') {
        line++
        column = 0
      } else {
        column++
      }
      i++
    }
  }

  const flushWord = (startLine: number, startColumn: number, start: number) => {
    if (start === i) return
    const value = code.slice(start, i)
    if (/^(?:0[xX][\da-fA-F]+|0[bB][01]+|0[oO][0-7]+|(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?n?)$/.test(value)) {
      push('number', value, startLine, startColumn)
    } else if (KEYWORDS.has(value)) {
      push('keyword', value, startLine, startColumn)
    } else {
      push('identifier', value, startLine, startColumn)
    }
  }

  while (i < code.length) {
    const char = code[i]

    if (char === ' ' || char === '\t' || char === '\f' || char === '\v') {
      advance()
      continue
    }

    if (char === '\r' || char === '\n') {
      const startLine = line
      const startColumn = column

      if (char === '\r' && code[i + 1] === '\n') {
        advance(2)
      } else {
        advance()
      }

      push('newline', '\n', startLine, startColumn)
      continue
    }

    const startLine = line
    const startColumn = column

    // ln comment
    if (char === '/' && code[i + 1] === '/') {
      let end = i + 2
      while (end < code.length && code[end] !== '\n' && code[end] !== '\r') end++
      const value = code.slice(i, end)
      advance(end - i)
      push('comment-line', value, startLine, startColumn)
      continue
    }

    // blck comment
    if (char === '/' && code[i + 1] === '*') {
      let end = i + 2
      while (end < code.length && !(code[end] === '*' && code[end + 1] === '/')) end++
      if (end < code.length) end += 2

      const value = code.slice(i, end)
      advance(end - i)
      push('comment-block', value, startLine, startColumn)
      continue
    }

    // quoted strs
    if (char === '"' || char === "'") {
      const quote = char
      let end = i + 1

      while (end < code.length) {
        if (code[end] === '\\') {
          end += 2
          continue
        }
        if (code[end] === quote) {
          end++
          break
        }
        end++
      }

      const value = code.slice(i, end)
      advance(end - i)
      push('string', value, startLine, startColumn)
      continue
    }

    if (char === '`') {
      let end = i + 1

      while (end < code.length) {
        if (code[end] === '\\') {
          end += 2
          continue
        }
        if (code[end] === '`') {
          end++
          break
        }
        end++
      }

      const value = code.slice(i, end)
      advance(end - i)
      push('template', value, startLine, startColumn)
      continue
    }

    if (/[A-Za-z_$\u0080-\uFFFF]/.test(char)) {
      const start = i
      advance()

      while (i < code.length && /[\w$\u0080-\uFFFF]/.test(code[i])) {
        advance()
      }

      flushWord(startLine, startColumn, start)
      continue
    }

    if (/\d/.test(char) || (char === '.' && /\d/.test(code[i + 1] ?? ''))) {
      const start = i

      if (char === '0' && /[xXbBoO]/.test(code[i + 1] ?? '')) {
        advance(2)
        while (i < code.length && /[\da-fA-F_]/.test(code[i])) advance()
      } else {
        while (i < code.length && /[\d_]/.test(code[i])) advance()

        if (code[i] === '.') {
          advance()
          while (i < code.length && /[\d_]/.test(code[i])) advance()
        }

        if (code[i] === 'e' || code[i] === 'E') {
          advance()
          if (code[i] === '+' || code[i] === '-') advance()
          while (i < code.length && /[\d_]/.test(code[i])) advance()
        }

        if (code[i] === 'n') advance()
      }

      push('number', code.slice(start, i), startLine, startColumn)
      continue
    }

    if (char === '/' && code[i + 1] !== '/' && code[i + 1] !== '*') {
      const previous = tokens[tokens.length - 1]
      if (canStartRegex(previous)) {
        let end = i + 1
        let inClass = false

        while (end < code.length) {
          const current = code[end]

          if (current === '\\') {
            end += 2
            continue
          }

          if (current === '[') inClass = true
          if (current === ']') inClass = false

          if (current === '/' && !inClass) {
            end++
            while (end < code.length && /[a-z]/i.test(code[end])) end++
            break
          }

          if (current === '\n' || current === '\r') break
          end++
        }

        if (end > i + 1 && code[end - 1] !== '\n' && code[end - 1] !== '\r') {
          const value = code.slice(i, end)
          advance(end - i)
          push('regex', value, startLine, startColumn)
          continue
        }
      }
    }

    if (code.startsWith('?.', i)) {
      advance(2)
      push('optional-chain', '?.', startLine, startColumn)
      continue
    }

    if (code.startsWith('?.[', i)) {
      advance(3)
      push('optional-chain', '?.[', startLine, startColumn)
      continue
    }

    let matchedOperator: string | undefined

    for (const operator of OPERATORS) {
      if (code.startsWith(operator, i)) {
        matchedOperator = operator
        break
      }
    }

    if (matchedOperator) {
      advance(matchedOperator.length)
      push('operator', matchedOperator, startLine, startColumn)
      continue
    }

    const punctuationType = PUNCTUATION[char]
    if (punctuationType) {
      advance()
      push(punctuationType, char, startLine, startColumn)
      continue
    }

    advance()
    push('operator', char, startLine, startColumn)
  }

  tokens.push({ type: 'eof', value: '', line, column })
  return tokens
}

function canStartRegex(previous?: Token): boolean {
  if (!previous) return true

  if (
    previous.type === 'identifier' ||
    previous.type === 'number' ||
    previous.type === 'string' ||
    previous.type === 'template' ||
    previous.type === 'regex' ||
    previous.type === 'paren-close' ||
    previous.type === 'bracket-close'
  ) {
    return false
  }

  if (previous.type === 'keyword') {
    return ['return', 'throw', 'case', 'delete', 'void', 'typeof', 'yield', 'await', 'else', 'do'].includes(previous.value)
  }

  return true
}

function formatTokens(tokens: Token[], opts: JSBeautifyOptions): string {
  const output: string[] = []
  const stack: Context[] = []

  let indentLevel = 0
  let lineStart = true
  let pendingSpace = false
  let pendingBlankLines = 0
  let previous: Token | undefined

  const currentContext = () => stack[stack.length - 1]

  const isInside = (type: ContextType) =>
    stack.some(context => context.type === type)

  const write = (value: string, force = false) => {
    if (!value) return

    if (lineStart) {
      output.push(getIndent(indentLevel, opts))
      lineStart = false
    }

    if (pendingSpace && !force && output.length > 0) {
      const last = output[output.length - 1]
      if (last && !last.endsWith('\n') && !last.endsWith(' ')) {
        output.push(' ')
      }
    }

    pendingSpace = false
    output.push(value)
  }

  const space = () => {
    if (!lineStart) pendingSpace = true
  }

  const newline = (count = 1) => {
    while (output.length && output[output.length - 1] === ' ') {
      output.pop()
    }

    if (lineStart) return

    output.push('\n')
    lineStart = true
    pendingSpace = false

    if (count > 1) {
      pendingBlankLines = Math.min(
        count - 1,
        opts.preserveNewlines ? opts.maxPreserveNewlines : 0,
      )
    }
  }

  const flushBlankLines = () => {
    if (!lineStart || pendingBlankLines <= 0) return

    for (let i = 0; i < pendingBlankLines; i++) {
      output.push('\n')
    }

    pendingBlankLines = 0
  }

  const nextMeaningful = (index: number): Token | undefined => {
    for (let j = index + 1; j < tokens.length; j++) {
      if (tokens[j].type !== 'newline') return tokens[j]
    }
    return undefined
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.type === 'eof') break

    if (token.type === 'newline') {
      if (opts.preserveNewlines) {
        const next = nextMeaningful(i)
        if (
          previous &&
          next &&
          previous.type !== 'newline' &&
          previous.type !== 'comma' &&
          previous.type !== 'dot' &&
          previous.type !== 'optional-chain' &&
          previous.type !== 'operator'
        ) {
          newline(1)
        }
      }
      continue
    }

    flushBlankLines()

    switch (token.type) {
      case 'comment-line':
        if (!lineStart) space()
        write(token.value)
        newline()
        break

      case 'comment-block': {
        const lines = token.value.split(/\r?\n/)
        if (!lineStart) space()

        if (lines.length === 1) {
          write(token.value)
          if (nextMeaningful(i)?.type !== 'semicolon') newline()
        } else {
          for (let n = 0; n < lines.length; n++) {
            if (n > 0) newline()
            write(lines[n])
          }
          newline()
        }
        break
      }

      case 'brace-open': {
        const next = nextMeaningful(i)
        const isEmpty = next?.type === 'brace-close'
        const objectLike = isObjectBrace(tokens, i)

        if (opts.braceStyle === 'expand') {
          newline()
          write('{')
        } else if (!lineStart) {
          space()
          write('{')
        } else {
          write('{')
        }

        stack.push({
          type: objectLike ? 'object' : 'block',
          indent: indentLevel,
        })

        indentLevel++

        if (isEmpty) {
          // keep {} compact.
        } else {
          newline()
        }
        break
      }

      case 'brace-close': {
        const context = currentContext()

        if (context?.type === 'block' || context?.type === 'object') {
          indentLevel = Math.max(0, indentLevel - 1)

          if (!lineStart) newline()
          write('}')
          stack.pop()

          const next = nextMeaningful(i)

          if (
            next?.type === 'keyword' &&
            (next.value === 'else' || next.value === 'catch' || next.value === 'finally')
          ) {
            space()
          } else if (
            next &&
            next.type !== 'semicolon' &&
            next.type !== 'comma' &&
            next.type !== 'paren-close' &&
            next.type !== 'bracket-close'
          ) {
            newline()
          }
        } else {
          write('}')
        }
        break
      }

      case 'paren-open':
        if (
          previous &&
          previous.type === 'keyword' &&
          ['if', 'for', 'while', 'switch', 'catch', 'with'].includes(previous.value)
        ) {
          space()
        } else if (
          previous?.type === 'keyword' &&
          previous.value === 'function' &&
          opts.spaceBeforeFunctionParen
        ) {
          space()
        }

        write('(')
        stack.push({ type: 'paren', indent: indentLevel })
        break

      case 'paren-close':
        write(')')
        if (currentContext()?.type === 'paren') stack.pop()
        break

      case 'bracket-open':
        write('[')
        stack.push({ type: 'array', indent: indentLevel })
        break

      case 'bracket-close':
        write(']')
        if (currentContext()?.type === 'array') stack.pop()
        break

      case 'semicolon':
        write(';')

        if (!isInside('paren') && !isInside('array') && !isInside('object')) {
          newline()
        } else {
          space()
        }
        break

      case 'comma':
        write(',')
        if (isInside('object') || isInside('array')) {
          newline()
        } else {
          space()
        }
        break

      case 'colon':
        write(':')
        space()
        break

      case 'dot':
        write('.', true)
        break

      case 'optional-chain':
        write(token.value, true)
        break

      case 'question':
        if (opts.spaceBeforeConditional) space()
        write('?')
        space()
        break

      case 'operator':
        formatOperator(token.value, previous, write, space)
        break

      case 'keyword':
      case 'identifier':
      case 'number':
      case 'string':
      case 'template':
      case 'regex':
        formatWordLike(token, previous, write, space, opts)
        break
    }

    previous = token
  }

  while (output.length && (output[output.length - 1] === '\n' || output[output.length - 1] === ' ')) {
    output.pop()
  }

  return output.join('')
}

function formatWordLike(
  token: Token,
  previous: Token | undefined,
  write: (value: string, force?: boolean) => void,
  space: () => void,
  opts: JSBeautifyOptions,
) {
  const needsSpace =
    !!previous &&
    (
      previous.type === 'identifier' ||
      previous.type === 'keyword' ||
      previous.type === 'number' ||
      previous.type === 'string' ||
      previous.type === 'template' ||
      previous.type === 'regex' ||
      previous.type === 'paren-close' ||
      previous.type === 'bracket-close'
    )

  if (needsSpace) space()

  if (
    previous?.type === 'keyword' &&
    previous.value === 'async' &&
    token.type === 'identifier'
  ) {
    if (opts.spaceBeforeAsyncArrow) space()
  }

  write(token.value)
}

function formatOperator(
  operator: string,
  previous: Token | undefined,
  write: (value: string, force?: boolean) => void,
  space: () => void
) {
  const unary = operator === '!' || operator === '~' || operator === '++' || operator === '--'
  const sign =
    (operator === '+' || operator === '-') &&
    (!previous ||
      previous.type === 'operator' ||
      previous.type === 'paren-open' ||
      previous.type === 'bracket-open' ||
      previous.type === 'comma' ||
      previous.type === 'colon' ||
      previous.type === 'question')

  if (operator === '...') {
    write(operator, true)
    return
  }

  if (unary || sign) {
    write(operator, true)
    return
  }

  if (operator === '=>') {
    space()
    write('=>')
    space()
    return
  }

  if (operator === '?.') {
    write(operator, true)
    return
  }

  space()
  write(operator)
  space()
}

function isObjectBrace(tokens: Token[], index: number): boolean {
  const previous = previousMeaningful(tokens, index)

  if (!previous) return true

  if (
    previous.type === 'operator' &&
    ['=', '=>', '(', '[', ',', ':', 'return', '?', '&&', '||', '??'].includes(previous.value)
  ) {
    return true
  }

  if (previous.type === 'comma' || previous.type === 'colon') return true

  if (previous.type === 'keyword' && ['return', 'case', 'yield'].includes(previous.value)) {
    return true
  }

  return false
}

function previousMeaningful(tokens: Token[], index: number): Token | undefined {
  for (let i = index - 1; i >= 0; i--) {
    if (tokens[i].type !== 'newline') return tokens[i]
  }
  return undefined
}

function getIndent(level: number, opts: JSBeautifyOptions): string {
  if (level <= 0) return ''
  const unit = opts.indentChar === '\t'
    ? '\t'
    : ' '.repeat(Math.max(0, opts.indentSize))
  return unit.repeat(level)
}
