import * as esprima from 'esprima'
import * as escodegen from 'escodegen'

type ASTWithErrors = { errors?: Array<{ description?: string; lineNumber?: number; column?: number }>; comments?: unknown[] }

export function minifyJS(code: string): string {
  if (typeof code !== 'string' || !code.trim()) throw new Error('Paste JavaScript code to minify.')
  if (code.length > 1_000_000) throw new Error('Source input is limited to 1,000,000 characters.')
  try {
    const options = { jsx: true, tokens: true, comment: true, tolerant: false, loc: true, range: true, attachComment: false }
    const moduleSyntax = /(^|\n)\s*(?:import(?:\s|\{)|export\s|export\{)/m.test(code)
    const ast = moduleSyntax ? esprima.parseModule(code, options) : esprima.parseScript(code, options)
    const parseErrors = (ast as unknown as ASTWithErrors).errors
    if (parseErrors?.length) {
      const issue = parseErrors[0]
      throw new Error(`${issue.description ?? 'Invalid syntax'}${issue.lineNumber ? ` at line ${issue.lineNumber}:${issue.column ?? 0}` : ''}`)
    }
    ;(ast as unknown as ASTWithErrors).comments = []
    return escodegen.generate(ast, { format: { compact: true, semicolons: true, quotes: 'single', escapeless: false, indent: { style: '', base: 0, adjustMultilineComment: false } } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unsupported or invalid JavaScript syntax.'
    throw new Error(`Unable to safely minify JavaScript: ${message}`)
  }
}
