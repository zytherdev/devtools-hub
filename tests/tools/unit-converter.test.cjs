/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/unit-converter/definition.ts')
const implementation = require('../../app/tools/unit-converter/logic.ts')

test('unit-converter follows the per-tool contract and uses UniversalTool', () => {
  assert.equal(tool.id, 'unit-converter')
  assert.equal(tool.href, '/unit-converter')
  assert.equal(tool.status, 'implemented')
  assert.equal(typeof implementation.run, 'function')
  assert.match(require('node:fs').readFileSync('app/tools/unit-converter/Tool.tsx', 'utf8'), /UniversalTool/)
})

test('converts length, mass, area, volume, and time units', () => {
  assert.equal(JSON.parse(implementation.run('1500', { from: 'm', to: 'km' })).result, 1.5)
  assert.equal(JSON.parse(implementation.run('2', { from: 'lb', to: 'kg', precision: '8' })).result, 0.90718474)
  assert.equal(JSON.parse(implementation.run('1', { from: 'acre', to: 'm2', precision: '4' })).result, 4046.8564)
  assert.equal(JSON.parse(implementation.run('1', { from: 'gal', to: 'l', precision: '6' })).result, 3.785412)
  assert.equal(JSON.parse(implementation.run('2', { from: 'h', to: 'min' })).result, 120)
})

test('converts temperatures through Kelvin and rejects below absolute zero', () => {
  assert.equal(JSON.parse(implementation.run('0', { from: 'C', to: 'F' })).result, 32)
  assert.equal(JSON.parse(implementation.run('32', { from: 'F', to: 'C' })).result, 0)
  assert.equal(JSON.parse(implementation.run('0', { from: 'C', to: 'K' })).result, 273.15)
  assert.throws(() => implementation.run('-274', { from: 'C', to: 'K' }), /absolute zero/)
})

test('rejects incompatible/unknown units, invalid numbers/options, and excessive precision', () => {
  assert.throws(() => implementation.run('1', { from: 'm', to: 'kg' }), /different dimensions/)
  assert.throws(() => implementation.run('1', { from: 'unknown', to: 'm' }), /Unknown unit|different dimensions/)
  assert.throws(() => implementation.run('NaN', { from: 'm', to: 'km' }), /finite decimal/)
  assert.throws(() => implementation.run('1', { precision: '13' }), /precision/)
  assert.throws(() => implementation.run('1', { extra: 'x' }), /Unknown option/)
  assert.throws(() => implementation.run('1e999', {}), /finite/)
})
