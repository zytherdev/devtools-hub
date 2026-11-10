/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { readFileSync } = require('node:fs')
const { tool } = require('../../app/tools/js-minifier/definition.ts')
const { MAX_INPUT_LENGTH, minifyJS, summarizeSizeChange } = require('../../app/tools/js-minifier/logic.ts')

test('js-minifier follows the per-tool contract and has a canonical sample', () => {
  assert.equal(tool.id, 'js-minifier')
  assert.equal(tool.href, '/js-minifier')
  assert.equal(tool.outputExtension, 'js')
  assert.ok(tool.exampleInput.includes('export default square'))
  assert.equal(tool.exampleInput, `/*! Example license */\nconst square = (value) => value * value;\nexport default square;`)
  const readme = readFileSync('app/tools/js-minifier/README.md', 'utf8')
  assert.ok(readme.includes(tool.exampleInput))
  assert.match(readme, /Download \.js.*`minified\.js`/)
  assert.equal(typeof minifyJS, 'function')
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => minifyJS('', {}), /planned but not implemented/i)
})

test('minifies JavaScript script syntax', () => {
  assert.equal(minifyJS('function add(a, b) { return a + b; }'), 'function add(a,b){return a+b;}')
})

test('detects module syntax by parsing even when import/export is not at line start', () => {
  const output = minifyJS('const value = 1; export default value;')
  assert.match(output, /export default value/)
  assert.equal(minifyJS('const first = 1; import { second } from "./second.js";'), "const first=1;import{second}from'./second.js';")
})

test('removes ordinary comments and preserves /*! license */ comments', () => {
  const output = minifyJS('/* ordinary */ const value = 1; /*! Copyright 2026 Example */ value++; // trailing')
  assert.doesNotMatch(output, /ordinary|trailing/)
  assert.match(output, /\/\*! Copyright 2026 Example \*\//)
  assert.match(output, /const value=1/)
})

test('accepts supported async JavaScript and rejects unsupported modern syntax and JSX', () => {
  assert.match(minifyJS('async function read() { return await load(); }'), /async function read/)
  assert.throws(() => minifyJS('const value = user?.name ?? "unknown";'), /Unable to safely minify JavaScript/)
  assert.throws(() => minifyJS('const view = <main />;'), /Unable to safely minify JavaScript/)
})

test('rejects empty, malformed, and oversized source with useful errors', () => {
  assert.throws(() => minifyJS('  \n '), /Paste JavaScript code/)
  assert.throws(() => minifyJS('function {'), /Unable to safely minify JavaScript/)
  assert.throws(() => minifyJS('return 1;'), /Unable to safely minify JavaScript/)
  assert.equal(MAX_INPUT_LENGTH, 250_000)
  assert.doesNotThrow(() => minifyJS(`${' '.repeat(MAX_INPUT_LENGTH - 2)}0;`))
  assert.throws(() => minifyJS('x'.repeat(MAX_INPUT_LENGTH + 1)), /limited to 250,000 characters/)
})

test('size summaries never report negative savings or smaller output when it grows', () => {
  assert.equal(summarizeSizeChange(100, 60), '40 characters saved (40% smaller).')
  assert.equal(summarizeSizeChange(100, 100), 'Output size is unchanged.')
  assert.equal(summarizeSizeChange(100, 108), '8 characters larger (8%).')
  assert.doesNotMatch(summarizeSizeChange(20, 25), /saved|smaller|-25%/)
})
