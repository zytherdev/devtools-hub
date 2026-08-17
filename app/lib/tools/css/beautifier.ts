/* eslint-disable @typescript-eslint/no-unused-vars */
export interface CSSBeautifyOptions {
  indentSize: number
  indentChar: ' ' | '\t'
  preserveNewlines: boolean
  maxPreserveNewlines: number
  endWithNewline: boolean
  spaceBeforeBrace: boolean
  spaceAfterSelector: boolean
  spaceAfterProperty: boolean
  spaceAfterColon: boolean
  newlineBeforeClose: boolean
  newlineAfterRules: boolean
}

export const defaultCSSOptions: CSSBeautifyOptions = {
  indentSize: 2,
  indentChar: ' ',
  preserveNewlines: true,
  maxPreserveNewlines: 2,
  endWithNewline: false,
  spaceBeforeBrace: true,
  spaceAfterSelector: true,
  spaceAfterProperty: true,
  spaceAfterColon: true,
  newlineBeforeClose: false,
  newlineAfterRules: true,
}

type CSSNode =
  | CSSRuleNode
  | CSSAtRuleNode
  | CSSCommentNode

interface CSSRuleNode {
  type: 'rule'
  selector: string
  body: CSSDeclarationNode[]
}

interface CSSAtRuleNode {
  type: 'at-rule'
  name: string
  prelude: string
  body?: CSSNode[]
  declarations?: CSSDeclarationNode[]
}

interface CSSCommentNode {
  type: 'comment'
  value: string
}

interface CSSDeclarationNode {
  type: 'declaration'
  property: string
  value: string
  important: boolean
}

interface CSSParser {
  code: string
  position: number
  length: number
}

export function beautifyCSS(
  code: string,
  options: Partial<CSSBeautifyOptions> = {},
): string {
  if (typeof code !== 'string' || !code.trim()) {
    return ''
  }

  const opts = {
    ...defaultCSSOptions,
    ...options,
  }

  const parser: CSSParser = {
    code,
    position: 0,
    length: code.length,
  }

  const ast = parseStylesheet(parser)

  let result = formatNodes(ast, opts, 0)

  result = result.trim()

  if (opts.endWithNewline && result.length > 0) {
    result += '\n'
  }

  return result
}

function parseStylesheet(parser: CSSParser): CSSNode[] {
  return parseBlock(parser, false)
}

function parseBlock(
  parser: CSSParser,
  insideAtRule: boolean
): CSSNode[] {
  const nodes: CSSNode[] = []

  while (!isEOF(parser)) {
    skipWhitespace(parser)

    if (isEOF(parser)) {
      break
    }

    if (startsWith(parser, '/*')) {
      nodes.push(parseComment(parser))
      continue
    }

    if (currentChar(parser) === '}') {
      break
    }

    const start = parser.position

    const header = readUntilTopLevel(parser, ['{', ';', '}'])

    if (!header.trim()) {
      if (currentChar(parser) === ';') {
        parser.position++
      } else {
        parser.position++
      }

      continue
    }

    const normalizedHeader = normalizeWhitespace(header)

    if (currentChar(parser) === ';') {
      parser.position++

      if (normalizedHeader.startsWith('@')) {
        nodes.push(parseAtRuleWithoutBody(normalizedHeader))
      }

      continue
    }

    if (currentChar(parser) === '}') {
      parser.position++
      continue
    }

    if (currentChar(parser) !== '{') {
      if (parser.position === start) {
        parser.position++
      }
      continue
    }

    parser.position++

    if (normalizedHeader.startsWith('@')) {
      nodes.push(parseAtRule(parser, normalizedHeader))
    } else {
      nodes.push(parseRule(parser, normalizedHeader))
    }
  }

  return nodes
}

function parseRule(
  parser: CSSParser,
  selector: string,
): CSSRuleNode {
  const body = parseDeclarations(parser)

  consumeClosingBrace(parser)

  return {
    type: 'rule',
    selector: normalizeSelector(selector),
    body,
  }
}

function parseAtRule(
  parser: CSSParser,
  header: string,
): CSSAtRuleNode {
  const { name, prelude } = splitAtRule(header)

  const bodyStart = parser.position

  const content = readBalancedBlock(parser)

  const bodyParser: CSSParser = {
    code: content,
    position: 0,
    length: content.length,
  }

  const trimmedContent = content.trim()

  const isDeclarationAtRule =
    name === '@font-face' ||
    name === '@page' ||
    name === '@counter-style' ||
    name === '@property'

  if (isDeclarationAtRule) {
    return {
      type: 'at-rule',
      name,
      prelude,
      declarations: parseDeclarations(bodyParser),
    }
  }

  const nestedNodes = parseBlock(bodyParser, true)

  if (
    nestedNodes.length === 0 &&
    trimmedContent.length > 0
  ) {
    return {
      type: 'at-rule',
      name,
      prelude,
      declarations: parseDeclarations(bodyParser),
    }
  }

  parser.position = bodyStart + content.length

  return {
    type: 'at-rule',
    name,
    prelude,
    body: nestedNodes,
  }
}

function parseAtRuleWithoutBody(header: string): CSSAtRuleNode {
  const { name, prelude } = splitAtRule(header)

  return {
    type: 'at-rule',
    name,
    prelude,
  }
}

function parseDeclarations(
  parser: CSSParser,
): CSSDeclarationNode[] {
  const declarations: CSSDeclarationNode[] = []

  while (!isEOF(parser)) {
    skipWhitespace(parser)

    if (isEOF(parser) || currentChar(parser) === '}') {
      break
    }

    if (startsWith(parser, '/*')) {
      parseComment(parser)
      continue
    }

    const property = readUntilTopLevel(parser, [':', ';', '}'])

    const normalizedProperty = normalizeWhitespace(property)

    if (!normalizedProperty) {
      if (currentChar(parser) === ';') {
        parser.position++
      }
      continue
    }

    if (currentChar(parser) !== ':') {
      if (currentChar(parser) === ';') {
        parser.position++
      } else if (currentChar(parser) === '}') {
        break
      }

      continue
    }

    parser.position++

    const value = readUntilTopLevel(parser, [';', '}'])

    const normalizedValue = normalizeValue(value)

    if (normalizedValue) {
      declarations.push({
        type: 'declaration',
        property: normalizedProperty,
        value: normalizedValue.replace(
          /\s*!important$/i,
          '',
        ).trim(),
        important: /\s*!important$/i.test(normalizedValue),
      })
    }

    if (currentChar(parser) === ';') {
      parser.position++
    }
  }

  return declarations
}

// helpers
function readUntilTopLevel(
  parser: CSSParser,
  terminators: string[],
): string {
  let result = ''

  let quote: '"' | "'" | null = null
  let escaped = false

  let parentheses = 0
  let brackets = 0

  while (!isEOF(parser)) {
    const char = currentChar(parser)

    if (quote) {
      result += char

      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === quote) {
        quote = null
      }

      parser.position++
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      result += char
      parser.position++
      continue
    }

    if (startsWith(parser, '/*')) {
      result += readCommentRaw(parser)
      continue
    }

    if (char === '(') {
      parentheses++
      result += char
      parser.position++
      continue
    }

    if (char === ')') {
      parentheses = Math.max(0, parentheses - 1)
      result += char
      parser.position++
      continue
    }

    if (char === '[') {
      brackets++
      result += char
      parser.position++
      continue
    }

    if (char === ']') {
      brackets = Math.max(0, brackets - 1)
      result += char
      parser.position++
      continue
    }

    if (
      parentheses === 0 &&
      brackets === 0 &&
      terminators.includes(char)
    ) {
      break
    }

    result += char
    parser.position++
  }

  return result
}

function readBalancedBlock(parser: CSSParser): string {
  let result = ''

  let depth = 1

  let quote: '"' | "'" | null = null
  let escaped = false

  while (!isEOF(parser) && depth > 0) {
    const char = currentChar(parser)

    if (quote) {
      result += char

      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === quote) {
        quote = null
      }

      parser.position++
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      result += char
      parser.position++
      continue
    }

    if (startsWith(parser, '/*')) {
      result += readCommentRaw(parser)
      continue
    }

    if (char === '{') {
      depth++
      result += char
      parser.position++
      continue
    }

    if (char === '}') {
      depth--

      if (depth > 0) {
        result += char
      }

      parser.position++
      continue
    }

    result += char
    parser.position++
  }

  return result
}

function readCommentRaw(parser: CSSParser): string {
  let result = ''

  if (!startsWith(parser, '/*')) {
    return result
  }

  result += '/*'
  parser.position += 2

  while (!isEOF(parser)) {
    if (startsWith(parser, '*/')) {
      result += '*/'
      parser.position += 2
      break
    }

    result += currentChar(parser)
    parser.position++
  }

  return result
}

function parseComment(parser: CSSParser): CSSCommentNode {
  return {
    type: 'comment',
    value: readCommentRaw(parser).trim(),
  }
}

function consumeClosingBrace(parser: CSSParser): void {
  skipWhitespace(parser)

  if (currentChar(parser) === '}') {
    parser.position++
  }
}

function formatNodes(
  nodes: CSSNode[],
  opts: CSSBeautifyOptions,
  level: number,
): string {
  const parts: string[] = []

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]

    if (node.type === 'comment') {
      parts.push(formatComment(node, opts, level))
      continue
    }

    if (node.type === 'rule') {
      parts.push(formatRule(node, opts, level))
      continue
    }

    if (node.type === 'at-rule') {
      parts.push(formatAtRule(node, opts, level))
    }
  }

  const separator = opts.newlineAfterRules ? '\n\n' : '\n'

  return parts
    .filter(Boolean)
    .join(separator)
}

function formatRule(
  node: CSSRuleNode,
  opts: CSSBeautifyOptions,
  level: number,
): string {
  const indent = getIndent(level, opts)
  const bodyIndent = getIndent(level + 1, opts)

  const selector = formatSelector(node.selector)

  let result =
    indent +
    selector +
    (opts.spaceBeforeBrace ? ' ' : '') +
    '{'

  if (node.body.length === 0) {
    return result + '}'
  }

  result += '\n'

  for (let i = 0; i < node.body.length; i++) {
    const declaration = node.body[i]

    result +=
      bodyIndent +
      formatDeclaration(declaration, opts)

    if (i < node.body.length - 1) {
      result += '\n'
    }
  }

  result += '\n'

  if (opts.newlineBeforeClose) {
    result += '\n'
  }

  result += indent + '}'

  return result
}

function formatAtRule(
  node: CSSAtRuleNode,
  opts: CSSBeautifyOptions,
  level: number,
): string {
  const indent = getIndent(level, opts)

  const header =
    node.name +
    (node.prelude ? ` ${formatAtRulePrelude(node.prelude)}` : '')

  if (!node.body && !node.declarations) {
    return indent + header + ';'
  }

  let result =
    indent +
    header +
    (opts.spaceBeforeBrace ? ' ' : '') +
    '{'

  if (node.declarations) {
    if (node.declarations.length === 0) {
      return result + '}'
    }

    result += '\n'

    const declarationIndent = getIndent(level + 1, opts)

    for (let i = 0; i < node.declarations.length; i++) {
      result +=
        declarationIndent +
        formatDeclaration(
          node.declarations[i],
          opts,
        )

      if (i < node.declarations.length - 1) {
        result += '\n'
      }
    }

    result += '\n' + indent + '}'

    return result
  }

  if (!node.body || node.body.length === 0) {
    return result + '}'
  }

  result += '\n'
  result += formatNodes(node.body, opts, level + 1)
  result += '\n' + indent + '}'

  return result
}

function formatDeclaration(
  declaration: CSSDeclarationNode,
  opts: CSSBeautifyOptions,
): string {
  const property = declaration.property
  const value = declaration.value

  const propertySpacing = opts.spaceAfterProperty ? '' : ''

  const colonSpacing = opts.spaceAfterColon ? ' ' : ''

  const important = declaration.important
    ? ' !important'
    : ''

  return (
    property +
    propertySpacing +
    ':' +
    colonSpacing +
    value +
    important +
    ';'
  )
}

function formatComment(
  node: CSSCommentNode,
  opts: CSSBeautifyOptions,
  level: number,
): string {
  const indent = getIndent(level, opts)

  const lines = node.value.split(/\r?\n/)

  if (lines.length === 1) {
    return indent + node.value
  }

  return lines
    .map((line) => indent + line.trim())
    .join('\n')
}

function formatSelector(selector: string): string {
  return selector
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ',\n')
    .trim()
}

function formatAtRulePrelude(prelude: string): string {
  return normalizeWhitespace(prelude)
}

function normalizeWhitespace(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t\n]+/g, ' ')
    .trim()
}

function normalizeSelector(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t\n]+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .trim()
}

function normalizeValue(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t\n]+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim()
}

function splitAtRule(header: string): {
  name: string
  prelude: string
} {
  const match = header.match(/^(@[a-zA-Z-]+)(?:\s+([\s\S]*))?$/)

  if (!match) {
    return {
      name: header,
      prelude: '',
    }
  }

  return {
    name: match[1],
    prelude: match[2]?.trim() ?? '',
  }
}

// utils
function currentChar(parser: CSSParser): string {
  return parser.code[parser.position] ?? ''
}

function startsWith(
  parser: CSSParser,
  value: string,
): boolean {
  return parser.code.startsWith(
    value,
    parser.position,
  )
}

function isEOF(parser: CSSParser): boolean {
  return parser.position >= parser.length
}

function skipWhitespace(parser: CSSParser): void {
  while (!isEOF(parser)) {
    const char = currentChar(parser)

    if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
      parser.position++
      continue
    }

    break
  }
}

function getIndent(
  level: number,
  opts: CSSBeautifyOptions,
): string {
  if (level <= 0) {
    return ''
  }

  if (opts.indentChar === '\t') {
    return '\t'.repeat(level)
  }

  return ' '.repeat(opts.indentSize * level)
}