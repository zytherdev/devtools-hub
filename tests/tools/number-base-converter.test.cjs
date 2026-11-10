/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/number-base-converter/definition.ts')
const implementation = require('../../app/tools/number-base-converter/logic.ts')

test('number-base-converter follows the per-tool contract', () => {
  assert.equal(tool.id, 'number-base-converter')
  assert.equal(tool.href, '/number-base-converter')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})
