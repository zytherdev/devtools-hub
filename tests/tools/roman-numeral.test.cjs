/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/roman-numeral/definition.ts')
const implementation = require('../../app/tools/roman-numeral/logic.ts')

test('roman-numeral follows the per-tool contract and uses UniversalTool', () => {
  assert.equal(tool.id, 'roman-numeral')
  assert.equal(tool.href, '/roman-numeral')
  assert.equal(tool.status, 'implemented')
  assert.equal(typeof implementation.run, 'function')
  assert.match(require('node:fs').readFileSync('app/tools/roman-numeral/Tool.tsx', 'utf8'), /UniversalTool/)
})

test('converts Arabic numbers to canonical Roman numerals', () => {
  assert.equal(implementation.run('1', {}), 'I')
  assert.equal(implementation.run('4', {}), 'IV')
  assert.equal(implementation.run('944', {}), 'CMXLIV')
  assert.equal(implementation.run('2024', {}), 'MMXXIV')
  assert.equal(implementation.run('3999', {}), 'MMMCMXCIX')
})

test('converts canonical Roman numerals to Arabic and accepts lowercase', () => {
  assert.equal(implementation.run('MMXXIV', { mode: 'roman-to-arabic' }), '2024')
  assert.equal(implementation.run('iv', { mode: 'roman-to-arabic' }), '4')
  assert.equal(implementation.run('MMMCMXCIX', { mode: 'roman-to-arabic' }), '3999')
})

test('rejects out-of-range Arabic numbers and noncanonical Roman forms', () => {
  for (const input of ['0', '4000', '-1', '01', '1.5']) assert.throws(() => implementation.run(input, { mode: 'arabic-to-roman' }))
  for (const input of ['IIII', 'IC', 'VV', 'MMMM', 'ABC', '']) assert.throws(() => implementation.run(input, { mode: 'roman-to-arabic' }))
  assert.throws(() => implementation.run('10', { mode: 'other' }), /mode must be/)
  assert.throws(() => implementation.run('10', { extra: 'x' }), /Unknown option/)
})
