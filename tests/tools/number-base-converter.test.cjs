/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/number-base-converter/definition.ts')
const implementation = require('../../app/tools/number-base-converter/logic.ts')

test('number-base-converter follows the per-tool contract and uses UniversalTool', () => {
  assert.equal(tool.id, 'number-base-converter')
  assert.equal(tool.href, '/number-base-converter')
  assert.equal(tool.status, 'implemented')
  assert.equal(typeof implementation.run, 'function')
  assert.match(require('node:fs').readFileSync('app/tools/number-base-converter/Tool.tsx', 'utf8'), /UniversalTool/)
})

test('converts decimal, binary, octal, hexadecimal, and base-36 values', () => {
  assert.equal(implementation.run('255', { fromBase: '10', toBase: '16' }), 'ff')
  assert.equal(implementation.run('11111111', { fromBase: '2', toBase: '10' }), '255')
  assert.equal(implementation.run('377', { fromBase: '8', toBase: '2' }), '11111111')
  assert.equal(implementation.run('z', { fromBase: '36', toBase: '10' }), '35')
})

test('preserves sign and arbitrary integer precision', () => {
  assert.equal(implementation.run('-9007199254740993', { fromBase: '10', toBase: '16' }), '-20000000000001')
  assert.equal(implementation.run('+ff', { fromBase: '16', toBase: '10' }), '255')
  assert.equal(implementation.run('0', { fromBase: '10', toBase: '2' }), '0')
})

test('rejects invalid digits, fractional values, bases, options, and excessive input', () => {
  assert.throws(() => implementation.run('2', { fromBase: '2', toBase: '10' }), /not valid in base/)
  assert.throws(() => implementation.run('10.5', { fromBase: '10', toBase: '2' }), /not valid in base/)
  assert.throws(() => implementation.run('1', { fromBase: '1', toBase: '10' }), /base from 2 to 36/)
  assert.throws(() => implementation.run('', {}), /1 to 1,000/)
  assert.throws(() => implementation.run('x'.repeat(1001), {}), /1 to 1,000/)
  assert.throws(() => implementation.run('1', { extra: 'x' }), /Unknown option/)
})
