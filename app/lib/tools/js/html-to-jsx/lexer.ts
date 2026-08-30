import {
  ATTRIBUTE_MAPPINGS,
  BOOLEAN_ATTRIBUTES,
  VOID_ELEMENTS,
} from './constants'

import type {
  HTMLAttribute,
  HTMLToken,
} from './ast'

export function tokenizeHTML(html: string): HTMLToken[] {
  const lexer = new HTMLLexer(html)

  return lexer.tokenize()
}

class HTMLLexer {
  private index = 0

  constructor(
    private readonly source: string,
  ) {}

  tokenize(): HTMLToken[] {
    const tokens: HTMLToken[] = []

    while (!this.eof()) {
      if (this.startsWith('<!--')) {
        const comment = this.readComment()

        if (comment) {
          tokens.push(comment)
        }

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
          continue
        }
      }

      const text = this.readText()

      if (text) {
        tokens.push({
          type: 'text',
          value: text,
        })
      }
    }

    return tokens
  }

  private readOpeningTag(): HTMLToken | null {
    const start = this.index

    this.advance()

    if (!this.isNameStart(this.current())) {
      this.index = start
      return null
    }

    const rawName = this.readName()
    const name = rawName.toLowerCase()

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

      if (attribute) {
        attributes.push(attribute)
      } else {
        // malformed input protection
        this.advance()
      }
    }

    return {
      type: 'open-tag',
      name,
      attributes,
      selfClosing:
        selfClosing || VOID_ELEMENTS.has(name),
    }
  }

  private readClosingTag(): HTMLToken {
    this.advance(2)

    const name = this.readName()

    this.skipUntil('>')

    if (this.current() === '>') {
      this.advance()
    }

    return {
      type: 'close-tag',
      name: name.toLowerCase(),
    }
  }

  private readAttribute(): HTMLAttribute | null {
    const rawName = this.readAttributeName()

    if (!rawName) {
      return null
    }

    const normalized = rawName.toLowerCase()

    const name =
      ATTRIBUTE_MAPPINGS[normalized] ??
      rawName

    this.skipWhitespace()

    if (this.current() !== '=') {
      return {
        name,
        value: true,
      }
    }

    this.advance()
    this.skipWhitespace()

    const value = this.readAttributeValue()

    if (
      BOOLEAN_ATTRIBUTES.has(normalized) &&
      value === ''
    ) {
      return {
        name,
        value: true,
      }
    }

    return {
      name,
      value,
    }
  }

  private readAttributeName(): string {
    const start = this.index

    while (!this.eof()) {
      const char = this.current()

      if (
        this.isWhitespace(char) ||
        char === '=' ||
        char === '>' ||
        char === '/'
      ) {
        break
      }

      this.advance()
    }

    return this.source.slice(start, this.index)
  }

  private readAttributeValue(): string {
    const quote = this.current()

    if (quote === '"' || quote === "'") {
      this.advance()

      const start = this.index

      while (
        !this.eof() &&
        this.current() !== quote
      ) {
        this.advance()
      }

      const value = this.source.slice(
        start,
        this.index,
      )

      if (this.current() === quote) {
        this.advance()
      }

      return value
    }

    const start = this.index

    while (!this.eof()) {
      const char = this.current()

      if (
        this.isWhitespace(char) ||
        char === '>' ||
        char === '/'
      ) {
        break
      }

      this.advance()
    }

    return this.source.slice(
      start,
      this.index,
    )
  }

  private readComment(): HTMLToken {
    this.advance(4)

    const start = this.index

    const end = this.source.indexOf(
      '-->',
      this.index,
    )

    if (end === -1) {
      this.index = this.source.length

      return {
        type: 'comment',
        value: this.source.slice(start),
      }
    }

    const value = this.source.slice(
      start,
      end,
    )

    this.index = end + 3

    return {
      type: 'comment',
      value,
    }
  }

  private readText(): string {
    const start = this.index

    while (
      !this.eof() &&
      this.current() !== '<'
    ) {
      this.advance()
    }

    return this.source.slice(
      start,
      this.index,
    )
  }

  private readName(): string {
    const start = this.index

    while (
      !this.eof() &&
      this.isNameCharacter(this.current())
    ) {
      this.advance()
    }

    return this.source.slice(
      start,
      this.index,
    )
  }

  private skipWhitespace(): void {
    while (
      !this.eof() &&
      this.isWhitespace(this.current())
    ) {
      this.advance()
    }
  }

  private skipUntil(char: string): void {
    while (
      !this.eof() &&
      this.current() !== char
    ) {
      this.advance()
    }
  }

  private startsWith(value: string): boolean {
    return this.source.startsWith(
      value,
      this.index,
    )
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