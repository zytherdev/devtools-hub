/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { webcrypto } = require('node:crypto')
const { tool } = require('../../app/tools/rsa-key-generator/definition.ts')
const implementation = require('../../app/tools/rsa-key-generator/logic.ts')

const uiSource = fs.readFileSync(path.join(__dirname, '../../app/tools/rsa-key-generator/Tool.tsx'), 'utf8')

function pemBody(pem) {
  return pem.replace(/-----BEGIN [^-]+-----|-----END [^-]+-----|\s/g, '')
}

function pemToBytes(pem) {
  return Buffer.from(pemBody(pem), 'base64')
}

test('rsa-key-generator is implemented and uses its existing dynamic route', () => {
  assert.equal(tool.id, 'rsa-key-generator')
  assert.equal(tool.href, '/rsa-key-generator')
  assert.equal(tool.status, 'implemented')
  assert.deepEqual(tool.defaultOptions, { modulusLength: '2048', algorithm: 'RSA-OAEP', format: 'pem' })
  assert.equal(typeof implementation.generateRsaKeyPair, 'function')
})

test('rejects unsupported, unbounded, or malformed options before generating keys', async () => {
  for (const modulusLength of ['1024', '8192', '2048.5', '', '999999999']) {
    await assert.rejects(
      implementation.generateRsaKeyPair({ modulusLength }),
      /modulus length must be one of 2048, 3072, or 4096 bits/i,
    )
  }
  await assert.rejects(implementation.generateRsaKeyPair({ algorithm: 'RSA1_5' }), /algorithm must be/i)
  await assert.rejects(implementation.generateRsaKeyPair({ format: 'der' }), /format must be/i)
  await assert.rejects(implementation.generateRsaKeyPair({ unexpected: 'value' }), /unknown RSA Key Generator option/i)
  await assert.rejects(implementation.generateRsaKeyPair({ format: 3 }), /must be a string/i)
  await assert.rejects(implementation.run('not empty'), /does not accept input text/i)
})

test('exports correctly labeled PEM keys that can encrypt and decrypt with RSA-OAEP SHA-256', async () => {
  const generated = await implementation.generateRsaKeyPair({ modulusLength: '2048', algorithm: 'RSA-OAEP', format: 'pem' })
  assert.equal(generated.modulusLength, 2048)
  assert.match(generated.publicKey, /^-----BEGIN PUBLIC KEY-----\n[\s\S]+\n-----END PUBLIC KEY-----$/)
  assert.match(generated.privateKey, /^-----BEGIN PRIVATE KEY-----\n[\s\S]+\n-----END PRIVATE KEY-----$/)

  const publicKey = await webcrypto.subtle.importKey(
    'spki', pemToBytes(generated.publicKey), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt'],
  )
  const privateKey = await webcrypto.subtle.importKey(
    'pkcs8', pemToBytes(generated.privateKey), { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['decrypt'],
  )
  const message = new TextEncoder().encode('browser-local RSA round trip')
  const ciphertext = await webcrypto.subtle.encrypt({ name: 'RSA-OAEP' }, publicKey, message)
  const plaintext = await webcrypto.subtle.decrypt({ name: 'RSA-OAEP' }, privateKey, ciphertext)
  assert.equal(new TextDecoder().decode(plaintext), 'browser-local RSA round trip')
})

test('exports JWK keys with matching public/private modulus and usable RSA-PSS signatures', async () => {
  const generated = await implementation.generateRsaKeyPair({ modulusLength: '2048', algorithm: 'RSA-PSS', format: 'jwk' })
  const publicJwk = JSON.parse(generated.publicKey)
  const privateJwk = JSON.parse(generated.privateKey)
  assert.equal(publicJwk.kty, 'RSA')
  assert.equal(privateJwk.kty, 'RSA')
  assert.equal(publicJwk.n, privateJwk.n)
  assert.equal(publicJwk.e, privateJwk.e)
  assert.equal(Object.hasOwn(publicJwk, 'd'), false)
  assert.equal(typeof privateJwk.d, 'string')
  assert.equal(privateJwk.alg, 'PS256')

  const publicKey = await webcrypto.subtle.importKey('jwk', publicJwk, { name: 'RSA-PSS', hash: 'SHA-256' }, false, ['verify'])
  const privateKey = await webcrypto.subtle.importKey('jwk', privateJwk, { name: 'RSA-PSS', hash: 'SHA-256' }, false, ['sign'])
  const message = new TextEncoder().encode('signature integrity check')
  const signature = await webcrypto.subtle.sign({ name: 'RSA-PSS', saltLength: 32 }, privateKey, message)
  assert.equal(await webcrypto.subtle.verify({ name: 'RSA-PSS', saltLength: 32 }, publicKey, signature, message), true)
  const changedMessage = new TextEncoder().encode('modified signature integrity check')
  assert.equal(await webcrypto.subtle.verify({ name: 'RSA-PSS', saltLength: 32 }, publicKey, signature, changedMessage), false)
})

test('keeps private output blank and hidden by default and avoids logging key material', () => {
  assert.match(uiSource, /const \[privateKeyVisible, setPrivateKeyVisible\] = useState\(false\)/)
  assert.match(uiSource, /value=\{privateKeyVisible\s*\?\s*result\.privateKey\s*:\s*''\}/)
  assert.match(uiSource, /Reveal private key/)
  assert.match(uiSource, /disabled=\{!privateKeyVisible\}/)
  assert.match(uiSource, /if \(!result \|\| !privateKeyVisible\) return/)
  assert.match(uiSource, /does not send key material to its server/i)
  assert.doesNotMatch(uiSource, /console\.(?:log|info|debug)\s*\(/)
})
