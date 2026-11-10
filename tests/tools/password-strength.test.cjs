/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/password-strength/definition.ts')
const implementation = require('../../app/tools/password-strength/logic.ts')

test('password-strength follows the per-tool contract', () => {
  assert.equal(tool.id, 'password-strength')
  assert.equal(tool.href, '/password-strength')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})
