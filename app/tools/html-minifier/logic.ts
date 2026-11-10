import type { ToolOptions } from '@/app/tools/types'

export const MAX_INPUT_LENGTH = 1_000_000

const HTML_WHITESPACE = /[\t\n\f\r ]+/
const HTML_WHITESPACE_RUN = /[\t\n\f\r ]+/g
const RAW_TEXT_TAGS = new Set(['script', 'style', 'textarea', 'pre'])
const PRESERVED_COMMENT = /^<!--\s*(?:\[if\b|#|!|@(?:license|preserve)\b|license\b|spdx-license-identifier\b|google(?:off|on)\s*:|noindex\b|endnoindex\b)/i

function normalizeTag(raw: string): string {
  const match = raw.match(/^(<\/?[A-Za-z][A-Za-z0-9:._-]*)([\s\S]*)>$/)
  if (!match || raw.startsWith('<!') || raw.startsWith('<?')) return raw

  const [, name, tail] = match
  let result = name
  let quote: '"' | "'" | null = null
  let pendingSpace = false

  for (const char of tail) {
    if (quote) {
      result += char
      if (char === quote) quote = null
      continue
    }

    if (char === '"' || char === "'") {
      if (pendingSpace && result && !result.endsWith('=')) result += ' '
      pendingSpace = false
      quote = char
      result += char
      continue
    }

    if (HTML_WHITESPACE.test(char)) {
      pendingSpace = true
      continue
    }

    if (char === '=') {
      result = result.replace(/[\t\n\f\r ]+$/, '')
      pendingSpace = false
      result += char
      continue
    }

    if (pendingSpace && result && !result.endsWith('=')) result += ' '
    pendingSpace = false
    result += char
  }

  return `${result}>`
}

function findTagEnd(code: string, start: number): number {
  let quote: '"' | "'" | null = null

  for (let i = start + 1; i < code.length; i++) {
    const char = code[i]
    if (quote) {
      if (char === quote) quote = null
    } else if (char === '"' || char === "'") {
      quote = char
    } else if (char === '>') {
      return i
    }
  }

  return -1
}

function findRawTextClose(lowerCode: string, tagName: string, start: number): number {
  const prefix = `</${tagName}`
  let candidate = lowerCode.indexOf(prefix, start)

  while (candidate !== -1) {
    const boundary = lowerCode[candidate + prefix.length]
    if (boundary === undefined || /[\t\n\f\r />]/.test(boundary)) return candidate
    candidate = lowerCode.indexOf(prefix, candidate + prefix.length)
  }

  return -1
}

function isPreservedComment(comment: string): boolean {
  return PRESERVED_COMMENT.test(comment)
}

function asciiLowercase(code: string): string {
  return code.replace(/[A-Z]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 32))
}

export function minifyHTML(code: string): string {
  if (typeof code !== 'string') throw new Error('HTML input must be a string.')
  if (code.length > MAX_INPUT_LENGTH) {
    throw new Error(`HTML input must be ${MAX_INPUT_LENGTH.toLocaleString()} characters or fewer.`)
  }
  if (!code) return ''

  // Lower only ASCII tag letters so Unicode case mappings cannot shift source offsets.
  const lowerCode = asciiLowercase(code)
  const output: string[] = []
  let text = ''
  let rawTextTag: string | null = null
  let i = 0

  const flushText = () => {
    if (text) output.push(text.replace(HTML_WHITESPACE_RUN, ' '))
    text = ''
  }

  while (i < code.length) {
    if (rawTextTag) {
      const close = findRawTextClose(lowerCode, rawTextTag, i)
      if (close === -1) {
        flushText()
        output.push(code.slice(i))
        break
      }
      flushText()
      output.push(code.slice(i, close))
      i = close
      rawTextTag = null
      continue
    }

    if (code.startsWith('<!--', i)) {
      const end = code.indexOf('-->', i + 4)
      if (end === -1) {
        flushText()
        output.push(code.slice(i))
        break
      }
      const commentEnd = end + 3
      const comment = code.slice(i, commentEnd)
      if (isPreservedComment(comment)) {
        flushText()
        output.push(comment)
      }
      i = commentEnd
      continue
    }

    if (lowerCode.startsWith('<![cdata[', i)) {
      const end = lowerCode.indexOf(']]>', i + 9)
      flushText()
      if (end === -1) {
        output.push(code.slice(i))
        break
      }
      output.push(code.slice(i, end + 3))
      i = end + 3
      continue
    }

    if (code[i] === '<' && /[A-Za-z!?/]/.test(code[i + 1] ?? '')) {
      const end = findTagEnd(code, i)
      if (end === -1) {
        flushText()
        output.push(code.slice(i))
        break
      }

      const rawTag = code.slice(i, end + 1)
      const normalizedTag = normalizeTag(rawTag)
      flushText()
      output.push(normalizedTag)

      const rawMatch = rawTag.match(/^<(script|style|textarea|pre)(?=[\t\n\f\r />])/i)
      if (rawMatch && RAW_TEXT_TAGS.has(rawMatch[1].toLowerCase())) {
        rawTextTag = rawMatch[1].toLowerCase()
      }

      i = end + 1
      continue
    }

    text += code[i]
    i++
  }

  flushText()
  return output.join('')
}

export function run(input: string, options: ToolOptions = {}): string {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('HTML minifier options must be an object.')
  }
  const unsupported = Object.keys(options)
  if (unsupported.length > 0) {
    throw new Error(`Unsupported HTML minifier option: ${unsupported.join(', ')}.`)
  }
  return minifyHTML(input)
}
