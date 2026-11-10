/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { tool } = require('../../app/tools/css-minifier/definition.ts')
const { minifyCSS, run } = require('../../app/tools/css-minifier/logic.ts')
const toolSource = fs.readFileSync(path.join(__dirname, '../../app/tools/css-minifier/Tool.tsx'), 'utf8')

test('css-minifier follows the per-tool contract and offers CSS download metadata', () => {
  assert.equal(tool.id, 'css-minifier')
  assert.equal(tool.href, '/css-minifier')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.outputExtension, 'css')
  assert.ok(tool.exampleInput.includes('.card'))
  assert.equal(typeof run, 'function')
})

test('removes ordinary comments and whitespace while retaining license comments and strings', () => {
  const input = '/* remove */ a { content: "a ; { /* text */ }"; color: red; } /*! keep */'
  assert.equal(minifyCSS(input), 'a{content:"a ; { /* text */ }";color:red}/*! keep */')
})

test('preserves descendant combinator whitespace around attributes, pseudo-classes, and class selectors', () => {
  assert.equal(minifyCSS('section [hidden] { display: none; } div :hover { color: red; }'), 'section [hidden]{display:none}div :hover{color:red}')
  assert.equal(minifyCSS('.card .title { color: blue; }'), '.card .title{color:blue}')
})

test('keeps token-separating spaces in values and compresses @media blocks', () => {
  const input = '@media (max-width: 600px) { .card { margin: 0 1rem; font-family: Open Sans; } }'
  assert.equal(minifyCSS(input), '@media (max-width:600px){.card{margin:0 1rem;font-family:Open Sans}}')
})

test('minifies ordinary declarations without abandoning the stylesheet for custom properties', () => {
  const input = '.theme { --spacing:  1rem   2rem ; color:  red; margin: 0 1rem; }'
  const result = minifyCSS(input)
  assert.equal(result, '.theme{--spacing:  1rem   2rem ;color:red;margin:0 1rem}')
  assert.match(result, /--spacing:  1rem   2rem ;/)
  assert.ok(result.length < input.length)
})

test('reports malformed strings, comments, and unbalanced CSS delimiters', () => {
  assert.throws(() => minifyCSS('a { content: "unfinished; }'), /unterminated string/i)
  assert.throws(() => minifyCSS('a { color: red; /* unfinished'), /unterminated comment/i)
  assert.throws(() => minifyCSS('a { color: red;'), /unterminated/i)
  assert.throws(() => minifyCSS('a { color: red; }}'), /unmatched closing brace/i)
  assert.throws(() => minifyCSS('a { color: rgb(1, 2; }'), /unmatched|unterminated/i)
})

test('exposes a bounded run API and rejects unsupported options and non-string input', () => {
  assert.equal(run('a { color: red; }', {}), 'a{color:red}')
  assert.equal(run('', {}), '')
  assert.throws(() => run('a{}', { advanced: 'true' }), /unknown css minifier option/i)
  assert.throws(() => run(null, {}), /must be a string/i)
  assert.throws(() => run('a'.repeat(1_000_001), {}), /1,000,000 characters/i)
})

test('UI invalidates stale output on input edits, uses inline feedback, and does not advertise no-op Advanced mode', () => {
  assert.match(toolSource, /function handleInputChange[\s\S]*?setOutput\(''\)/)
  assert.match(toolSource, /role=\{error \? 'alert' : 'status'\}/)
  assert.match(toolSource, /anchor\.download = 'minified\.css'/)
  assert.doesNotMatch(toolSource, /\balert\s*\(/)
  assert.doesNotMatch(toolSource, /Advanced mode|advancedMode|Advanced ON/)
})
