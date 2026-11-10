/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/svg-to-css/definition.ts')
const implementation = require('../../app/tools/svg-to-css/logic.ts')

test('svg-to-css follows the per-tool contract', () => {
  assert.equal(tool.id, 'svg-to-css')
  assert.equal(tool.href, '/svg-to-css')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})
