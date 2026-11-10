/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/box-shadow-generator/definition.ts')
const implementation = require('../../app/tools/box-shadow-generator/logic.ts')

test('box-shadow-generator follows the per-tool contract', () => {
  assert.equal(tool.id, 'box-shadow-generator')
  assert.equal(tool.href, '/box-shadow-generator')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})
