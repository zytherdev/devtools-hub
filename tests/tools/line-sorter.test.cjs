/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/line-sorter/definition.ts')
const implementation = require('../../app/tools/line-sorter/logic.ts')

test('line-sorter follows the per-tool contract and uses UniversalTool', () => {
  assert.equal(tool.id, 'line-sorter')
  assert.equal(tool.href, '/line-sorter')
  assert.equal(tool.status, 'implemented')
  assert.equal(typeof implementation.run, 'function')
  assert.match(require('node:fs').readFileSync('app/tools/line-sorter/Tool.tsx', 'utf8'), /UniversalTool/)
})

test('sorts alphabetically with stable case-insensitive ordering', () => {
  assert.equal(implementation.run('banana\nApple\napricot', { order: 'alphabetical-asc' }), 'Apple\napricot\nbanana')
  assert.equal(implementation.run('banana\nApple', { order: 'alphabetical-desc' }), 'banana\nApple')
})

test('sorts numeric values numerically rather than lexicographically', () => {
  assert.equal(implementation.run('10\n2\n-1.5', { order: 'numeric-asc' }), '-1.5\n2\n10')
  assert.equal(implementation.run('10\n2\n-1.5', { order: 'numeric-desc' }), '10\n2\n-1.5')
})

test('supports reverse order, stable deduplication, trim and empty filtering', () => {
  assert.equal(implementation.run(' a \nb\na\n', { order: 'reverse', unique: 'true', trimWhitespace: 'true', ignoreEmpty: 'true' }), 'b\na')
  assert.equal(implementation.run('a\nb\na', { unique: 'true' }), 'a\nb')
  assert.equal(implementation.run('', {}), '')
})

test('rejects malformed options, unknown modes, and oversized inputs', () => {
  assert.throws(() => implementation.run('a', { order: 'random' }), /order must be/)
  assert.throws(() => implementation.run('a', { unique: 'yes' }), /unique/)
  assert.throws(() => implementation.run('a', { extra: 'x' }), /Unknown option/)
  assert.throws(() => implementation.run('x'.repeat(1_000_001), {}), /1,000,000/)
  assert.throws(() => implementation.run(Array(100_002).fill('x').join('\n'), {}), /at most 100,000 lines/)
})
