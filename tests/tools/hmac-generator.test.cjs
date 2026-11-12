/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { createHmac, webcrypto } = require('node:crypto')
const fs = require('node:fs')
const { tool } = require('../../app/tools/hmac-generator/definition.ts')
const { HMAC_ALGORITHMS, HMAC_ENCODINGS, run } = require('../../app/tools/hmac-generator/logic.ts')

const MAX_INPUT_BYTES = 1024 * 1024
const MAX_SECRET_KEY_BYTES = 64 * 1024
const nodeAlgorithms = { 'SHA-256': 'sha256', 'SHA-384': 'sha384', 'SHA-512': 'sha512' }

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

function expectedDigest(message, secretKey, algorithm, encoding) {
  const digest = createHmac(nodeAlgorithms[algorithm], secretKey).update(message, 'utf8').digest()
  if (encoding === 'hex') return digest.toString('hex')
  if (encoding === 'base64') return digest.toString('base64')
  return digest.toString('base64url')
}

test('hmac-generator follows the implemented per-tool contract', () => {
  assert.equal(tool.id, 'hmac-generator')
  assert.equal(tool.href, '/hmac-generator')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.badge, '')
  assert.deepEqual(HMAC_ALGORITHMS, ['SHA-256', 'SHA-384', 'SHA-512'])
  assert.deepEqual(HMAC_ENCODINGS, ['hex', 'base64', 'base64url'])
  const source = fs.readFileSync('app/tools/hmac-generator/Tool.tsx', 'utf8')
  assert.match(source, /type=\{showSecretKey \? 'text' : 'password'\}/)
  assert.doesNotMatch(source, /UniversalTool/)
})

test('generates UTF-8 HMACs for every supported algorithm and encoding', async () => {
  await withWebCrypto(async () => {
    const input = 'The quick brown fox jumps over the lazy dog — café 🌱'
    const secretKey = 'clé secrète 🔐'
    for (const algorithm of HMAC_ALGORITHMS) {
      for (const encoding of HMAC_ENCODINGS) {
        const options = { secretKey, algorithm, encoding }
        const actual = await run(input, options)
        assert.equal(actual, expectedDigest(input, secretKey, algorithm, encoding))
        if (encoding === 'hex') assert.match(actual, /^[0-9a-f]+$/)
        if (encoding === 'base64') assert.match(actual, /^[A-Za-z0-9+/]+={0,2}$/)
        if (encoding === 'base64url') assert.match(actual, /^[A-Za-z0-9_-]+$/)
      }
    }
  })
})

test('defaults to SHA-256 and hexadecimal output and permits an empty message', async () => {
  await withWebCrypto(async () => {
    const secretKey = 'local-test-key'
    const expected = createHmac('sha256', secretKey).update('', 'utf8').digest('hex')
    assert.equal(await run('', { secretKey }), expected)
    assert.equal(await run('', { secretKey, encoding: 'hex' }), expected)
  })
})

test('rejects missing, empty, or non-string secret keys without exposing their value', async () => {
  const sensitiveValue = 'do-not-include-this-secret'
  await assert.rejects(run('message'), error => {
    assert.match(error.message, /non-empty secretKey string is required/)
    assert.equal(error.message.includes(sensitiveValue), false)
    return true
  })
  await assert.rejects(run('message', { secretKey: '' }), /non-empty secretKey string is required/)
  await assert.rejects(run('message', { secretKey: 123 }), /non-empty secretKey string is required/)
})

test('rejects unsupported algorithms, encodings, and unknown options', async () => {
  const secretKey = 'secret'
  await assert.rejects(run('text', { secretKey, algorithm: 'MD5' }), /Algorithm must be one of: SHA-256, SHA-384, SHA-512/)
  await assert.rejects(run('text', { secretKey, algorithm: 'sha-256' }), /Algorithm must be one of/)
  await assert.rejects(run('text', { secretKey, algorithm: null }), /Algorithm must be one of/)
  await assert.rejects(run('text', { secretKey, encoding: 'base32' }), /Encoding must be one of: hex, base64, base64url/)
  await assert.rejects(run('text', { secretKey, encoding: 'HEX' }), /Encoding must be one of/)
  await assert.rejects(run('text', { secretKey, encoding: null }), /Encoding must be one of/)
  await assert.rejects(run('text', { secretKey, key: 'another secret' }), /Unknown HMAC option: "key"/)
})

test('requires string input and a plain options object', async () => {
  await assert.rejects(run(123, { secretKey: 'secret' }), /HMAC input must be text/)
  await assert.rejects(run('text', null), /HMAC options must be an object/)
  await assert.rejects(run('text', []), /HMAC options must be an object/)
  await assert.rejects(run('text', Object.create({ secretKey: 'secret' })), /HMAC options must be a plain object/)
})

test('accepts message text and key at their UTF-8 byte limits', async () => {
  await withWebCrypto(async () => {
    const input = 'a'.repeat(MAX_INPUT_BYTES)
    const secretKey = 'k'.repeat(MAX_SECRET_KEY_BYTES)
    assert.equal(await run(input, { secretKey }), createHmac('sha256', secretKey).update(input, 'utf8').digest('hex'))
    assert.equal(await run('', { secretKey }), createHmac('sha256', secretKey).update('', 'utf8').digest('hex'))
  })
})

test('rejects oversized messages and keys, including multibyte UTF-8 boundaries', async () => {
  await assert.rejects(run('a'.repeat(MAX_INPUT_BYTES + 1), { secretKey: 'secret' }), /1 MiB input limit/)
  await assert.rejects(run('é'.repeat(MAX_INPUT_BYTES / 2 + 1), { secretKey: 'secret' }), /1 MiB input limit when encoded as UTF-8/)
  await assert.rejects(run('text', { secretKey: 'k'.repeat(MAX_SECRET_KEY_BYTES + 1) }), /64 KiB HMAC key limit/)
  await assert.rejects(run('text', { secretKey: 'é'.repeat(MAX_SECRET_KEY_BYTES / 2 + 1) }), /64 KiB key limit when encoded as UTF-8/)
})

test('fails clearly when browser Web Crypto is unavailable', async () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: undefined })
  try {
    await assert.rejects(run('text', { secretKey: 'secret' }), /Browser Web Crypto is unavailable/)
  } finally {
    if (previous) Object.defineProperty(globalThis, 'crypto', previous)
    else delete globalThis.crypto
  }
})
