import * as esprima from 'esprima'
import * as escodegen from 'escodegen'

export function minifyJS(code: string): string {
    try {
        // converte o code into AST
        const ast = esprima.parseScript(code, {
            jsx: true,
            tokens: true,
            comment: true,
            tolerant: true,
            loc: true,
            range: true
        })
        
        // rm comments
        ast.comments = []
        
        // gnrate minified code with proper ;
        const result = escodegen.generate(ast, {
            format: {
                compact: true,
                semicolons: true,
                quotes: 'single',
                escapeless: false,
                indent: {
                    style: '',
                    base: 0,
                    adjustMultilineComment: false
                }
            }
        })
        
        return result
    } catch (error) {
        console.warn('AST minification failed, using fallback:', error)
        return error as string
    }
}