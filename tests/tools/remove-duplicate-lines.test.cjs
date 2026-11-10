/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/remove-duplicate-lines/definition.ts')
const implementation = require('../../app/tools/remove-duplicate-lines/logic.ts')

test('remove-duplicate-lines follows the per-tool contract', () => {
  assert.equal(tool.id, 'remove-duplicate-lines')
  assert.equal(tool.href, '/remove-duplicate-lines')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})
