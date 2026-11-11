/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const { tool } = require('../../app/tools/diff-checker/definition.ts')
const { MAX_INPUT_LENGTH, MAX_LINES_PER_SIDE, run } = require('../../app/tools/diff-checker/logic.ts')

const SEPARATOR = '---8<---'
const input = (original, updated, separator = SEPARATOR) => `${original}\n${separator}\n${updated}`
const HEADERS = '--- Original\n+++ Updated'

test('diff-checker is implemented and connected to UniversalTool', () => {
  assert.equal(tool.id, 'diff-checker')
  assert.equal(tool.href, '/diff-checker')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.outputExtension, 'txt')
  assert.deepEqual(tool.defaultOptions, {})
  assert.match(tool.exampleInput, /\n---8<---\n/)
  const component = fs.readFileSync(require.resolve('../../app/tools/diff-checker/Tool.tsx'), 'utf8')
  assert.match(component, /<UniversalTool\s+tool=\{tool\}\s+slug=\{tool\.id\}\s*\/>/)
})

test('emits only headers for identical text and ignores a final newline difference', () => {
  assert.equal(run(input('line 1\nline 2', 'line 1\nline 2\n')), `${HEADERS}\n line 1\n line 2`)
  assert.equal(run(input('', '')), HEADERS)
})

test('marks inserted lines with + and preserves unchanged lines with a space', () => {
  assert.equal(run(input('a\nc', 'a\nb\nc')), `${HEADERS}\n a\n+b\n c`)
})

test('marks removed lines with -', () => {
  assert.equal(run(input('a\nb\nc', 'a\nc')), `${HEADERS}\n a\n-b\n c`)
})

test('represents replacements deterministically as a removal followed by an addition', () => {
  assert.equal(run(input('antes', 'depois')), `${HEADERS}\n-antes\n+depois`)
})

test('compares blank lines without confusing them with a final newline', () => {
  assert.equal(run(input('a\n\n\n', 'a\nx')), `${HEADERS}\n a\n-\n-\n+x`)
  assert.equal(run(input('\n', '')), `${HEADERS}\n-`)
})

test('accepts a custom separator and CRLF line endings', () => {
  const customInput = input('old', 'new', '===')
  assert.equal(run(customInput.replace(/\n/g, '\r\n'), { separator: '===' }), `${HEADERS}\n-old\n+new`)
})

test('accepts the character limit and rejects longer input', () => {
  const accepted = `${'x'.repeat(MAX_INPUT_LENGTH - ('\n' + SEPARATOR).length)}\n${SEPARATOR}`
  assert.equal(accepted.length, MAX_INPUT_LENGTH)
  assert.equal(run(accepted), `${HEADERS}\n-${'x'.repeat(MAX_INPUT_LENGTH - ('\n' + SEPARATOR).length)}`)

  const rejected = `${'x'.repeat(MAX_INPUT_LENGTH - ('\n' + SEPARATOR).length + 1)}\n${SEPARATOR}`
  assert.equal(rejected.length, MAX_INPUT_LENGTH + 1)
  assert.throws(() => run(rejected), /no more than 200,000 characters/i)
})

test('accepts up to 2,000 lines per side and rejects 2,001', () => {
  const maxSide = Array(MAX_LINES_PER_SIDE).fill('linha').join('\n')
  assert.ok(run(input(maxSide, '')).startsWith(HEADERS))
  const tooMany = Array(MAX_LINES_PER_SIDE + 1).fill('linha').join('\n')
  assert.throws(() => run(input(tooMany, '')), /Original text.*2,000 lines/i)
  assert.throws(() => run(input('', tooMany)), /Updated text.*2,000 lines/i)
})

test('rejects invalid input types and missing or repeated separators', () => {
  assert.throws(() => run(null), /input must be a string/i)
  assert.throws(() => run('without marker'), /exactly one line/i)
  assert.throws(() => run(input('a', 'b') + `\n${SEPARATOR}`), /more than one line/i)
})

test('rejects invalid options and separators outside the rules', () => {
  assert.throws(() => run(input('a', 'b'), { unexpected: 'sim' }), /unknown option/i)
  assert.throws(() => run(input('a', 'b'), null), /options must be an object/i)
  assert.throws(() => run(input('a', 'b'), []), /options must be an object/i)
  assert.throws(() => run(input('a', 'b'), { separator: '' }), /cannot be empty/i)
  assert.throws(() => run(input('a', 'b'), { separator: 's'.repeat(81) }), /no more than 80 characters/i)
  assert.throws(() => run(input('a', 'b'), { separator: 'line\nbreak' }), /control characters/i)
  assert.throws(() => run(input('a', 'b'), { separator: 42 }), /must be a string/i)
})
