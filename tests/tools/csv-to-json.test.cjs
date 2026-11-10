/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/csv-to-json/definition.ts')
const implementation = require('../../app/tools/csv-to-json/logic.ts')

test('csv-to-json follows the per-tool contract', () => {
  assert.equal(tool.id, 'csv-to-json')
  assert.equal(tool.href, '/csv-to-json')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})

const { run } = require('../../app/tools/csv-to-json/logic.ts')

test('CSV to JSON parses quoted delimiters and infers requested types', () => {
  const result = JSON.parse(run('name,score,active\n"Ada, Lovelace",42,true\nGrace,36,false', { headers: 'true', infer: 'true', structure: 'objects', indent: '0' }))
  assert.deepEqual(result, [{ name: 'Ada, Lovelace', score: 42, active: true }, { name: 'Grace', score: 36, active: false }])
})

test('CSV to JSON reports malformed quoted fields with row context', () => {
  assert.throws(() => run('name\n"unfinished', {}), /Unterminated quoted field.*row 2/)
})
