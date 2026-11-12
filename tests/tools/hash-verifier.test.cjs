/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { createHash, webcrypto } = require('node:crypto')
const { tool } = require('../../app/tools/hash-verifier/definition.ts')
const { HASH_ALGORITHMS, MAX_INPUT_BYTES, run, verifyHash } = require('../../app/tools/hash-verifier/logic.ts')

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

const nodeAlgorithms = { 'SHA-256': 'sha256', 'SHA-384': 'sha384', 'SHA-512': 'sha512' }
const digestFor = (text, algorithm = 'SHA-256') => createHash(nodeAlgorithms[algorithm]).update(text, 'utf8').digest('hex')

test('hash-verifier follows the implemented per-tool contract', () => {
  assert.equal(tool.id, 'hash-verifier')
  assert.equal(tool.href, '/hash-verifier')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.badge, '')
  assert.deepEqual(HASH_ALGORITHMS, ['SHA-256', 'SHA-384', 'SHA-512'])
})

test('matches valid UTF-8 digests for every supported algorithm', async () => {
  await withWebCrypto(async () => {
    const input = 'The quick brown fox jumps over the lazy dog — café 🌱'
    for (const algorithm of HASH_ALGORITHMS) {
      const expectedDigest = digestFor(input, algorithm)
      const result = await verifyHash(input, expectedDigest.toUpperCase(), algorithm)
      assert.equal(result.matches, true)
      assert.equal(result.expectedDigest, expectedDigest)
      assert.equal(result.computedDigest, expectedDigest)
      assert.match(await run(input, { expectedDigest, algorithm }), /^MATCH\n/)
    }
  })
})

test('reports a mismatch and still returns the computed digest', async () => {
  await withWebCrypto(async () => {
    const expectedDigest = digestFor('different text')
    const output = await run('original text', { expectedDigest })
    assert.match(output, /^NO MATCH\n/)
    assert.match(output, new RegExp(`Computed digest: ${digestFor('original text')}`))
    assert.equal((await verifyHash('original text', expectedDigest)).matches, false)
  })
})

test('uses SHA-256 by default and accepts empty text', async () => {
  await withWebCrypto(async () => {
    const expectedDigest = digestFor('')
    assert.match(await run('', { expectedDigest }), /^MATCH\nAlgorithm: SHA-256/)
  })
})

test('rejects malformed expected digests and unsupported algorithms', async () => {
  const good = digestFor('text')
  await assert.rejects(run('text', {}), /Expected digest is required/)
  await assert.rejects(verifyHash('text', 'md5', 'MD5'), /Algorithm must be one of/)
  await assert.rejects(verifyHash('text', good, 'SHA-1'), /Algorithm must be one of/)
  await assert.rejects(verifyHash('text', good.slice(1)), /exactly 64 hexadecimal characters/)
  await assert.rejects(verifyHash('text', `${good}0`), /exactly 64 hexadecimal characters/)
  await assert.rejects(verifyHash('text', ` ${good}`), /exactly 64 hexadecimal characters/)
  await assert.rejects(verifyHash('text', `${good.slice(0, 63)}g`), /exactly 64 hexadecimal characters/)
  await assert.rejects(verifyHash('text', null), /Expected digest must be hexadecimal text/)
})

test('rejects unknown and malformed options and non-text input', async () => {
  await assert.rejects(run('text', { algorithm: 'sha-256', expectedDigest: digestFor('text') }), /Algorithm must be one of/)
  await assert.rejects(run('text', { algorithm: 'SHA-256', expectedDigest: digestFor('text'), encoding: 'hex' }), /Unknown hash option: "encoding"/)
  await assert.rejects(run('text', null), /Hash options must be an object/)
  await assert.rejects(run('text', []), /Hash options must be an object/)
  await assert.rejects(verifyHash(123, digestFor('text')), /Hash input must be text/)
})

test('accepts text exactly at the UTF-8 byte limit', async () => {
  await withWebCrypto(async () => {
    const input = 'a'.repeat(MAX_INPUT_BYTES)
    assert.match(await run(input, { expectedDigest: digestFor(input) }), /^MATCH\n/)
  })
})

test('rejects text above the UTF-8 byte limit, including multibyte text', async () => {
  await assert.rejects(verifyHash('a'.repeat(MAX_INPUT_BYTES + 1), digestFor('')), /1 MiB hash input limit/)
  const multibyteText = 'é'.repeat(MAX_INPUT_BYTES / 2 + 1)
  await assert.rejects(verifyHash(multibyteText, digestFor('')), /1 MiB hash input limit when encoded as UTF-8/)
})

test('fails clearly when Web Crypto is unavailable', async () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: undefined })
  try {
    await assert.rejects(verifyHash('text', digestFor('text')), /Browser Web Crypto is unavailable/)
  } finally {
    if (previous) Object.defineProperty(globalThis, 'crypto', previous)
    else delete globalThis.crypto
  }
})
