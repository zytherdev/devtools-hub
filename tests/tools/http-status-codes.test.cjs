/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/http-status-codes/definition.ts')
const implementation = require('../../app/tools/http-status-codes/logic.ts')

test('http-status-codes follows the per-tool contract', () => {
  assert.equal(tool.id, 'http-status-codes')
  assert.equal(tool.href, '/http-status-codes')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})
