/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { tool } = require('../../app/tools/bcrypt-generator/definition.ts')
const implementation = require('../../app/tools/bcrypt-generator/logic.ts')

const FIXTURE_HASH = '$2b$04$abcdefghijklmnopqrstuuoD8yw7MmybLKVooaTGGZAt3HXugv2.a'
const toolDir = path.join(__dirname, '../../app/tools/bcrypt-generator')
const uiSource = fs.readFileSync(path.join(toolDir, 'Tool.tsx'), 'utf8')
const readme = fs.readFileSync(path.join(toolDir, 'README.md'), 'utf8')

test('bcrypt-generator is registered as an implemented dynamic tool', () => {
  assert.equal(tool.id, 'bcrypt-generator')
  assert.equal(tool.href, '/bcrypt-generator')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.defaultOptions.action, 'hash')
  assert.equal(typeof implementation.run, 'function')
})

test('hashing creates a standard bcrypt string and verification matches known and generated hashes', async () => {
  assert.equal(FIXTURE_HASH.length, 60)
  assert.equal(await implementation.verifyPassword('test', FIXTURE_HASH), true)
  assert.equal(await implementation.verifyPassword('not the password', FIXTURE_HASH), false)

  const generated = await implementation.hashPassword('correct horse battery staple', 4)
  assert.match(generated, /^\$2b\$04\$[./A-Za-z0-9]{53}$/)
  assert.equal(generated.length, 60)
  assert.equal(await implementation.verifyPassword('correct horse battery staple', generated), true)
  assert.equal(await implementation.verifyPassword('incorrect', generated), false)
})

test('text-tool API hashes by default and verifies without exposing the password', async () => {
  const generated = await implementation.run('a private test password', { cost: '4' })
  assert.match(generated, /^\$2b\$04\$/)
  assert.equal(await implementation.run('test', { action: 'verify', hash: FIXTURE_HASH }), 'Match')
  assert.equal(await implementation.run('wrong', { action: 'verify', hash: FIXTURE_HASH }), 'No match')
  assert.doesNotMatch(generated, /a private test password/)
})

test('empty, malformed, unknown, and contradictory inputs are rejected safely', async () => {
  await assert.rejects(implementation.hashPassword(''), /cannot be empty/i)
  await assert.rejects(implementation.verifyPassword('', FIXTURE_HASH), /cannot be empty/i)
  await assert.rejects(implementation.verifyPassword('test', 'not-a-bcrypt-hash'), /valid bcrypt hash/i)
  await assert.rejects(implementation.verifyPassword('test', '$2b$15$' + '.'.repeat(53)), /cost must be from 4 to 14/i)
  await assert.rejects(implementation.run('secret', { action: 'other' }), /action must be either/i)
  await assert.rejects(implementation.run('secret', { cost: '4.5' }), /cost must be an integer/i)
  await assert.rejects(implementation.run('secret', { cost: '3' }), /cost must be an integer from 4 to 14/i)
  await assert.rejects(implementation.run('secret', { cost: '15' }), /cost must be an integer from 4 to 14/i)
  await assert.rejects(implementation.run('secret', { unexpected: 'value' }), /unknown bcrypt option/i)
  await assert.rejects(implementation.run('secret', { action: 'verify' }), /hash is required/i)
  await assert.rejects(implementation.run('secret', { action: 'hash', hash: FIXTURE_HASH }), /only used with the verify/i)
  await assert.rejects(implementation.run('secret', { action: 'verify', hash: FIXTURE_HASH, cost: '4' }), /only used with the hash/i)
  await assert.rejects(implementation.hashPassword('secret', 3), /cost must be an integer from 4 to 14/i)
  await assert.rejects(implementation.hashPassword('secret', 15), /cost must be an integer from 4 to 14/i)
  await assert.rejects(implementation.run('secret', { cost: '15' }), error => {
    assert.doesNotMatch(error.message, /secret/)
    return true
  })
})

test('72 UTF-8 bytes are accepted and over-limit ASCII or multibyte passwords are rejected', async () => {
  const asciiBoundary = 'a'.repeat(72)
  const multibyteBoundary = 'é'.repeat(36)
  assert.equal(new TextEncoder().encode(multibyteBoundary).byteLength, 72)
  const asciiHash = await implementation.hashPassword(asciiBoundary, 4)
  const multibyteHash = await implementation.hashPassword(multibyteBoundary, 4)
  assert.equal(await implementation.verifyPassword(asciiBoundary, asciiHash), true)
  assert.equal(await implementation.verifyPassword(multibyteBoundary, multibyteHash), true)
  await assert.rejects(implementation.hashPassword('a'.repeat(73), 4), /72-byte input limit/i)
  await assert.rejects(implementation.hashPassword('é'.repeat(37), 4), /72-byte input limit/i)
  await assert.rejects(implementation.verifyPassword('a'.repeat(73), FIXTURE_HASH), /72-byte input limit/i)
})

test('password UI is masked by default and the documented processing avoids persistence and logging', () => {
  assert.match(uiSource, /type=\{showPassword\s*\?\s*'text'\s*:\s*'password'\}/)
  assert.match(uiSource, /useState\(false\)/)
  assert.match(uiSource, /aria-label=\{showPassword\s*\?\s*'Hide password'\s*:\s*'Show password'\}/)
  assert.doesNotMatch(uiSource, /console\.(?:log|info|warn|error)\s*\(/)
  assert.doesNotMatch(uiSource, /\b(?:localStorage|sessionStorage)\b/)
  assert.match(uiSource, /hashPassword\(password, Number\(cost\)\)/)
  assert.match(uiSource, /verifyPassword\(password, encodedHash\)/)
  assert.match(readme, /does not send the password or hash to an API or network endpoint/i)
  assert.match(readme, /does not put either value in the URL, browser storage, or application logs/i)
  assert.match(readme, /JavaScript cannot reliably erase immutable strings from browser memory/i)
  assert.match(readme, /bcrypt is intentionally computationally expensive/i)
  assert.match(readme, /72 UTF-8 bytes/i)
})
