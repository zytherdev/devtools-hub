/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/jwt-generator/definition.ts')
const implementation = require('../../app/tools/jwt-generator/logic.ts')

test('jwt-generator follows the per-tool contract', () => {
  assert.equal(tool.id, 'jwt-generator')
  assert.equal(tool.href, '/jwt-generator')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})

const { run } = require('../../app/tools/jwt-generator/logic.ts')
const { run: decode } = require('../../app/tools/jwt-decoder/logic.ts')

test('JWT generator creates a compact local HS256 token', async () => {
  const token = await run('{"sub":"demo"}', { secret: 'local-test-secret' })
  assert.equal(token.split('.').length, 3)
  const decoded = JSON.parse(decode(token, {}))
  assert.equal(decoded.header.alg, 'HS256')
  assert.equal(decoded.payload.sub, 'demo')
  assert.equal(decoded.security.signatureVerified, false)
})

test('JWT generator requires an explicit secret', async () => {
  await assert.rejects(run('{"sub":"demo"}', {}), /secret.*required/i)
})
