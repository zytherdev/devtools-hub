/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/slug-generator/definition.ts')
const implementation = require('../../app/tools/slug-generator/logic.ts')

test('slug-generator follows the per-tool contract', () => {
  assert.equal(tool.id, 'slug-generator')
  assert.equal(tool.href, '/slug-generator')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})
