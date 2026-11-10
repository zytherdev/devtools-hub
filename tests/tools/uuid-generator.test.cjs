/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/uuid-generator/definition.ts')
const implementation = require('../../app/tools/uuid-generator/logic.ts')

const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

function replaceWebCrypto(value, callback) {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'crypto')
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value })
  try {
    return callback()
  } finally {
    if (original) Object.defineProperty(globalThis, 'crypto', original)
    else delete globalThis.crypto
  }
}

test('uuid-generator follows the per-tool contract and is connected to its shared UI', () => {
  assert.equal(tool.id, 'uuid-generator')
  assert.equal(tool.href, '/uuid-generator')
  assert.equal(tool.status, 'implemented')
  assert.equal(typeof implementation.run, 'function')
  assert.match(require('node:fs').readFileSync('app/tools/uuid-generator/Tool.tsx', 'utf8'), /UniversalTool/)
})

test('generates UUID v4 format with version and RFC variant bits', () => {
  const uuid = implementation.run('', {})
  assert.match(uuid, UUID_V4_PATTERN)
  assert.equal(uuid.length, 36)
})

test('generates requested count with exactly one UUID per output line', () => {
  const output = implementation.run('', { version: '4', count: '4' })
  const uuids = output.split('\n')
  assert.equal(uuids.length, 4)
  for (const uuid of uuids) assert.match(uuid, UUID_V4_PATTERN)
})

test('uses Web Crypto bytes directly and applies UUID v4 bits', () => {
  let calls = 0
  const uuid = replaceWebCrypto({
    getRandomValues(bytes) {
      calls += 1
      assert.equal(bytes.byteLength, 16)
      bytes.fill(0)
      return bytes
    },
  }, () => implementation.run('', {}))

  assert.equal(calls, 1)
  assert.equal(uuid, '00000000-0000-4000-8000-000000000000')
})

test('fails closed when Web Crypto is absent or throws', () => {
  assert.throws(
    () => replaceWebCrypto(undefined, () => implementation.run('', {})),
    /Web Crypto is not supported/,
  )
  assert.throws(
    () => replaceWebCrypto({ getRandomValues() { throw new Error('unavailable') } }, () => implementation.run('', {})),
    /could not provide random bytes/,
  )
})

test('rejects non-v4 versions and v5-only namespace/name settings', () => {
  assert.throws(() => implementation.run('', { version: '5' }), /version.*must be "4"/)
  assert.throws(() => implementation.run('', { namespace: 'dns' }), /only used by UUID v5/)
  assert.throws(() => implementation.run('', { name: 'example.test' }), /only used by UUID v5/)
})

test('validates count syntax and enforces the 1-to-1000 boundary', () => {
  for (const count of ['', '0', '-1', '1.5', '1e2', '1001', '9007199254740992']) {
    assert.throws(() => implementation.run('', { count }), /count.*whole number from 1 to 1000/)
  }
  const output = implementation.run('', { count: '1000' })
  assert.equal(output.split('\n').length, 1000)
  assert.match(output.split('\n')[999], UUID_V4_PATTERN)
})

test('rejects user text, unknown option keys, and non-string count values', () => {
  assert.throws(() => implementation.run('user content', {}), /does not accept input text/)
  assert.throws(() => implementation.run('', { extra: 'value' }), /Unknown option/)
  assert.throws(() => implementation.run('', { count: 2 }), /count.*whole number from 1 to 1000/)
})
