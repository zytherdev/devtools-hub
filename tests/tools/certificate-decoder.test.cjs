/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/certificate-decoder/definition.ts')
const implementation = require('../../app/tools/certificate-decoder/logic.ts')

test('certificate-decoder follows the per-tool contract', () => {
  assert.equal(tool.id, 'certificate-decoder')
  assert.equal(tool.href, '/certificate-decoder')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})
