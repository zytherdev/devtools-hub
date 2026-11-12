/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { createHash, webcrypto } = require('node:crypto')
const { tool } = require('../../app/tools/hash-generator/definition.ts')
const { HASH_ALGORITHMS, run } = require('../../app/tools/hash-generator/logic.ts')

const MAX_INPUT_BYTES = 1024 * 1024

async function withWebCrypto(callback) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: webcrypto })
  try {
    return await callback()
  } finally {
    if (previous) Object.defineProperty(globalThis, 'crypto', previous)
    else delete globalThis.crypto
  }
}

test('hash-generator follows the implemented per-tool contract', () => {
  assert.equal(tool.id, 'hash-generator')
  assert.equal(tool.href, '/hash-generator')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.badge, '')
  assert.deepEqual(HASH_ALGORITHMS, ['SHA-256', 'SHA-384', 'SHA-512'])
})

test('generates SHA-256, SHA-384, and SHA-512 UTF-8 hexadecimal digests', async () => {
  await withWebCrypto(async () => {
    const input = 'The quick brown fox jumps over the lazy dog — café 🌱'
    const nodeAlgorithms = { 'SHA-256': 'sha256', 'SHA-384': 'sha384', 'SHA-512': 'sha512' }
    for (const algorithm of HASH_ALGORITHMS) {
      const expected = createHash(nodeAlgorithms[algorithm]).update(input, 'utf8').digest('hex')
      assert.equal(await run(input, { algorithm }), expected)
      assert.match(await run(input, { algorithm }), /^[0-9a-f]+$/)
    }
  })
})

test('uses SHA-256 by default and accepts empty input', async () => {
  await withWebCrypto(async () => {
    assert.equal(
      await run(''),
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    )
  })
})

test('rejects unsupported algorithms and unknown options', async () => {
  await assert.rejects(run('text', { algorithm: 'MD5' }), /Algorithm must be one of: SHA-256, SHA-384, SHA-512/)
  await assert.rejects(run('text', { algorithm: 'sha-256' }), /Algorithm must be one of/)
  await assert.rejects(run('text', { algorithm: 'SHA-1' }), /Algorithm must be one of/)
  await assert.rejects(run('text', { algorithm: null }), /Algorithm must be one of/)
  await assert.rejects(run('text', { algorithm: 'SHA-256', encoding: 'base64' }), /Unknown hash option: "encoding"/)
})

test('requires string input and valid option objects', async () => {
  await assert.rejects(run(123, {}), /Hash input must be text/)
  await assert.rejects(run('text', null), /Hash options must be an object/)
  await assert.rejects(run('text', []), /Hash options must be an object/)
})

test('accepts input at the UTF-8 byte limit', async () => {
  await withWebCrypto(async () => {
    const input = 'a'.repeat(MAX_INPUT_BYTES)
    assert.equal(await run(input), createHash('sha256').update(input, 'utf8').digest('hex'))
  })
})

test('rejects text exceeding the UTF-8 byte limit, including multibyte input', async () => {
  await assert.rejects(run('a'.repeat(MAX_INPUT_BYTES + 1)), /1 MiB hash input limit/)
  const multibyteInput = 'é'.repeat(MAX_INPUT_BYTES / 2 + 1)
  await assert.rejects(run(multibyteInput), /1 MiB hash input limit when encoded as UTF-8/)
})

test('fails clearly when Web Crypto is unavailable', async () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: undefined })
  try {
    await assert.rejects(run('text'), /Browser Web Crypto is unavailable/)
  } finally {
    if (previous) Object.defineProperty(globalThis, 'crypto', previous)
    else delete globalThis.crypto
  }
})
