/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const { tool } = require('../../app/tools/eta-calculator/definition.ts')
const implementation = require('../../app/tools/eta-calculator/logic.ts')

const calculate = value => JSON.parse(implementation.run(JSON.stringify(value)))
const baseDate = '2026-01-01T12:00:00Z'

test('eta-calculator follows the implemented per-tool and shared UI contract', () => {
  assert.equal(tool.id, 'eta-calculator')
  assert.equal(tool.href, '/eta-calculator')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.badge, '')
  assert.equal(typeof implementation.run, 'function')
  assert.match(fs.readFileSync('app/tools/eta-calculator/Tool.tsx', 'utf8'), /UniversalTool/)
})

test('estimates remaining time from elapsed time and average completion rate', () => {
  const result = calculate({ progress: 40, elapsedMinutes: 120, asOf: baseDate })
  assert.deepEqual(result, {
    progressPercent: 40,
    method: 'elapsed-time',
    remainingSeconds: 10_800,
    remainingMinutes: 180,
    remainingHours: 3,
    asOf: '2026-01-01T12:00:00.000Z',
    estimatedCompletion: '2026-01-01T15:00:00.000Z',
  })
  assert.equal(calculate({ progress: 1.15, elapsedMinutes: 1.15, asOf: baseDate }).remainingSeconds, 5_931)
})

test('estimates from direct throughput and preserves reference milliseconds', () => {
  const result = calculate({ progress: 25, throughputPercentPerHour: 10, asOf: '2026-01-01T12:00:00.125Z' })
  assert.equal(result.method, 'throughput')
  assert.equal(result.remainingSeconds, 27_000)
  assert.equal(result.estimatedCompletion, '2026-01-01T19:30:00.125Z')
  assert.equal(result.asOf, '2026-01-01T12:00:00.125Z')
})

test('allows zero progress only with explicit throughput and returns immediate completion at 100%', () => {
  const zeroProgress = calculate({ progress: 0, throughputPercentPerHour: 25, asOf: baseDate })
  assert.equal(zeroProgress.remainingSeconds, 14_400)
  assert.throws(() => implementation.run(JSON.stringify({ progress: 0, elapsedMinutes: 30, asOf: baseDate })), /zero progress/)
  const complete = calculate({ progress: 100, elapsedMinutes: 30, asOf: baseDate })
  assert.equal(complete.remainingSeconds, 0)
  assert.equal(complete.estimatedCompletion, '2026-01-01T12:00:00.000Z')
})

test('rounds remaining duration to the nearest second', () => {
  const up = calculate({ progress: 50, elapsedMinutes: 0.01, asOf: '2026-01-01T12:00:00.250Z' })
  assert.equal(up.remainingSeconds, 1)
  assert.equal(up.estimatedCompletion, '2026-01-01T12:00:01.250Z')
  const down = calculate({ progress: 99.99, throughputPercentPerHour: 10_000, asOf: baseDate })
  assert.equal(down.remainingSeconds, 0)
  const halfSecond = calculate({ progress: 99, throughputPercentPerHour: 7_200, asOf: baseDate })
  assert.equal(halfSecond.remainingSeconds, 1)
})

test('rejects invalid JSON shape, fields, types, ranges, and mutually exclusive estimate inputs', () => {
  for (const input of ['', '{', '[]', 'null', '"text"', '{}']) {
    assert.throws(() => implementation.run(input), /1 to 2000 characters|valid JSON object|JSON object|progress is required/)
  }
  const invalid = [
    { progress: '40', elapsedMinutes: 10, asOf: baseDate },
    { progress: -1, elapsedMinutes: 10, asOf: baseDate },
    { progress: 100.01, elapsedMinutes: 10, asOf: baseDate },
    { progress: 1.234, elapsedMinutes: 10, asOf: baseDate },
    { progress: 40, elapsedMinutes: 10, throughputPercentPerHour: 2, asOf: baseDate },
    { progress: 40, asOf: baseDate },
    { progress: 40, elapsedMinutes: 0, asOf: baseDate },
    { progress: 40, elapsedMinutes: 525601, asOf: baseDate },
    { progress: 40, throughputPercentPerHour: 0, asOf: baseDate },
    { progress: 40, throughputPercentPerHour: 10000.01, asOf: baseDate },
    { progress: 40, elapsedMinutes: 10, asOf: baseDate, extra: true },
  ]
  for (const value of invalid) assert.throws(() => implementation.run(JSON.stringify(value)))
  assert.throws(() => implementation.run(JSON.stringify({ progress: 40, elapsedMinutes: 10, asOf: baseDate }), { format: 'short' }), /does not accept options/)
  assert.throws(() => implementation.run(' '.repeat(2001)), /1 to 2000 characters/)
})

test('validates UTC dates, rejects invalid dates and prevents completion beyond supported range', () => {
  for (const asOf of ['2025-02-29T00:00:00Z', '2026-01-01T00:00:00', '2026-13-01T00:00:00Z', '10000-01-01T00:00:00Z']) {
    assert.throws(() => implementation.run(JSON.stringify({ progress: 50, elapsedMinutes: 60, asOf })))
  }
  const lowerBoundary = calculate({ progress: 100, throughputPercentPerHour: 1, asOf: '0000-01-01T00:00:00Z' })
  assert.equal(lowerBoundary.asOf, '0000-01-01T00:00:00.000Z')
  assert.equal(lowerBoundary.estimatedCompletion, '0000-01-01T00:00:00.000Z')
  assert.throws(() => implementation.run(JSON.stringify({ progress: 50, throughputPercentPerHour: 1, asOf: '9999-12-31T23:59:59Z' })), /outside the supported UTC date range/)
})

test('rejects projections longer than the documented 100-year limit', () => {
  assert.throws(() => implementation.run(JSON.stringify({ progress: 0.01, elapsedMinutes: 525600, asOf: baseDate })), /no more than 100 years/)
})
