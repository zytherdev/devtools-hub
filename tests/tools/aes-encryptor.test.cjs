/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/aes-encryptor/definition.ts')
const implementation = require('../../app/tools/aes-encryptor/logic.ts')

test('aes-encryptor follows the per-tool contract', () => {
  assert.equal(tool.id, 'aes-encryptor')
  assert.equal(tool.href, '/aes-encryptor')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})
