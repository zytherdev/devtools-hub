/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { tool } = require('../../app/tools/js-beautifier/definition.ts')
const { beautifyJS, MAX_SOURCE_LENGTH } = require('../../app/tools/js-beautifier/logic.ts')

test('js-beautifier follows the per-tool contract and documents its sample/default output', () => {
  assert.equal(tool.id, 'js-beautifier')
  assert.equal(tool.href, '/js-beautifier')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.outputExtension, 'js')
  assert.match(tool.exampleInput, /<T,>/)
  assert.equal(tool.defaultOptions.syntax, 'javascript')
})

test('loading the TSX sample selects the matching syntax parser', () => {
  const component = fs.readFileSync(path.join(__dirname, '../../app/tools/js-beautifier/Tool.tsx'), 'utf8')
  assert.match(component, /setSyntax\('tsx'\); setInput\(sample\)/)
})

test('formats JavaScript and preserves string contents', async () => {
  const result = await beautifyJS('const message="Keep  spaces and \\\"quotes\\\"";')
  assert.match(result, /const message = 'Keep  spaces and "quotes"';/)
})

test('formats JSX with the Babel parser', async () => {
  const result = await beautifyJS('const View=()=> <section className="card">Hello</section>', { syntax: 'jsx' })
  assert.match(result, /<section className="card">Hello<\/section>/)
  assert.match(result, /const View = \(\) =>/)
})

test('formats TypeScript aliases with lowercase names and satisfies syntax', async () => {
  const source = 'type result = { ok: boolean }; const value = { ok: true } satisfies result'
  const output = await beautifyJS(source, { syntax: 'typescript' })
  assert.match(output, /type result = \{ ok: boolean \};/)
  assert.match(output, /satisfies result/)
})

test('formats generic arrow functions in TSX mode', async () => {
  const source = 'const identity = <T,>(value: T) => <span>{value}</span>'
  const output = await beautifyJS(source, { syntax: 'tsx' })
  assert.match(output, /<T,>/)
  assert.match(output, /<span>\{value\}<\/span>/)
})

test('reports syntax errors with the selected parser mode', async () => {
  await assert.rejects(beautifyJS('const = ;', { syntax: 'typescript' }), /Could not parse this TYPESCRIPT source:/)
})

test('validates syntax and all formatting options instead of silently clamping', async () => {
  await assert.rejects(beautifyJS('const value=1', { syntax: 'flow' }), /Choose JavaScript, JSX, TypeScript, or TSX/)
  await assert.rejects(beautifyJS('const value=1', { semicolons: false }), /Unknown formatting option: semicolons/)
  await assert.rejects(beautifyJS('const value=1', { indentSize: 0 }), /Indent size must be a whole number from 1 to 8/)
  await assert.rejects(beautifyJS('const value=1', { wrapLineLength: 39 }), /Line width must be a whole number from 40 to 160/)
  await assert.rejects(beautifyJS('const value=1', { indentChar: '\n' }), /Indent character must be spaces or tabs/)
})

test('rejects empty input, non-object options, and source above the defensive limit', async () => {
  await assert.rejects(beautifyJS('  '), /Paste JavaScript, JSX, TypeScript, or TSX/)
  await assert.rejects(beautifyJS('const value=1', null), /Formatting options must be an object/)
  await assert.rejects(beautifyJS(`//${'x'.repeat(MAX_SOURCE_LENGTH)}`), /limited to 100,000 characters/)
})
