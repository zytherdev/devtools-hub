/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/cron-generator/definition.ts')
const implementation = require('../../app/tools/cron-generator/logic.ts')

test('cron-generator follows the per-tool contract and is implemented', () => {
  assert.equal(tool.id, 'cron-generator')
  assert.equal(tool.href, '/cron-generator')
  assert.equal(tool.status, 'implemented')
  assert.equal(typeof implementation.run, 'function')
  assert.match(require('node:fs').readFileSync('app/tools/cron-generator/Tool.tsx', 'utf8'), /UniversalTool/)
})

test('builds a five-field weekday schedule and explains its fields', () => {
  const output = implementation.run('', { minute: '0', hour: '9', dayOfMonth: '*', month: '*', dayOfWeek: '1-5' })
  assert.match(output, /Cron expression: 0 9 \* \* 1-5/)
  assert.match(output, /Minute: selected minute\(s\): 0/)
  assert.match(output, /every month/)
  assert.match(output, /OR semantics/)
})

test('accepts standard lists, ranges, wildcards and steps', () => {
  const output = implementation.run('', { minute: '*/15', hour: '9-17/2', dayOfMonth: '1,15', month: '1-12', dayOfWeek: '1-5' })
  assert.ok(output.includes('Cron expression: */15 9-17/2 1,15 1-12 1-5'))
})

test('rejects malformed fields, values outside bounds, and invalid options', () => {
  const cases = [
    { minute: '60' }, { hour: '24' }, { dayOfMonth: '0' }, { month: '13' }, { dayOfWeek: '8' },
    { minute: '1,,2' }, { minute: '*/0' }, { hour: '9-3' }, { month: 'jan' }, { dayOfWeek: '1/2' },
  ]
  for (const options of cases) assert.throws(() => implementation.run('', options))
  assert.throws(() => implementation.run('', { extra: '*' }), /Unknown option/)
  assert.throws(() => implementation.run('0 9 * * *', {}), /does not accept input text/)
})
