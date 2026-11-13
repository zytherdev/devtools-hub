/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { webcrypto } = require('node:crypto')
const fs = require('node:fs')
const { tool } = require('../../app/tools/aes-encryptor/definition.ts')
const { AES_ALGORITHM, AES_MODES, MAX_ENCRYPTIONS_PER_PAGE, MAX_PASSWORD_BYTES, MAX_PAYLOAD_CHARACTERS, MAX_PLAINTEXT_BYTES, PBKDF2_ITERATIONS, run } = require('../../app/tools/aes-encryptor/logic.ts')

const password = 'correct horse battery staple'

async function withWebCrypto(callback, cryptoApi = webcrypto) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: cryptoApi })
  try {
    return await callback()
  } finally {
    if (previous) Object.defineProperty(globalThis, 'crypto', previous)
    else delete globalThis.crypto
  }
}

function options(mode = 'encrypt', secret = password) {
  return { mode, password: secret }
}

function decodeBase64Url(value) {
  return Buffer.from(value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4), 'base64')
}

test('aes-encryptor follows the implemented per-tool contract and dynamic route identity', () => {
  assert.equal(tool.id, 'aes-encryptor')
  assert.equal(tool.href, '/aes-encryptor')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.badge, '')
  assert.deepEqual(AES_MODES, ['encrypt', 'decrypt'])
})

test('encrypts and decrypts UTF-8 text with authenticated AES-256-GCM', async () => {
  await withWebCrypto(async () => {
    const plaintext = 'Protected note: naïve café 🌿\nsecond line'
    const encoded = await run(plaintext, options())
    const payload = JSON.parse(encoded)
    assert.deepEqual(Object.keys(payload).sort(), ['algorithm', 'ciphertext', 'encoding', 'iterations', 'iv', 'kdf', 'kdfHash', 'salt', 'version'].sort())
    assert.equal(payload.version, 1)
    assert.equal(payload.algorithm, AES_ALGORITHM)
    assert.equal(payload.kdf, 'PBKDF2')
    assert.equal(payload.kdfHash, 'SHA-256')
    assert.equal(payload.iterations, PBKDF2_ITERATIONS)
    assert.equal(payload.encoding, 'base64url')
    assert.equal(decodeBase64Url(payload.salt).length, 16)
    assert.equal(decodeBase64Url(payload.iv).length, 12)
    assert.equal(decodeBase64Url(payload.ciphertext).length, Buffer.byteLength(plaintext) + 16)
    assert.equal(encoded.includes(password), false)
    assert.equal(await run(encoded, options('decrypt')), plaintext)
  })
})

test('payload parameters derive a non-extractable 256-bit AES key with PBKDF2 and GCM tag', async () => {
  await withWebCrypto(async () => {
    const plaintext = 'known crypto expectation'
    const payload = JSON.parse(await run(plaintext, options()))
    const material = await webcrypto.subtle.importKey('raw', Buffer.from(password), 'PBKDF2', false, ['deriveKey'])
    const key = await webcrypto.subtle.deriveKey(
      { name: 'PBKDF2', hash: 'SHA-256', salt: decodeBase64Url(payload.salt), iterations: PBKDF2_ITERATIONS },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt'],
    )
    assert.equal(key.algorithm.name, 'AES-GCM')
    assert.equal(key.algorithm.length, 256)
    assert.equal(key.extractable, false)
    const decrypted = await webcrypto.subtle.decrypt(
      { name: 'AES-GCM', iv: decodeBase64Url(payload.iv), tagLength: 128 },
      key,
      decodeBase64Url(payload.ciphertext),
    )
    assert.equal(new TextDecoder().decode(decrypted), plaintext)
  })
})

test('generates a fresh nonce and retries instead of reusing a duplicate nonce', async () => {
  await withWebCrypto(async () => {
    const first = JSON.parse(await run('one', options()))
    const second = JSON.parse(await run('two', options()))
    assert.notEqual(first.iv, second.iv)
  })

  const controlledCrypto = {
    subtle: webcrypto.subtle,
    ivCalls: 0,
    getRandomValues(array) {
      if (array.byteLength === 12) {
        this.ivCalls += 1
        array.fill(this.ivCalls <= 2 ? 1 : 2)
      } else {
        array.fill(7)
      }
      return array
    },
  }
  await withWebCrypto(async () => {
    const first = JSON.parse(await run('one', options()))
    const second = JSON.parse(await run('two', options()))
    assert.notEqual(first.iv, second.iv)
    assert.equal(controlledCrypto.ivCalls, 3, 'second encryption must retry the duplicate nonce once')
  }, controlledCrypto)
})

test('supports empty plaintext while enforcing the encryption passphrase minimum', async () => {
  await withWebCrypto(async () => {
    const payload = await run('', options())
    assert.equal(await run(payload, options('decrypt')), '')
  })
  await assert.rejects(run('text', options('encrypt', 'short')), /at least 12 characters/)
  await assert.rejects(run('text', options('encrypt', 'é'.repeat(MAX_PASSWORD_BYTES / 2 + 1))), /4 KiB UTF-8 limit/)
})

test('rejects invalid input, malformed options, passwords and unsupported values', async () => {
  await assert.rejects(run(42, options()), /AES input must be text/)
  await assert.rejects(run('text', null), /AES options must be an object/)
  await assert.rejects(run('text', []), /AES options must be an object/)
  await assert.rejects(run('text', Object.create({ password })), /plain object/)
  await assert.rejects(run('text', { mode: 'encrypt', password, key: 'hidden' }), /Unknown AES option: "key"/)
  await assert.rejects(run('text', { mode: 'cbc', password }), /Mode must be one of: encrypt, decrypt/)
  await assert.rejects(run('text', { mode: 'encrypt', password: '' }), /non-empty password is required/)
  await assert.rejects(run('text', { mode: 'encrypt', password: 123 }), /non-empty password is required/)
  await assert.rejects(run('x'.repeat(MAX_PLAINTEXT_BYTES + 1), options()), /1 MiB UTF-8 limit/)
  await assert.rejects(run('text', options('encrypt', 'p'.repeat(MAX_PASSWORD_BYTES + 1))), /4 KiB UTF-8 limit/)
})

test('rejects malformed payload JSON, unsupported parameters, invalid base64url and lengths', async () => {
  const base = {
    version: 1,
    algorithm: AES_ALGORITHM,
    kdf: 'PBKDF2',
    kdfHash: 'SHA-256',
    iterations: PBKDF2_ITERATIONS,
    encoding: 'base64url',
    salt: Buffer.alloc(16, 1).toString('base64url'),
    iv: Buffer.alloc(12, 2).toString('base64url'),
    ciphertext: Buffer.alloc(16, 3).toString('base64url'),
  }
  await assert.rejects(run('{', options('decrypt')), /valid AES encrypted JSON payload/)
  await assert.rejects(run('[]', options('decrypt')), /must be a JSON object/)
  await assert.rejects(run(JSON.stringify({ ...base, version: 2 }), options('decrypt')), /unsupported encryption parameters/)
  await assert.rejects(run(JSON.stringify({ ...base, extra: 'field' }), options('decrypt')), /unsupported or unexpected structure/)
  await assert.rejects(run(JSON.stringify({ ...base, salt: '###' }), options('decrypt')), /invalid salt encoding/)
  await assert.rejects(run(JSON.stringify({ ...base, iv: 'AQ' }), options('decrypt')), /invalid nonce length/)
  await assert.rejects(run(JSON.stringify({ ...base, ciphertext: 'AQ' }), options('decrypt')), /invalid ciphertext length/)
})

test('rejects ciphertext tampering and incorrect passwords without disclosing either secret', async () => {
  await withWebCrypto(async () => {
    const secretText = 'classified plaintext'
    const payload = JSON.parse(await run(secretText, options()))
    const ciphertext = decodeBase64Url(payload.ciphertext)
    ciphertext[0] ^= 1
    const tampered = JSON.stringify({ ...payload, ciphertext: ciphertext.toString('base64url') })
    const attempts = [JSON.stringify(payload), tampered]
    for (const encryptedInput of attempts) {
      await assert.rejects(run(encryptedInput, options('decrypt', encryptedInput === tampered ? password : 'not the password')), error => {
        assert.match(error.message, /password may be incorrect or the payload may be modified or corrupted/)
        assert.equal(error.message.includes(password), false)
        assert.equal(error.message.includes(secretText), false)
        return true
      })
    }
  })
})

test('accepts the plaintext byte limit and rejects oversized UTF-8 and payload input', async () => {
  await withWebCrypto(async () => {
    const boundary = 'a'.repeat(MAX_PLAINTEXT_BYTES)
    const payload = await run(boundary, options())
    assert.equal((await run(payload, options('decrypt'))).length, MAX_PLAINTEXT_BYTES)
  })
  await assert.rejects(run('é'.repeat(MAX_PLAINTEXT_BYTES / 2 + 1), options()), /1 MiB UTF-8 limit/)
  await assert.rejects(run(' '.repeat(MAX_PAYLOAD_CHARACTERS + 1), options('decrypt')), /2 MiB character limit/)
})

test('reports Web Crypto unavailability without falling back to a server or weak crypto', async () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: undefined })
  try {
    await assert.rejects(run('text', options()), /Browser Web Crypto is unavailable/)
  } finally {
    if (previous) Object.defineProperty(globalThis, 'crypto', previous)
    else delete globalThis.crypto
  }
})

test('keeps passwords masked and empty by default, reports local processing, and documents key loss', () => {
  const source = fs.readFileSync('app/tools/aes-encryptor/Tool.tsx', 'utf8')
  const readme = fs.readFileSync('app/tools/aes-encryptor/README.md', 'utf8')
  assert.match(source, /type="password"/)
  assert.match(source, /useState\(''\)/)
  assert.match(source, /Your text and password stay in this browser/)
  assert.match(source, /does not send or store your text, password, or payload/)
  assert.doesNotMatch(source, /console\.(?:log|info|warn|error)/)
  assert.match(readme, /If you lose either the password or the only copy of the encrypted payload, the original plaintext cannot be recovered/)
  assert.match(readme, /Nonce duplicates are detected and rejected for the lifetime of the current page/i)
  assert.match(readme, /cannot mathematically guarantee global uniqueness/i)
  assert.ok(MAX_ENCRYPTIONS_PER_PAGE > 0)
})
