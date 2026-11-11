/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const { tool } = require('../../app/tools/currency-converter/definition.ts')
const implementation = require('../../app/tools/currency-converter/logic.ts')

test('currency-converter has implemented metadata, declared defaults, and UniversalTool UI', () => {
  assert.equal(tool.id, 'currency-converter')
  assert.equal(tool.href, '/currency-converter')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.badge, '')
  assert.deepEqual(tool.defaultOptions, { from: 'USD', to: 'EUR', rate: '1', precision: '2' })
  assert.equal(typeof implementation.run, 'function')
  const ui = fs.readFileSync('app/tools/currency-converter/Tool.tsx', 'utf8')
  assert.match(ui, /UniversalTool/)
  assert.match(ui, /slug=\{tool\.id\}/)
})

test('uses user-provided conversion rates and rounds to the requested precision', () => {
  const result = JSON.parse(implementation.run('100', { from: 'usd', to: 'eur', rate: '0.92', precision: '2' }))
  assert.deepEqual(result, { from: 'USD', to: 'EUR', rate: 0.92, amount: 100, result: 92 })
  assert.equal(JSON.parse(implementation.run('12.345', { from: 'GBP', to: 'JPY', rate: '190', precision: '0' })).result, 2346)
  assert.equal(JSON.parse(implementation.run('1', { rate: '1.23456789', precision: '6' })).result, 1.234568)
  assert.equal(JSON.parse(implementation.run('7.25', {})).result, 7.25)
})

test('supports a conversion round trip when the reciprocal rate is supplied', () => {
  const forward = JSON.parse(implementation.run('123.45', { from: 'USD', to: 'EUR', rate: '0.8', precision: '6' }))
  const reverse = JSON.parse(implementation.run(String(forward.result), { from: 'EUR', to: 'USD', rate: '1.25', precision: '2' }))
  assert.equal(forward.result, 98.76)
  assert.equal(reverse.result, 123.45)
})

test('rejects invalid amounts, oversized input, and invalid currency codes', () => {
  for (const amount of ['', 'NaN', 'Infinity', '1e2', '0x10', '1,25', '.']) {
    assert.throws(() => implementation.run(amount, {}), /finite decimal/)
  }
  assert.throws(() => implementation.run('1'.repeat(101), {}), /100 characters/)
  assert.throws(() => implementation.run('1', { from: 'US', to: 'EUR' }), /three ASCII letters/)
  assert.throws(() => implementation.run('1', { from: 'USÉ', to: 'EUR' }), /three ASCII letters/)
  assert.throws(() => implementation.run('1', { to: 'E1R' }), /three ASCII letters/)
})

test('rejects invalid rates, precision, oversized option values, and unknown options', () => {
  for (const rate of ['0', '-1', 'NaN', 'Infinity', '1e2', '']) {
    assert.throws(() => implementation.run('1', { rate }), /rate/)
  }
  assert.throws(() => implementation.run('1', { precision: '-1' }), /precision/)
  assert.throws(() => implementation.run('1', { precision: '7' }), /precision/)
  assert.throws(() => implementation.run('1', { precision: '2.5' }), /precision/)
  assert.throws(() => implementation.run('1', { extra: 'x' }), /Unknown option/)
  assert.throws(() => implementation.run('1', { rate: '1'.repeat(101) }), /100-character limit/)
})

test('handles the largest finite product permitted by the input and rate limits', () => {
  const result = JSON.parse(implementation.run('9'.repeat(100), { rate: '9'.repeat(100) }))
  assert.equal(Number.isFinite(result.result), true)
  assert.equal(result.amount, Number('9'.repeat(100)))
})
