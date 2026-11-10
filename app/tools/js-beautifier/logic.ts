import * as prettier from 'prettier/standalone'
import * as babelPlugin from 'prettier/plugins/babel'
import * as typescriptPlugin from 'prettier/plugins/typescript'
import * as estreePlugin from 'prettier/plugins/estree'

export type JSSyntax = 'javascript' | 'jsx' | 'typescript' | 'tsx'
export interface JSBeautifyOptions {
  syntax: JSSyntax
  indentSize: number
  indentChar: ' ' | '\t'
  wrapLineLength: number
}

export const MAX_SOURCE_LENGTH = 100_000
export const defaultJSOptions: JSBeautifyOptions = {
  syntax: 'javascript',
  indentSize: 2,
  indentChar: ' ',
  wrapLineLength: 100,
}

const supportedSyntaxes: readonly JSSyntax[] = ['javascript', 'jsx', 'typescript', 'tsx']

export async function beautifyJS(code: string, options: Partial<JSBeautifyOptions> = {}): Promise<string> {
  if (typeof code !== 'string' || !code.trim()) {
    throw new Error('Paste JavaScript, JSX, TypeScript, or TSX code to format.')
  }
  if (code.length > MAX_SOURCE_LENGTH) {
    throw new Error(`Source input is limited to ${MAX_SOURCE_LENGTH.toLocaleString()} characters to keep formatting responsive.`)
  }
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('Formatting options must be an object.')
  }

  const allowedOptions = ['syntax', 'indentSize', 'indentChar', 'wrapLineLength']
  const unknownOptions = Object.keys(options).filter(key => !allowedOptions.includes(key))
  if (unknownOptions.length > 0) {
    throw new Error(`Unknown formatting option${unknownOptions.length === 1 ? '' : 's'}: ${unknownOptions.join(', ')}.`)
  }

  const settings = { ...defaultJSOptions, ...options }
  if (!supportedSyntaxes.includes(settings.syntax)) {
    throw new Error('Choose JavaScript, JSX, TypeScript, or TSX as the source syntax.')
  }
  if (!Number.isInteger(settings.indentSize) || settings.indentSize < 1 || settings.indentSize > 8) {
    throw new Error('Indent size must be a whole number from 1 to 8.')
  }
  if (settings.indentChar !== ' ' && settings.indentChar !== '\t') {
    throw new Error('Indent character must be spaces or tabs.')
  }
  if (!Number.isInteger(settings.wrapLineLength) || settings.wrapLineLength < 40 || settings.wrapLineLength > 160) {
    throw new Error('Line width must be a whole number from 40 to 160.')
  }

  const isTypeScript = settings.syntax === 'typescript' || settings.syntax === 'tsx'
  const filepath = settings.syntax === 'tsx'
    ? 'source.tsx'
    : settings.syntax === 'typescript'
      ? 'source.ts'
      : settings.syntax === 'jsx'
        ? 'source.jsx'
        : 'source.js'

  try {
    return await prettier.format(code, {
      parser: isTypeScript ? 'typescript' : 'babel',
      filepath,
      plugins: [babelPlugin, typescriptPlugin, estreePlugin],
      tabWidth: settings.indentSize,
      useTabs: settings.indentChar === '\t',
      printWidth: settings.wrapLineLength,
      singleQuote: true,
      semi: true,
      endOfLine: 'lf',
    })
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : 'Unknown parser error.'
    throw new Error(`Could not parse this ${settings.syntax.toUpperCase()} source: ${detail}`)
  }
}
