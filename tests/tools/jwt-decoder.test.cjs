/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/jwt-decoder/definition.ts')
const implementation = require('../../app/tools/jwt-decoder/logic.ts')

test('jwt-decoder follows the per-tool contract', () => {
  assert.equal(tool.id, 'jwt-decoder')
  assert.equal(tool.href, '/jwt-decoder')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})

const { run } = require('../../app/tools/jwt-decoder/logic.ts')

test('JWT decoder marks data untrusted and redacts credential-like claims', () => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({ sub: 'demo', password: 'do-not-show' })).toString('base64url')
  const decoded = JSON.parse(run(`${header}.${payload}.AA`, {}))
  assert.equal(decoded.header.alg, 'HS256')
  assert.equal(decoded.payload.sub, 'demo')
  assert.equal(decoded.payload.password, '[REDACTED]')
  assert.equal(decoded.security.signatureVerified, false)
  assert.equal(decoded.security.trusted, false)
})

test('JWT decoder rejects malformed compact tokens', () => {
  assert.throws(() => run('not-a-jwt', {}), /expected exactly three/i)
})
