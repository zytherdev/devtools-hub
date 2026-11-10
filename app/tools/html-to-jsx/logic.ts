import { tool } from './definition'
import { tokenizeHTML } from './lib/lexer'
import { parseHTML, getHTMLTokenValidationError } from './lib/parser'
import { generateJSX, type JSXGeneratorOptions } from './lib/generator'
import { MAX_HTML_INPUT_LENGTH, MAX_JSX_OUTPUT_LENGTH } from './lib/constants'

export type HTMLToJSXOptions = JSXGeneratorOptions

export const defaultHTMLToJSXOptions: HTMLToJSXOptions = {
  preserveComments: false,
  preserveWhitespace: false,
  selfClosingTags: true,
  convertStyle: true,
  className: 'className',
  htmlFor: 'htmlFor',
  inlineStyle: true,
}

const BOOLEAN_OPTIONS = ['preserveComments', 'preserveWhitespace', 'selfClosingTags', 'convertStyle', 'inlineStyle'] as const
const OPTION_KEYS = new Set<string>([...BOOLEAN_OPTIONS, 'className', 'htmlFor'])

export function htmlToJSX(html: string, options: Partial<HTMLToJSXOptions> = {}): string {
  if (typeof html !== 'string') throw new TypeError('HTML input must be a string.')
  if (!html.trim()) return ''
  if (html.length > MAX_HTML_INPUT_LENGTH) {
    throw new Error(`HTML input exceeds the ${MAX_HTML_INPUT_LENGTH.toLocaleString()} character limit.`)
  }

  const config = normalizeOptions(options)
  const tokens = tokenizeHTML(html)
  const validationError = getHTMLTokenValidationError(tokens)
  if (validationError) throw new Error(validationError)

  const result = generateJSX(parseHTML(tokens), config)
  if (result.length > MAX_JSX_OUTPUT_LENGTH) {
    throw new Error(`JSX output exceeds the ${MAX_JSX_OUTPUT_LENGTH.toLocaleString()} character limit.`)
  }
  return result
}

function normalizeOptions(options: Partial<HTMLToJSXOptions>): HTMLToJSXOptions {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new TypeError('Conversion options must be an object.')
  }
  for (const key of Object.keys(options)) {
    if (!OPTION_KEYS.has(key)) throw new Error(`Unknown conversion option: ${key}.`)
  }
  for (const key of BOOLEAN_OPTIONS) {
    if (options[key] !== undefined && typeof options[key] !== 'boolean') {
      throw new Error(`Option "${key}" must be a boolean.`)
    }
  }
  if (options.className !== undefined && options.className !== 'class' && options.className !== 'className') {
    throw new Error('Option "className" must be "class" or "className".')
  }
  if (options.htmlFor !== undefined && options.htmlFor !== 'for' && options.htmlFor !== 'htmlFor') {
    throw new Error('Option "htmlFor" must be "for" or "htmlFor".')
  }
  return { ...defaultHTMLToJSXOptions, ...options }
}

export function run(input: string, options: Partial<HTMLToJSXOptions> = {}): string {
  return htmlToJSX(input, options)
}

export { tokenizeHTML } from './lib/lexer'
export { parseHTML } from './lib/parser'
export { generateJSX } from './lib/generator'
export { isValidHTML } from './lib/validator'
export { cssToObject } from './lib/css'
export type {
  HTMLDocument,
  HTMLNode,
  HTMLToken,
  HTMLAttribute,
  ElementNode,
  TextNode,
  CommentNode,
  AttributeValue,
} from './lib/ast'

export const sampleHTML = tool.exampleInput
