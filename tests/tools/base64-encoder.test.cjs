/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/base64-encoder/definition.ts')
const implementation = require('../../app/tools/base64-encoder/logic.ts')

test('base64-encoder follows the per-tool contract', () => {
  assert.equal(tool.id, 'base64-encoder')
  assert.equal(tool.href, '/base64-encoder')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})

const { run } = require('../../app/tools/base64-encoder/logic.ts')

test('Base64 round-trips Unicode text', () => {
  const text = 'DevTools Hub — café 🌱'
  assert.equal(run(run(text, { operation: 'encode' }), { operation: 'decode' }), text)
})

test('Base64 rejects malformed UTF-8 rather than replacing bytes', () => {
  assert.throws(() => run('////', { operation: 'decode' }), /UTF-8|encoded data/i)
})
