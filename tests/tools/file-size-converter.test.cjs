/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/file-size-converter/definition.ts')
const implementation = require('../../app/tools/file-size-converter/logic.ts')

test('file-size-converter follows the per-tool contract and uses UniversalTool', () => {
  assert.equal(tool.id, 'file-size-converter')
  assert.equal(tool.href, '/file-size-converter')
  assert.equal(tool.status, 'implemented')
  assert.equal(typeof implementation.run, 'function')
  assert.match(require('node:fs').readFileSync('app/tools/file-size-converter/Tool.tsx', 'utf8'), /UniversalTool/)
})

test('converts decimal and binary units using their distinct multipliers', () => {
  assert.equal(JSON.parse(implementation.run('1000', { from: 'B', to: 'KB', precision: '6' })).result, 1)
  assert.equal(JSON.parse(implementation.run('1', { from: 'MB', to: 'MiB', precision: '6' })).result, 0.953674)
  assert.equal(JSON.parse(implementation.run('1024', { from: 'KiB', to: 'MiB', precision: '6' })).result, 1)
  assert.equal(JSON.parse(implementation.run('1', { from: 'EiB', to: 'EiB' })).result, 1)
})

test('supports fractional sizes, rounding, and zero', () => {
  assert.equal(JSON.parse(implementation.run('1536', { from: 'B', to: 'KiB', precision: '3' })).result, 1.5)
  assert.equal(JSON.parse(implementation.run('1.23456', { from: 'KB', to: 'B', precision: '2' })).result, 1234.56)
  assert.equal(JSON.parse(implementation.run('0', { from: 'GB', to: 'B' })).result, 0)
})

test('rejects negative, invalid, unknown, over-precise, and overflowing values', () => {
  assert.throws(() => implementation.run('-1', {}), /non-negative/)
  assert.throws(() => implementation.run('NaN', {}), /non-negative/)
  assert.throws(() => implementation.run('1', { from: 'unknown', to: 'B' }), /Unknown size unit/)
  assert.throws(() => implementation.run('1', { precision: '13' }), /precision/)
  assert.throws(() => implementation.run('1e300', { from: 'EiB', to: 'B' }), /outside the supported/)
  assert.throws(() => implementation.run('1', { extra: 'x' }), /Unknown option/)
})
