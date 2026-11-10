import {
  tokenizeHTML,
} from './lexer'

import {
  VOID_ELEMENTS,
} from './constants'

export function isValidHTML(
  html: string,
): boolean {
  if (
    typeof html !== 'string' ||
    !html.trim()
  ) {
    return false
  }

  try {
    const tokens =
      tokenizeHTML(html)

    const stack: string[] = []

    for (const token of tokens) {
      if (token.type === 'open-tag') {
        if (
          !token.selfClosing &&
          !VOID_ELEMENTS.has(token.name)
        ) {
          stack.push(token.name)
        }

        continue
      }

      if (token.type === 'close-tag') {
        const current =
          stack[stack.length - 1]

        if (current !== token.name) {
          return false
        }

        stack.pop()
      }
    }

    return stack.length === 0
  } catch {
    return false
  }
}