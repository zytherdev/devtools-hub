/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/random-number-generator/definition.ts')
const implementation = require('../../app/tools/random-number-generator/logic.ts')

function withCrypto(value, callback) {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value })
  try { return callback() } finally {
    if (original) Object.defineProperty(globalThis, 'crypto', original)
    else delete globalThis.crypto
  }
}

test('random-number-generator follows the per-tool contract and is implemented', () => {
  assert.equal(tool.id, 'random-number-generator')
  assert.equal(tool.href, '/random-number-generator')
  assert.equal(tool.status, 'implemented')
  assert.equal(typeof implementation.run, 'function')
  assert.match(require('node:fs').readFileSync('app/tools/random-number-generator/Tool.tsx', 'utf8'), /UniversalTool/)
})

test('generates the requested count within inclusive bounds', () => {
  const values = implementation.run('', { min: '-5', max: '5', count: '100' }).split('\n').map(Number)
  assert.equal(values.length, 100)
  assert.ok(values.every(value => Number.isInteger(value) && value >= -5 && value <= 5))
})

test('samples without modulo bias by rejecting candidates outside the range', () => {
  let call = 0
  const values = withCrypto({ getRandomValues(bytes) { bytes[0] = [0xc0, 0x80][call++]; return bytes } }, () => implementation.run('', { min: '0', max: '2', count: '1' }))
  assert.equal(values, '2')
  assert.equal(call, 2)
})

test('supports unique draws and rejects an impossible unique count', () => {
  let call = 0
  const result = withCrypto({ getRandomValues(bytes) { bytes[0] = [0x00, 0x40, 0x80][call++]; return bytes } }, () => implementation.run('', { min: '1', max: '3', count: '3', unique: 'true' }))
  assert.deepEqual(result.split('\n'), ['1', '2', '3'])
  assert.throws(() => implementation.run('', { min: '1', max: '2', count: '3', unique: 'true' }), /cannot exceed/)
})

test('rejects invalid bounds, counts, flags, input, and unknown options', () => {
  for (const options of [{ min: '1.2' }, { max: '9007199254740992' }, { min: '10', max: '1' }, { count: '0' }, { count: '1001' }, { unique: 'yes' }, { extra: 'x' }]) {
    assert.throws(() => implementation.run('', options))
  }
  assert.throws(() => implementation.run('seed', {}), /does not accept input text/)
})

test('fails closed when Web Crypto is unavailable or throws', () => {
  assert.throws(() => withCrypto(undefined, () => implementation.run('', { min: '1', max: '2' })), /Web Crypto is not supported/)
  assert.throws(() => withCrypto({ getRandomValues() { throw new Error('offline') } }, () => implementation.run('', { min: '1', max: '2' })), /could not provide random bytes/)
})
