/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/remove-duplicate-lines/definition.ts')
const implementation = require('../../app/tools/remove-duplicate-lines/logic.ts')

test('remove-duplicate-lines follows the per-tool contract and uses UniversalTool', () => {
  assert.equal(tool.id, 'remove-duplicate-lines')
  assert.equal(tool.href, '/remove-duplicate-lines')
  assert.equal(tool.status, 'implemented')
  assert.equal(typeof implementation.run, 'function')
  assert.match(require('node:fs').readFileSync('app/tools/remove-duplicate-lines/Tool.tsx', 'utf8'), /UniversalTool/)
})

test('keeps the first occurrence in original order and removes empty lines by default', () => {
  assert.equal(implementation.run('a\nb\na\n\nb'), 'a\nb')
})

test('supports case-insensitive comparison and trimming while preserving first normalized value', () => {
  assert.equal(implementation.run(' Apple \napple\nBanana', { caseSensitive: 'false', trimWhitespace: 'true' }), 'Apple\nBanana')
})

test('can keep one empty line and normalizes CRLF input', () => {
  assert.equal(implementation.run('a\r\na\r\n\r\nb', { keepEmpty: 'true' }), 'a\n\nb')
  assert.equal(implementation.run('', {}), '')
})

test('rejects malformed flags, unknown options, and oversized input/line sets', () => {
  assert.throws(() => implementation.run('a', { caseSensitive: 'yes' }), /caseSensitive/)
  assert.throws(() => implementation.run('a', { extra: 'x' }), /Unknown option/)
  assert.throws(() => implementation.run('x'.repeat(1_000_001), {}), /1,000,000/)
  assert.throws(() => implementation.run(Array(100_002).fill('x').join('\n'), {}), /at most 100,000 lines/)
})
