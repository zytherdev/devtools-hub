/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/timestamp-converter/definition.ts')
const implementation = require('../../app/tools/timestamp-converter/logic.ts')

test('timestamp-converter follows the per-tool contract and uses UniversalTool', () => {
  assert.equal(tool.id, 'timestamp-converter')
  assert.equal(tool.href, '/timestamp-converter')
  assert.equal(tool.status, 'implemented')
  assert.equal(typeof implementation.run, 'function')
  assert.match(require('node:fs').readFileSync('app/tools/timestamp-converter/Tool.tsx', 'utf8'), /UniversalTool/)
})

test('converts ISO dates with explicit UTC zone to Unix seconds and milliseconds', () => {
  const result = JSON.parse(implementation.run('2026-01-01T00:00:00Z', { mode: 'iso-to-epoch' }))
  assert.equal(result.iso, '2026-01-01T00:00:00.000Z')
  assert.equal(result.unixMilliseconds, Date.UTC(2026, 0, 1))
  assert.equal(result.unixSeconds, Date.UTC(2026, 0, 1) / 1000)
})

test('applies numeric offsets and fractional milliseconds correctly', () => {
  assert.equal(JSON.parse(implementation.run('1970-01-01T01:00:00+01:00', {})).unixMilliseconds, 0)
  assert.equal(JSON.parse(implementation.run('1970-01-01T00:00:00.123Z', {})).unixMilliseconds, 123)
  assert.equal(JSON.parse(implementation.run('1969-12-31T19:00:00-05:00', {})).unixMilliseconds, 0)
})

test('converts Unix seconds and milliseconds to an ISO representation', () => {
  assert.equal(JSON.parse(implementation.run('0', { mode: 'epoch-to-iso', unit: 'seconds' })).iso, '1970-01-01T00:00:00.000Z')
  assert.equal(JSON.parse(implementation.run('1234', { mode: 'epoch-to-iso', unit: 'milliseconds' })).iso, '1970-01-01T00:00:01.234Z')
  assert.equal(JSON.parse(implementation.run('-1', { mode: 'epoch-to-iso', unit: 'seconds' })).iso, '1969-12-31T23:59:59.000Z')
})

test('rejects missing zones, invalid dates, invalid offsets, and malformed options', () => {
  for (const value of ['2026-01-01T00:00:00', '2025-02-29T00:00:00Z', '2026-13-01T00:00:00Z', '2026-01-01T00:00:00+14:01']) {
    assert.throws(() => implementation.run(value, { mode: 'iso-to-epoch' }))
  }
  assert.throws(() => implementation.run('1.5', { mode: 'epoch-to-iso' }), /whole number/)
  assert.throws(() => implementation.run('0', { mode: 'epoch-to-iso', unit: 'minutes' }), /unit must be/)
  assert.throws(() => implementation.run('x', { mode: 'wrong' }), /mode must be/)
  assert.throws(() => implementation.run('0', { extra: 'x' }), /Unknown option/)
})
