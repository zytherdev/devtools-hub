/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/curl-to-code/definition.ts')
const implementation = require('../../app/tools/curl-to-code/logic.ts')

test('curl-to-code follows the per-tool contract', () => {
  assert.equal(tool.id, 'curl-to-code')
  assert.equal(tool.href, '/curl-to-code')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})
