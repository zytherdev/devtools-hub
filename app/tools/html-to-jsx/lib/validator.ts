import { MAX_HTML_INPUT_LENGTH } from './constants'
import { tokenizeHTML } from './lexer'
import { getHTMLTokenValidationError } from './parser'

export function isValidHTML(html: string): boolean {
  if (typeof html !== 'string' || !html.trim() || html.length > MAX_HTML_INPUT_LENGTH) return false
  try {
    return getHTMLTokenValidationError(tokenizeHTML(html)) === null
  } catch {
    return false
  }
}
