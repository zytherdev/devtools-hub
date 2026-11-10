import * as esprima from 'esprima'
import * as escodegen from 'escodegen'

export const MAX_INPUT_LENGTH = 250_000

type EsprimaComment = {
  type: string
  value: string
  range?: [number, number]
}

type ParsedProgram = esprima.Program & {
  comments?: EsprimaComment[]
}

function parseJavaScript(code: string): ParsedProgram {
  const parserOptions = { comment: true, range: true, tokens: true }

  try {
    return esprima.parseScript(code, parserOptions) as ParsedProgram
  } catch (scriptError) {
    try {
      return esprima.parseModule(code, parserOptions) as ParsedProgram
    } catch {
      throw scriptError
    }
  }
}

function formatPercentage(part: number, whole: number): string {
  if (whole === 0) return '0%'
  return `${((part / whole) * 100).toFixed(1).replace(/\.0$/, '')}%`
}

export function summarizeSizeChange(inputLength: number, outputLength: number): string {
  if (outputLength === inputLength) return 'Output size is unchanged.'

  if (outputLength < inputLength) {
    const saved = inputLength - outputLength
    return `${saved.toLocaleString()} characters saved (${formatPercentage(saved, inputLength)} smaller).`
  }

  const added = outputLength - inputLength
  return `${added.toLocaleString()} characters larger (${formatPercentage(added, inputLength)}).`
}

export function minifyJS(code: string): string {
  if (typeof code !== 'string' || !code.trim()) throw new Error('Paste JavaScript code to minify.')
  if (code.length > MAX_INPUT_LENGTH) {
    throw new Error(`Source input is limited to ${MAX_INPUT_LENGTH.toLocaleString()} characters.`)
  }

  try {
    const ast = parseJavaScript(code)
    const licenseComments = (ast.comments ?? []).filter(
      comment => comment.type === 'Block' && comment.value.startsWith('!'),
    )
    const tokens = ast.tokens ?? []

    if (licenseComments.length > 0) {
      escodegen.attachComments(ast, licenseComments, tokens)
    }

    return escodegen.generate(ast, {
      comment: licenseComments.length > 0,
      format: {
        compact: true,
        semicolons: true,
        quotes: 'single',
        escapeless: false,
        indent: { style: '', base: 0, adjustMultilineComment: false },
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unsupported or invalid JavaScript syntax.'
    throw new Error(`Unable to safely minify JavaScript: ${message}`)
  }
}
