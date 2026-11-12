/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { tool } = require('../../app/tools/cron-validator/definition.ts')
const cron = require('../../app/tools/cron-validator/logic.ts')

test('cron-validator is implemented and documents syntax-only behavior', () => {
  assert.equal(tool.id, 'cron-validator')
  assert.equal(tool.href, '/cron-validator')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.badge, '')
  assert.equal(tool.exampleInput, '*/15 9-17 * * 1-5')
  assert.match(tool.description, /five-field numeric cron/i)
  assert.match(cron.run(tool.exampleInput, {}), /no timezone-specific next run is calculated/i)
})

test('accepts common five-field expressions with lists, ranges, wildcards, and steps', () => {
  for (const expression of [
    '*/15 9-17 * * 1-5',
    '0 0 1,15 * 0',
    '5/10 8-18/2 * 1-12 1-5',
    '1,5,10 0 1 1 7',
    '  0  23  31  12  0  '
  ]) {
    assert.equal(cron.validateCronExpression(expression).valid, true, expression)
    assert.doesNotThrow(() => cron.run(expression))
  }
})

test('accepts inclusive numeric field boundaries and both Sunday values', () => {
  assert.equal(cron.validateCronExpression('0 0 1 1 0').valid, true)
  assert.equal(cron.validateCronExpression('59 23 31 12 7').valid, true)
  assert.equal(cron.validateCronExpression('*/60 */24 */31 */12 */8').valid, true)
})

test('rejects wrong field counts, names, macros, special operators, and malformed lists', () => {
  for (const expression of [
    '',
    '* * * *',
    '* * * * * *',
    '0 0 * JAN *',
    '0 0 * * MON',
    '@daily',
    '0 0 L * *',
    '0,,5 * * * *',
    '0 0 * * 1,',
    '*/ * * * *',
    '*/2/3 * * * *',
    '1- * * * *'
  ]) {
    assert.equal(cron.validateCronExpression(expression).valid, false, expression)
    assert.throws(() => cron.run(expression), Error)
  }
})

test('rejects out-of-range values, descending ranges, and invalid steps', () => {
  const invalidExpressions = [
    '60 * * * *',
    '0 24 * * *',
    '0 0 0 * *',
    '0 0 32 * *',
    '0 0 * 0 *',
    '0 0 * 13 *',
    '0 0 * * 8',
    '10-2 * * * *',
    '*/0 * * * *',
    '*/61 * * * *',
    '0 0 * * */9'
  ]
  for (const expression of invalidExpressions) {
    assert.equal(cron.validateCronExpression(expression).valid, false, expression)
  }
})

test('bounds input and list processing and rejects non-string expressions', () => {
  const baseExpression = '0 0 * * *'
  const exactLengthExpression = baseExpression + ' '.repeat(cron.MAX_CRON_INPUT_LENGTH - baseExpression.length)
  assert.equal(cron.validateCronExpression(exactLengthExpression).valid, true)
  assert.match(cron.validateCronExpression('x'.repeat(cron.MAX_CRON_INPUT_LENGTH + 1)).message, /256 characters/i)
  assert.equal(cron.validateCronExpression(`${Array(64).fill('0').join(',')} * * * *`).valid, true)
  assert.match(cron.validateCronExpression(`0,${Array(64).fill('1').join(',')} * * * *`).message, /too many.*items/i)
  for (const input of [null, undefined, 5, {}, []]) {
    assert.equal(cron.validateCronExpression(input).valid, false)
  }
})

test('run enforces an empty plain options object', () => {
  assert.doesNotThrow(() => cron.run('0 0 * * *', {}))
  assert.throws(() => cron.run('0 0 * * *', { timezone: 'UTC' }), /Unsupported option.*timezone/i)
  assert.throws(() => cron.run('0 0 * * *', null), /plain object/i)
  assert.throws(() => cron.run('0 0 * * *', []), /plain object/i)
  assert.throws(() => cron.run('0 0 * * *', 'UTC'), /plain object/i)
})

test('UI is connected to local validation and exposes accessible inline feedback', () => {
  const source = fs.readFileSync(path.join(__dirname, '../../app/tools/cron-validator/Tool.tsx'), 'utf8')
  assert.match(source, /validateCronExpression\(expression\)/)
  assert.match(source, /aria-invalid=/)
  assert.match(source, /aria-live=/)
  assert.match(source, /role=\{result\?\.valid === false \? 'alert' : 'status'\}/)
  assert.match(source, /no timezone-specific next run/i)
  assert.doesNotMatch(source, /\balert\s*\(/)
})
