import * as prettier from 'prettier/standalone'
import * as babelPlugin from 'prettier/plugins/babel'
import * as typescriptPlugin from 'prettier/plugins/typescript'
import * as estreePlugin from 'prettier/plugins/estree'

export interface JSBeautifyOptions { indentSize: number; indentChar: ' ' | '\t'; wrapLineLength: number }
export const defaultJSOptions: JSBeautifyOptions = { indentSize: 2, indentChar: ' ', wrapLineLength: 100 }

export async function beautifyJS(code: string, options: Partial<JSBeautifyOptions> = {}): Promise<string> {
  if (typeof code !== 'string' || !code.trim()) throw new Error('Paste JavaScript or TypeScript code to format.')
  if (code.length > 1_000_000) throw new Error('Source input is limited to 1,000,000 characters.')
  const settings = { ...defaultJSOptions, ...options }
  const isTypeScript = /(^|\n)\s*(interface|type|enum|namespace)\s+[A-Za-z_$]/.test(code) || /\b(?:const|let|var|function)\s+[A-Za-z_$][\w$]*\s*:\s*(?:string|number|boolean|unknown|any|[A-Z][A-Za-z0-9_$]*(?:<|\[|\s|;|=))/.test(code)
  return prettier.format(code, {
    parser: isTypeScript ? 'typescript' : 'babel', filepath: isTypeScript ? 'source.tsx' : 'source.jsx',
    plugins: [babelPlugin, typescriptPlugin, estreePlugin],
    tabWidth: Math.max(1, Math.min(8, settings.indentSize)), useTabs: settings.indentChar === '\t',
    printWidth: Math.max(40, Math.min(160, settings.wrapLineLength)), singleQuote: true, semi: true, endOfLine: 'lf',
  })
}
