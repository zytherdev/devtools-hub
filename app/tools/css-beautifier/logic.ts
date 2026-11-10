import * as prettier from 'prettier/standalone'
import * as postcssPlugin from 'prettier/plugins/postcss'

export interface CSSBeautifyOptions {
  indentSize: number
  indentChar: ' ' | '\t'
  endWithNewline: boolean
}

export const defaultCSSOptions: CSSBeautifyOptions = { indentSize: 2, indentChar: ' ', endWithNewline: false }

export async function beautifyCSS(code: string, options: Partial<CSSBeautifyOptions> = {}): Promise<string> {
  if (typeof code !== 'string' || !code.trim()) throw new Error('Paste CSS code to format.')
  if (code.length > 1_000_000) throw new Error('CSS input is limited to 1,000,000 characters.')
  const settings = { ...defaultCSSOptions, ...options }
  return prettier.format(code, {
    parser: 'css', plugins: [postcssPlugin],
    tabWidth: Math.max(1, Math.min(8, settings.indentSize)),
    useTabs: settings.indentChar === '\t', endOfLine: 'lf',
  })
}
