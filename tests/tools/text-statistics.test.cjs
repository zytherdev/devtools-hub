/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/text-statistics/definition.ts')
const implementation = require('../../app/tools/text-statistics/logic.ts')

test('text-statistics follows the per-tool contract', () => {
  assert.equal(tool.id, 'text-statistics')
  assert.equal(tool.href, '/text-statistics')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})
