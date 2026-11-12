/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/timezone-converter/definition.ts')
const { run } = require('../../app/tools/timezone-converter/logic.ts')

function convert(input, options = {}) {
  return JSON.parse(run(JSON.stringify(input), options))
}

test('timezone-converter metadata follows the implemented per-tool contract', () => {
  assert.equal(tool.id, 'timezone-converter')
  assert.equal(tool.href, '/timezone-converter')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.badge, '')
  assert.equal(tool.outputExtension, 'json')
  assert.ok(JSON.parse(tool.exampleInput).instant)
})

test('converts one explicit instant and reports both local times and offsets', () => {
  const result = convert({
    instant: '2024-06-15T12:00:00Z',
    fromTimeZone: 'UTC',
    toTimeZone: 'America/New_York',
  })
  assert.equal(result.instant, '2024-06-15T12:00:00Z')
  assert.equal(result.source.localDateTime, '2024-06-15T12:00:00+00:00')
  assert.equal(result.source.utcOffset, 'UTC+00:00')
  assert.equal(result.target.localDateTime, '2024-06-15T08:00:00-04:00')
  assert.equal(result.target.utcOffset, 'UTC-04:00')
  assert.equal(result.target.daylightSavingTime, true)
  assert.match(result.target.daylightSavingLabel, /Daylight saving time is in effect/)
  assert.match(result.target.timeZoneName, /Daylight Time/)
})

test('applies an explicit source offset and presents winter standard time', () => {
  const result = convert({
    instant: '2024-01-15T12:30:00+02:00',
    fromTimeZone: 'Europe/Paris',
    toTimeZone: 'America/New_York',
  })
  assert.equal(result.instant, '2024-01-15T10:30:00Z')
  assert.equal(result.source.localDateTime, '2024-01-15T11:30:00+01:00')
  assert.equal(result.target.localDateTime, '2024-01-15T05:30:00-05:00')
  assert.equal(result.target.daylightSavingTime, false)
  assert.match(result.target.daylightSavingLabel, /not in effect/)
})

test('preserves fractional seconds through millisecond precision and handles UTC aliases', () => {
  const result = convert({
    instant: '2024-06-15T12:00:00.125+00:00',
    fromTimeZone: 'Etc/UTC',
    toTimeZone: 'Asia/Kathmandu',
  })
  assert.equal(result.instant, '2024-06-15T12:00:00.125Z')
  assert.equal(result.target.localDateTime, '2024-06-15T17:45:00.125+05:45')
  assert.equal(result.target.utcOffset, 'UTC+05:45')
})

test('rejects malformed JSON, wrong object shape, and unsupported options', () => {
  assert.throws(() => run('', {}), /JSON object/)
  assert.throws(() => run('{', {}), /valid JSON/)
  assert.throws(() => run('[]', {}), /JSON object/)
  assert.throws(() => run(JSON.stringify({ instant: '2024-01-01T00:00Z', fromTimeZone: 'UTC' }), {}), /exactly/)
  assert.throws(() => run(JSON.stringify({ instant: '2024-01-01T00:00Z', fromTimeZone: 'UTC', toTimeZone: 'UTC', extra: 1 }), {}), /exactly/)
  assert.throws(() => run(JSON.stringify({ instant: '2024-01-01T00:00Z', fromTimeZone: 'UTC', toTimeZone: 'UTC' }), { mode: 'convert' }), /does not accept options/)
})

test('rejects invalid ISO instants, missing offsets, invalid dates, and excessive UTC offsets', () => {
  const base = { instant: '2024-01-01T00:00:00Z', fromTimeZone: 'UTC', toTimeZone: 'UTC' }
  for (const instant of [
    '2024-01-01T00:00:00',
    '2024-02-30T00:00:00Z',
    '2024-01-01T24:00:00Z',
    '2024-01-01T00:00:60Z',
    '2024-01-01T00:00:00+14:01',
    '2024-01-01T00:00:00.1234Z',
    '0000-01-01T00:00:00Z',
  ]) {
    assert.throws(() => convert({ ...base, instant }))
  }
})

test('rejects invalid, whitespace-padded, and overlong time-zone names', () => {
  const base = { instant: '2024-01-01T00:00:00Z', fromTimeZone: 'UTC', toTimeZone: 'UTC' }
  assert.throws(() => convert({ ...base, toTimeZone: 'Mars/Olympus' }), /supported IANA/)
  assert.throws(() => convert({ ...base, toTimeZone: ' UTC' }), /no whitespace/)
  assert.throws(() => convert({ ...base, fromTimeZone: 'A'.repeat(129) }), /at most 128 characters/)
})

test('accepts supported year and UTC-offset boundaries and rejects displayed-year overflow', () => {
  const first = convert({ instant: '0001-01-01T00:00:00Z', fromTimeZone: 'UTC', toTimeZone: 'UTC' })
  assert.equal(first.instant, '0001-01-01T00:00:00Z')
  assert.equal(first.target.localDateTime, '0001-01-01T00:00:00+00:00')
  const last = convert({ instant: '9999-12-31T23:59:59Z', fromTimeZone: 'UTC', toTimeZone: 'UTC' })
  assert.equal(last.instant, '9999-12-31T23:59:59Z')
  const offsetBoundary = convert({ instant: '2024-01-01T14:00:00+14:00', fromTimeZone: 'UTC', toTimeZone: 'UTC' })
  assert.equal(offsetBoundary.instant, '2024-01-01T00:00:00Z')
  assert.throws(() => convert({ instant: '0001-01-01T00:00:00Z', fromTimeZone: 'UTC', toTimeZone: 'America/Los_Angeles' }), /outside the supported display years/)
  assert.throws(() => convert({ instant: '2024-01-01T00:00:00+14:01', fromTimeZone: 'UTC', toTimeZone: 'UTC' }), /between -14:00 and \+14:00/)
})

test('enforces the input processing limit', () => {
  assert.throws(() => run(' '.repeat(2_049), {}), /2,048 characters/)
})
