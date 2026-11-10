/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const { tool } = require('../../app/tools/password-generator/definition.ts')
const implementation = require('../../app/tools/password-generator/logic.ts')

function withCrypto(value, callback) {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value })
  try {
    return callback()
  } finally {
    if (original) Object.defineProperty(globalThis, 'crypto', original)
    else delete globalThis.crypto
  }
}

function fillWithZeroes() {
  return {
    getRandomValues(bytes) {
      bytes.fill(0)
      return bytes
    },
  }
}

test('password-generator follows the canonical tool contract and uses UniversalTool with an explicit privacy warning', () => {
  assert.equal(tool.id, 'password-generator')
  assert.equal(tool.href, '/password-generator')
  assert.equal(tool.status, 'implemented')
  assert.equal(typeof implementation.run, 'function')
  const view = fs.readFileSync('app/tools/password-generator/Tool.tsx', 'utf8')
  assert.match(view, /UniversalTool/)
  assert.match(view, /not saved or sent/i)
  assert.equal(tool.defaultOptions.length, '20')
  assert.equal(tool.defaultOptions.count, '1')
})

test('generates configured count and length, one password per output line', () => {
  const output = withCrypto(fillWithZeroes(), () => implementation.run('', {
    length: '12', count: '3', uppercase: 'true', lowercase: 'true', numbers: 'true', symbols: 'true',
  }))
  const passwords = output.split('\n')
  assert.equal(passwords.length, 3)
  for (const password of passwords) assert.equal(password.length, 12)
})

test('every selected class is represented and disabled classes are absent', () => {
  const password = withCrypto(fillWithZeroes(), () => implementation.run('', {
    length: '8', uppercase: 'true', lowercase: 'false', numbers: 'true', symbols: 'true',
  }))
  const symbols = `!"#$%&'()*+,-./:;<=>?@[\\]^_\x60{|}~`
  assert.match(password, /[A-Z]/)
  assert.match(password, /\d/)
  assert.ok(password.split('').some(character => symbols.includes(character)))
  assert.doesNotMatch(password, /[a-z]/)
})

test('excludes ambiguous characters from generated secrets when requested', () => {
  const password = withCrypto(fillWithZeroes(), () => implementation.run('', {
    length: '64', excludeAmbiguous: 'true',
  }))
  assert.doesNotMatch(password, /[Il1O0|]/)
})

test('uses Web Crypto with rejection sampling rather than Math.random', () => {
  let calls = 0
  const provider = {
    getRandomValues(bytes) {
      calls += 1
      if (calls === 1) bytes.fill(255) // Out of range for the first bounded draw; must be rejected.
      else bytes.fill(0)
      return bytes
    },
  }
  const password = withCrypto(provider, () => implementation.run('', {
    length: '8', uppercase: 'true', lowercase: 'false', numbers: 'false', symbols: 'false',
  }))
  assert.equal(password.length, 8)
  assert.ok(calls > 8, 'the out-of-range candidate should be rejected and retried')
  assert.doesNotMatch(fs.readFileSync('app/tools/password-generator/logic.ts', 'utf8'), /Math\.random/)
})

test('fails closed when Web Crypto is missing or its random provider fails', () => {
  assert.throws(
    () => withCrypto(undefined, () => implementation.run('', {})),
    /Web Crypto is not supported/,
  )
  assert.throws(
    () => withCrypto({ getRandomValues() { throw new Error('unavailable') } }, () => implementation.run('', {})),
    /Web Crypto could not provide random bytes/,
  )
})

test('rejects empty alphabets and malformed or unknown options', () => {
  assert.throws(() => implementation.run('', {
    uppercase: 'false', lowercase: 'false', numbers: 'false', symbols: 'false',
  }), /at least one character class/)
  assert.throws(() => implementation.run('seed text', {}), /does not accept input text/)
  assert.throws(() => implementation.run('', { extra: 'true' }), /Unknown option/)
  assert.throws(() => implementation.run('', { uppercase: 'yes' }), /uppercase must be either true or false/)
  assert.throws(() => implementation.run('', { count: 2 }), /Option \"count\" must be a string/)
})

test('enforces length and count bounds and rejects counts that are not whole numbers', () => {
  for (const length of ['7', '257', '-1', '1.5', '1e2', '']) {
    assert.throws(() => implementation.run('', { length }), /Length must be a whole number from 8 to 256/)
  }
  for (const count of ['0', '101', '-1', '1.5', '1e2', '']) {
    assert.throws(() => implementation.run('', { count }), /Count must be a whole number from 1 to 100/)
  }
  const boundary = withCrypto(fillWithZeroes(), () => implementation.run('', {
    length: '256', count: '100', uppercase: 'true', lowercase: 'false', numbers: 'false', symbols: 'false',
  }))
  const rows = boundary.split('\n')
  assert.equal(rows.length, 100)
  assert.ok(rows.every(password => password.length === 256))
})
