/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/date-difference/definition.ts')
const { run } = require('../../app/tools/date-difference/logic.ts')

function calculate(start, end, options = {}) {
  return JSON.parse(run(JSON.stringify({ start, end }), options))
}

test('date-difference is implemented and exposes the dynamic route metadata', () => {
  assert.equal(tool.id, 'date-difference')
  assert.equal(tool.href, '/date-difference')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.badge, '')
  assert.equal(Object.keys(tool.defaultOptions).length, 0)
})

test('date-only inputs mean UTC midnight and produce calendar plus elapsed units', () => {
  const result = calculate('2024-01-31', '2024-03-01')
  assert.equal(result.direction, 'forward')
  assert.equal(result.start, '2024-01-31T00:00:00.000Z')
  assert.deepEqual(result.calendarDifference, {
    years: 0, months: 1, days: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0,
  })
  assert.equal(result.elapsedMilliseconds, 30 * 24 * 60 * 60 * 1000)
})

test('offset date-times are normalized to UTC before comparison', () => {
  const result = calculate('2024-06-01T12:00:00+02:00', '2024-06-01T11:00:00Z')
  assert.equal(result.start, '2024-06-01T10:00:00.000Z')
  assert.equal(result.direction, 'forward')
  assert.deepEqual(result.calendarDifference, {
    years: 0, months: 0, days: 0, hours: 1, minutes: 0, seconds: 0, milliseconds: 0,
  })
})

test('leap-day year addition clamps to the last day of February', () => {
  const result = calculate('2020-02-29', '2021-02-28')
  assert.deepEqual(result.calendarDifference, {
    years: 1, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0,
  })
})

test('reversed endpoints retain their order and report the absolute calendar difference', () => {
  const result = calculate('2025-03-01', '2024-02-29')
  assert.equal(result.direction, 'backward')
  assert.deepEqual(result.calendarDifference, {
    years: 1, months: 0, days: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0,
  })
})

test('same instants with distinct offsets produce a zero difference', () => {
  const result = calculate('2024-01-01T00:00:00Z', '2023-12-31T19:00:00-05:00')
  assert.equal(result.direction, 'same')
  assert.equal(result.elapsedMilliseconds, 0)
})

test('invalid JSON shapes, dates, times, offsets, and unsupported options are rejected', () => {
  assert.throws(() => run('{', {}), /valid JSON/i)
  assert.throws(() => run('[]', {}), /JSON object/i)
  assert.throws(() => run('{"start":"2024-01-01"}', {}), /exactly/i)
  assert.throws(() => run('{"start":"2024-01-01","end":"2024-01-02","other":1}', {}), /exactly/i)
  assert.throws(() => calculate('2023-02-29', '2023-03-01'), /invalid calendar date/i)
  assert.throws(() => calculate('2024-01-01T24:00:00Z', '2024-01-02'), /invalid time/i)
  assert.throws(() => calculate('2024-01-01T00:00:00', '2024-01-02'), /YYYY-MM-DD/i)
  assert.throws(() => calculate('2024-01-01T00:00:00+14:01', '2024-01-02'), /invalid UTC offset/i)
  assert.throws(() => calculate('January 1, 2024', '2024-01-02'), /YYYY-MM-DD/i)
  assert.throws(() => run('{"start":"2024-01-01","end":"2024-01-02"}', { format: 'text' }), /does not accept options/i)
})

test('input size and maximum date span are bounded', () => {
  assert.throws(() => run(' '.repeat(257), {}), /256 characters/i)
  assert.throws(() => calculate('1900-01-01', '2001-01-01'), /must not exceed 100 years/i)
  const edge = calculate('2000-01-01', '2100-01-01')
  assert.equal(edge.calendarDifference.years, 100)
})
