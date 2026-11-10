/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/currency-converter/definition.ts')
const implementation = require('../../app/tools/currency-converter/logic.ts')

test('currency-converter follows the per-tool contract', () => {
  assert.equal(tool.id, 'currency-converter')
  assert.equal(tool.href, '/currency-converter')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})
