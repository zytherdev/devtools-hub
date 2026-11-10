/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/mime-type-validator/definition.ts')
const implementation = require('../../app/tools/mime-type-validator/logic.ts')

test('mime-type-validator follows the per-tool contract', () => {
  assert.equal(tool.id, 'mime-type-validator')
  assert.equal(tool.href, '/mime-type-validator')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})
