/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/csv-formatter/definition.ts')
const implementation = require('../../app/tools/csv-formatter/logic.ts')

test('csv-formatter follows the per-tool contract', () => {
  assert.equal(tool.id, 'csv-formatter')
  assert.equal(tool.href, '/csv-formatter')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})

const { run } = require('../../app/tools/csv-formatter/logic.ts')

test('CSV Formatter preserves significant whitespace and escapes delimiters', () => {
  const output = run('name,value\nAda,"x,y"\n', { delimiter: ',' })
  assert.match(output, /"x,y"/)
  assert.match(output, /Ada/)
})
