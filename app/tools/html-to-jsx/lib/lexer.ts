import {
  ATTRIBUTE_MAPPINGS,
  BOOLEAN_ATTRIBUTES,
  VOID_ELEMENTS,
} from './constants'
import type {
  HTMLAttribute,
  HTMLToken,
} from './ast'

const RAW_TEXT_ELEMENTS = new Set(['script', 'style'])

export function tokenizeHTML(html: string): HTMLToken[] {
  const lexer = new HTMLLexer(html)
  return lexer.tokenize()
}

class HTMLLexer {
  private index = 0
  private readonly lowercaseSource: string

  constructor(private readonly source: string) {
    this.lowercaseSource = source.toLowerCase()
  }

  tokenize(): HTMLToken[] {
    const tokens: HTMLToken[] = []

    while (!this.eof()) {
      if (this.startsWith('<!--')) {
        tokens.push(this.readComment())
        continue
      }

      if (this.startsWith('</')) {
        tokens.push(this.readClosingTag())
        continue
      }

      if (this.current() === '<') {
        const tag = this.readOpeningTag()
        if (tag) {
          tokens.push(tag)
          if (tag.type === 'open-tag' && !tag.selfClosing && RAW_TEXT_ELEMENTS.has(tag.name)) {
            const text = this.readRawText(tag.name)
            if (text) tokens.push({ type: 'text', value: text })
          }
          continue
        }
      }

      const text = this.readText()
      if (text) {
        tokens.push({ type: 'text', value: text })
      } else if (this.current() === '<') {
        // Consume malformed '<' tokens so the lexer always makes progress.
        tokens.push({ type: 'text', value: '<' })
        this.advance()
      }
    }

    return tokens
  }

  private readOpeningTag(): Extract<HTMLToken, { type: 'open-tag' }> | null {
    const start = this.index
    this.advance()
    if (!this.isNameStart(this.current())) {
      this.index = start
      return null
    }

    const name = this.readName().toLowerCase()
    const attributes: HTMLAttribute[] = []
    let selfClosing = false

    while (!this.eof()) {
      this.skipWhitespace()
      if (this.startsWith('/>')) {
        this.advance(2)
        selfClosing = true
        break
      }
      if (this.current() === '>') {
        this.advance()
        break
      }

      const attribute = this.readAttribute()
      if (attribute) attributes.push(attribute)
      else this.advance()
    }

    return {
      type: 'open-tag',
      name,
      attributes,
      selfClosing: selfClosing || VOID_ELEMENTS.has(name),
    }
  }

  private readClosingTag(): HTMLToken {
    this.advance(2)
    const name = this.readName()
    this.skipUntil('>')
    if (this.current() === '>') this.advance()
    return { type: 'close-tag', name: name.toLowerCase() }
  }

  private readAttribute(): HTMLAttribute | null {
    const rawName = this.readAttributeName()
    if (!rawName) return null

    const normalized = rawName.toLowerCase()
    const name = ATTRIBUTE_MAPPINGS[normalized] ?? rawName
    this.skipWhitespace()
    if (this.current() !== '=') return { name, value: true }

    this.advance()
    this.skipWhitespace()
    const value = this.readAttributeValue()
    if (BOOLEAN_ATTRIBUTES.has(normalized) && value === '') {
      return { name, value: true }
    }
    return { name, value }
  }

  private readAttributeName(): string {
    const start = this.index
    while (!this.eof()) {
      const char = this.current()
      if (this.isWhitespace(char) || char === '=' || char === '>' || char === '/') break
      this.advance()
    }
    return this.source.slice(start, this.index)
  }

  private readAttributeValue(): string {
    const quote = this.current()
    if (quote === '"' || quote === "'") {
      this.advance()
      const start = this.index
      while (!this.eof() && this.current() !== quote) this.advance()
      const value = this.source.slice(start, this.index)
      if (this.current() === quote) this.advance()
      return value
    }

    const start = this.index
    while (!this.eof()) {
      const char = this.current()
      if (this.isWhitespace(char) || char === '>' || (char === '/' && this.source[this.index + 1] === '>')) break
      this.advance()
    }
    return this.source.slice(start, this.index)
  }

  private readComment(): HTMLToken {
    this.advance(4)
    const start = this.index
    const end = this.source.indexOf('-->', this.index)
    if (end === -1) {
      this.index = this.source.length
      return { type: 'comment', value: this.source.slice(start) }
    }
    const value = this.source.slice(start, end)
    this.index = end + 3
    return { type: 'comment', value }
  }

  private readRawText(tagName: string): string {
    const start = this.index
    const marker = `</${tagName}`
    let candidate = this.lowercaseSource.indexOf(marker, this.index)
    while (candidate !== -1) {
      const following = this.source[candidate + marker.length] ?? ''
      if (!following || this.isWhitespace(following) || following === '>' || following === '/') {
        this.index = candidate
        return this.source.slice(start, candidate)
      }
      candidate = this.lowercaseSource.indexOf(marker, candidate + marker.length)
    }
    this.index = this.source.length
    return this.source.slice(start)
  }

  private readText(): string {
    const start = this.index
    while (!this.eof() && this.current() !== '<') this.advance()
    return this.source.slice(start, this.index)
  }

  private readName(): string {
    const start = this.index
    while (!this.eof() && this.isNameCharacter(this.current())) this.advance()
    return this.source.slice(start, this.index)
  }

  private skipWhitespace(): void {
    while (!this.eof() && this.isWhitespace(this.current())) this.advance()
  }

  private skipUntil(char: string): void {
    while (!this.eof() && this.current() !== char) this.advance()
  }

  private startsWith(value: string): boolean {
    return this.source.startsWith(value, this.index)
  }

  private current(): string {
    return this.source[this.index] ?? ''
  }

  private advance(count = 1): void {
    this.index += count
  }

  private eof(): boolean {
    return this.index >= this.source.length
  }

  private isWhitespace(char: string): boolean {
    return /\s/.test(char)
  }

  private isNameStart(char: string): boolean {
    return /[A-Za-z]/.test(char)
  }

  private isNameCharacter(char: string): boolean {
    return /[A-Za-z0-9:_-]/.test(char)
  }
}
