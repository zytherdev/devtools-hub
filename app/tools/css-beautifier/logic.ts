import * as prettier from 'prettier/standalone'
import * as postcssPlugin from 'prettier/plugins/postcss'
import type { ToolOptions } from '@/app/tools/types'

export interface CSSBeautifyOptions {
  indentSize: number
  indentChar: ' ' | '\t'
  printWidth: number
  endWithNewline: boolean
}

export interface CSSFormatterPreferences {
  indentSize: number
  indentChar: ' ' | '\t'
  wrapLineLength: number
}

export const MAX_CSS_INPUT_LENGTH = 100_000
export const defaultCSSOptions: CSSBeautifyOptions = {
  indentSize: 2,
  indentChar: ' ',
  printWidth: 100,
  endWithNewline: false,
}

const optionNames = new Set(['indentSize', 'indentChar', 'printWidth', 'wrapLineLength', 'endWithNewline'])

function validateFormattingOptions(options: Partial<CSSBeautifyOptions>): CSSBeautifyOptions {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('CSS formatting options must be an object.')
  }

  for (const key of Object.keys(options)) {
    if (!['indentSize', 'indentChar', 'printWidth', 'endWithNewline'].includes(key)) {
      throw new Error(`Unknown CSS formatting option: ${key}.`)
    }
  }

  const settings = { ...defaultCSSOptions, ...options }
  if (!Number.isInteger(settings.indentSize) || settings.indentSize < 1 || settings.indentSize > 8) {
    throw new Error('Indent size must be a whole number from 1 to 8.')
  }
  if (settings.indentChar !== ' ' && settings.indentChar !== '\t') {
    throw new Error('Indent character must be a space or a tab.')
  }
  if (!Number.isInteger(settings.printWidth) || settings.printWidth < 40 || settings.printWidth > 160) {
    throw new Error('Line width must be a whole number from 40 to 160.')
  }
  if (typeof settings.endWithNewline !== 'boolean') {
    throw new Error('End with newline must be true or false.')
  }
  return settings
}

export async function beautifyCSS(code: string, options: Partial<CSSBeautifyOptions> = {}): Promise<string> {
  if (typeof code !== 'string' || !code.trim()) throw new Error('Paste CSS code to format.')
  if (code.length > MAX_CSS_INPUT_LENGTH) {
    throw new Error(`CSS input is limited to ${MAX_CSS_INPUT_LENGTH.toLocaleString('en-US')} characters to keep formatting responsive.`)
  }

  const settings = validateFormattingOptions(options)
  const formatted = await prettier.format(code, {
    parser: 'css',
    plugins: [postcssPlugin],
    tabWidth: settings.indentSize,
    useTabs: settings.indentChar === '\t',
    printWidth: settings.printWidth,
    endOfLine: 'lf',
  })

  if (settings.endWithNewline) return formatted.endsWith('\n') ? formatted : `${formatted}\n`
  return formatted.endsWith('\n') ? formatted.slice(0, -1) : formatted
}

export function formatCSSWithPreferences(
  code: string,
  preferences: CSSFormatterPreferences,
  endWithNewline = defaultCSSOptions.endWithNewline,
): Promise<string> {
  return beautifyCSS(code, {
    indentSize: preferences.indentSize,
    indentChar: preferences.indentChar,
    printWidth: preferences.wrapLineLength,
    endWithNewline,
  })
}

function parseIntegerOption(value: string, label: string): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed)) throw new Error(`${label} must be a whole number.`)
  return parsed
}

export async function run(input: string, options: ToolOptions = {}): Promise<string> {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('CSS options must be provided as an object.')
  }

  for (const key of Object.keys(options)) {
    if (!optionNames.has(key)) throw new Error(`Unknown CSS option: ${key}.`)
  }
  if (Object.hasOwn(options, 'printWidth') && Object.hasOwn(options, 'wrapLineLength')) {
    throw new Error('Choose either printWidth or wrapLineLength, not both.')
  }

  const formattingOptions: Partial<CSSBeautifyOptions> = {}
  if (Object.hasOwn(options, 'indentSize')) formattingOptions.indentSize = parseIntegerOption(options.indentSize, 'Indent size')
  if (Object.hasOwn(options, 'indentChar')) formattingOptions.indentChar = options.indentChar as CSSBeautifyOptions['indentChar']
  if (Object.hasOwn(options, 'endWithNewline')) {
    if (options.endWithNewline !== 'true' && options.endWithNewline !== 'false') {
      throw new Error('End with newline must be "true" or "false".')
    }
    formattingOptions.endWithNewline = options.endWithNewline === 'true'
  }
  const widthOption = Object.hasOwn(options, 'printWidth') ? options.printWidth : options.wrapLineLength
  if (widthOption !== undefined) formattingOptions.printWidth = parseIntegerOption(widthOption, 'Line width')

  return beautifyCSS(input, formattingOptions)
}
