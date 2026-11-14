/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { validateMnemonic } = require('@scure/bip39')
const { wordlist } = require('@scure/bip39/wordlists/english.js')
const { tool } = require('../../app/tools/bip39-generator/definition.ts')
const implementation = require('../../app/tools/bip39-generator/logic.ts')

const toolSource = fs.readFileSync(path.join(__dirname, '../../app/tools/bip39-generator/Tool.tsx'), 'utf8')
const acceptedStrengths = [
  { strength: '128', words: 12, bytes: 16 },
  { strength: '160', words: 15, bytes: 20 },
  { strength: '192', words: 18, bytes: 24 },
  { strength: '224', words: 21, bytes: 28 },
  { strength: '256', words: 24, bytes: 32 },
]

function withCrypto(provider, callback) {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    enumerable: originalDescriptor?.enumerable ?? false,
    writable: true,
    value: provider,
  })
  try {
    return callback()
  } finally {
    if (originalDescriptor) Object.defineProperty(globalThis, 'crypto', originalDescriptor)
    else delete globalThis.crypto
  }
}

function deterministicCrypto(onRequest = () => {}) {
  let fill = 0
  return {
    getRandomValues(bytes) {
      onRequest(bytes.length)
      bytes.fill(++fill)
      return bytes
    },
  }
}

test('BIP39 generator is implemented on its dynamic route', () => {
  assert.equal(tool.id, 'bip39-generator')
  assert.equal(tool.href, '/bip39-generator')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.defaultOptions.strength, '128')
  assert.equal(typeof implementation.run, 'function')
})

test('all accepted strengths produce valid English BIP39 checksums and expected word counts', () => {
  const requestedByteLengths = []
  withCrypto(deterministicCrypto(length => requestedByteLengths.push(length)), () => {
    for (const { strength, words, bytes } of acceptedStrengths) {
      const phrase = implementation.run('', { strength })
      assert.equal(phrase.trim().split(/\s+/).length, words, `Expected ${words} words for ${strength}-bit entropy.`)
      assert.ok(validateMnemonic(phrase, wordlist), `Expected a valid English BIP39 checksum for ${strength}-bit entropy.`)
      assert.equal(requestedByteLengths.at(-1), bytes, `Expected exactly ${bytes} bytes of secure entropy.`)
    }
  })
})

test('default strength generates the standard 12-word phrase', () => {
  withCrypto(deterministicCrypto(), () => {
    const phrase = implementation.run('')
    assert.equal(phrase.trim().split(/\s+/).length, 12)
    assert.ok(validateMnemonic(phrase, wordlist), 'Expected the default phrase to pass BIP39 checksum validation.')
  })
})

test('strength values outside the supported set fail before requesting entropy', () => {
  let randomRequests = 0
  withCrypto(deterministicCrypto(() => { randomRequests += 1 }), () => {
    for (const strength of ['0', '127', '129', '159', '161', '191', '193', '223', '225', '255', '257', '512', '128.0', ' 128']) {
      assert.throws(
        () => implementation.run('', { strength }),
        /Strength must be one of 128, 160, 192, 224, or 256 bits\./,
      )
    }
  })
  assert.equal(randomRequests, 0)
})

test('generation fails closed when Web Crypto is absent', () => {
  withCrypto(undefined, () => {
    assert.throws(() => implementation.run(''), /Web Crypto is unavailable; no mnemonic was generated\./)
  })
})

test('generation fails closed when Web Crypto cannot provide entropy', () => {
  withCrypto({ getRandomValues() { throw new Error('provider failure') } }, () => {
    assert.throws(() => implementation.run(''), /Web Crypto could not provide secure random bytes; no mnemonic was generated\./)
  })
})

test('input, options, and unknown options are rejected with English errors', () => {
  withCrypto(deterministicCrypto(), () => {
    assert.throws(() => implementation.run('weak entropy'), /does not accept input text/i)
    assert.throws(() => implementation.run('', null), /Options must be an object\./)
    assert.throws(() => implementation.run('', { strength: 128 }), /Option "strength" must be a string\./)
    assert.throws(() => implementation.run('', { count: '1' }), /Unknown option "count"/)
  })
})

test('masking reveals no words and the UI requires explicit reveal, copy, and clear actions', () => {
  const fakePhrase = 'alpha beta gamma'
  assert.equal(implementation.maskMnemonic(fakePhrase), '••••• ••••• •••••')
  assert.equal(implementation.maskMnemonic(''), '')
  assert.match(toolSource, /useState\(false\)/)
  assert.match(toolSource, /revealed \? mnemonic : maskMnemonic\(mnemonic\)/)
  assert.match(toolSource, /Reveal phrase/)
  assert.match(toolSource, /Copy phrase/)
  assert.match(toolSource, /Clear/)
  assert.match(toolSource, /navigator\.clipboard\.writeText\(mnemonic\)/)
  assert.doesNotMatch(toolSource, /localStorage|sessionStorage|analytics|Math\.random/)
})

test('metadata, documentation, and test titles remain English and avoid unsupported service claims', () => {
  const readme = fs.readFileSync(path.join(__dirname, '../../app/tools/bip39-generator/README.md'), 'utf8')
  assert.match(tool.description, /English BIP39 mnemonics locally/)
  assert.match(readme, /Web Crypto entropy/)
  assert.match(readme, /does not store phrases, connect to wallets, or provide recovery functionality/i)
})
