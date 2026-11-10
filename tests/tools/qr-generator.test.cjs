/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/qr-generator/definition.ts')
const implementation = require('../../app/tools/qr-generator/logic.ts')

test('qr-generator follows the per-tool contract', () => {
  assert.equal(tool.id, 'qr-generator')
  assert.equal(tool.href, '/qr-generator')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})
