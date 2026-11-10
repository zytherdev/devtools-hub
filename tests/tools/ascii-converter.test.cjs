/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/ascii-converter/definition.ts')
const { MAX_INPUT_LENGTH, MAX_OUTPUT_LENGTH, run } = require('../../app/tools/ascii-converter/logic.ts')

test('ascii-converter has an implemented catalog definition and explicit truthful defaults', () => {
  assert.equal(tool.id, 'ascii-converter')
  assert.equal(tool.href, '/ascii-converter')
  assert.equal(tool.status, 'implemented')
  assert.deepEqual(tool.defaultOptions, { mode: 'text-to-codes', base: 'decimal' })
  assert.equal(run(tool.exampleInput, tool.defaultOptions), '65 83 67 73 73')
})

test('converts text in decimal, hexadecimal, and binary, then decodes each base', () => {
  const text = 'Hi!'
  for (const [base, encoded] of [
    ['decimal', '72 105 33'],
    ['hex', '48 69 21'],
    ['binary', '1001000 1101001 100001'],
  ]) {
    assert.equal(run(text, { mode: 'text-to-codes', base }), encoded)
    assert.equal(run(encoded, { mode: 'codes-to-text', base }), text)
  }
  assert.equal(run('41 4a', { mode: 'codes-to-text', base: 'hex' }), 'AJ')
})

test('preserves the complete ASCII range including literal control characters and DEL', () => {
  const controls = '\u0000\u0001\t\n\r\u001f ~\u007f'
  const codes = '0 1 9 10 13 31 32 126 127'
  assert.equal(run(controls), codes)
  assert.equal(run(codes, { mode: 'codes-to-text' }), controls)
})

test('rejects non-ASCII Unicode code points instead of corrupting them', () => {
  assert.throws(() => run('café'), /position 4.*U\+00E9.*0–127/)
  assert.throws(() => run('x🌱'), /position 2.*U\+1F331.*0–127/)
  assert.throws(() => run('\u0080'), /U\+0080/)
})

test('rejects malformed tokens and numbers outside the 7-bit ASCII range usefully', () => {
  assert.throws(() => run('65,66', { mode: 'codes-to-text' }), /Invalid decimal token #1.*65,66/)
  assert.throws(() => run('0x41', { mode: 'codes-to-text', base: 'hex' }), /Invalid hex token #1/)
  assert.throws(() => run('102', { mode: 'codes-to-text', base: 'binary' }), /Invalid binary token #1/)
  assert.throws(() => run('128', { mode: 'codes-to-text' }), /token #1.*out of range.*0–127/)
  assert.throws(() => run('ff', { mode: 'codes-to-text', base: 'hex' }), /token #1.*out of range/)
  assert.throws(() => run('10000000', { mode: 'codes-to-text', base: 'binary' }), /token #1.*out of range/)
  assert.equal(run('  65\n 66  ', { mode: 'codes-to-text' }), 'AB')
})

test('validates option shape, supported keys, mode, and base', () => {
  assert.equal(run('A'), '65')
  assert.throws(() => run('A', null), /Options must be an object/)
  assert.throws(() => run('A', { direction: 'encode' }), /Unsupported option.*direction/)
  assert.throws(() => run('A', { mode: 'encode' }), /Unsupported mode/)
  assert.throws(() => run('A', { base: 'octal' }), /Unsupported base/)
  assert.throws(() => run(null, {}), /Input must be a string/)
})

test('accepts maximum bounded text and rejects input immediately beyond the limit', () => {
  const largest = String.fromCharCode(127).repeat(MAX_INPUT_LENGTH)
  const output = run(largest, { mode: 'text-to-codes', base: 'binary' })
  assert.equal(output.length, MAX_OUTPUT_LENGTH - 1)
  assert.throws(() => run(`${largest}x`), /100,000 characters or fewer/)
  assert.equal(run(' \t\n ', { mode: 'codes-to-text' }), '')
  assert.equal(run('', { mode: 'codes-to-text' }), '')
})

test('performs only a local deterministic conversion and returns plain strings', () => {
  const result = run('Local', { mode: 'text-to-codes', base: 'hex' })
  assert.equal(result, '4c 6f 63 61 6c')
  assert.equal(typeof result, 'string')
  assert.equal(run('Local', { mode: 'text-to-codes', base: 'hex' }), result)
})
