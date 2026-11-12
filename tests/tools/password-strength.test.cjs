/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/password-strength/definition.ts')
const { MAX_PASSWORD_LENGTH, estimatePasswordStrength, run } = require('../../app/tools/password-strength/logic.ts')

test('password-strength follows the per-tool contract', () => {
  assert.equal(tool.id, 'password-strength')
  assert.equal(tool.href, '/password-strength')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.badge, '')
  assert.deepEqual(tool.defaultOptions, {})
  assert.equal(typeof run, 'function')
})

test('estimates give bounded scores and actionable feedback', () => {
  const empty = estimatePasswordStrength('')
  assert.deepEqual(empty, {
    score: 0,
    level: 'Very weak',
    characterCount: 0,
    feedback: ['Enter a password to receive a local estimate.'],
  })
  const short = estimatePasswordStrength('abc')
  assert.equal(short.level, 'Very weak')
  assert.ok(short.feedback.some(message => /at least 12 characters/.test(message)))

  const stronger = estimatePasswordStrength('River!Cobalt7-Moon')
  assert.ok(stronger.score >= 3)
  assert.ok(stronger.score <= 4)
  assert.equal(stronger.level, ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'][stronger.score])
  assert.ok(stronger.feedback.length > 0)
})

test('common, repeated, and predictable passwords receive explicit warnings', () => {
  const common = estimatePasswordStrength('password')
  assert.equal(common.score, 0)
  assert.ok(common.feedback.some(message => /common passwords/i.test(message)))
  assert.equal(estimatePasswordStrength('Password!2026').score, 0)

  const repeated = estimatePasswordStrength('aaaaaaaaaaaaaaaa')
  assert.ok(repeated.score <= 1)
  assert.ok(repeated.feedback.some(message => /repeating the same character/i.test(message)))

  const sequence = estimatePasswordStrength('ABCDsecurePassword!9')
  assert.ok(sequence.feedback.some(message => /keyboard patterns|consecutive/i.test(message)))
})

test('runner emits a password-free JSON estimate and rejects unknown options', () => {
  const password = 'PrivateExample!123'
  const result = run(password)
  assert.deepEqual(JSON.parse(result), estimatePasswordStrength(password))
  assert.equal(result.includes(password), false)
  assert.throws(() => run(password, { includePassword: true }), /Unsupported option: includePassword/)
  assert.throws(() => run(password, null), /Options must be an object/)
  assert.throws(() => run(password, []), /Options must be an object/)
  assert.throws(() => run(password, Object.create({ inherited: true })), /plain object/)
})

test('rejects non-string input and accepts exactly the Unicode character limit', () => {
  for (const invalid of [null, undefined, 123, {}, []]) {
    assert.throws(() => estimatePasswordStrength(invalid), /Password must be a string/)
  }
  const boundary = '😀'.repeat(MAX_PASSWORD_LENGTH)
  assert.equal(estimatePasswordStrength(boundary).characterCount, MAX_PASSWORD_LENGTH)
  assert.throws(() => estimatePasswordStrength(`${boundary}x`), /256 characters or fewer/)
})

test('the runner applies the same maximum to ordinary and multi-code-unit characters', () => {
  assert.equal(JSON.parse(run('x'.repeat(MAX_PASSWORD_LENGTH))).characterCount, MAX_PASSWORD_LENGTH)
  assert.throws(() => run('x'.repeat(MAX_PASSWORD_LENGTH + 1)), /256 characters or fewer/)
})
