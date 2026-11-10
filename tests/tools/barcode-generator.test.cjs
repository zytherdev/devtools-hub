/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/barcode-generator/definition.ts')
const implementation = require('../../app/tools/barcode-generator/logic.ts')

test('barcode-generator follows the per-tool contract and is implemented', () => {
  assert.equal(tool.id, 'barcode-generator')
  assert.equal(tool.href, '/barcode-generator')
  assert.equal(tool.status, 'implemented')
  assert.equal(typeof implementation.run, 'function')
  assert.match(require('node:fs').readFileSync('app/tools/barcode-generator/Tool.tsx', 'utf8'), /UniversalTool/)
})

test('generates SVG barcodes in the supported formats', () => {
  const cases = [
    ['DEMO-12345', 'code128'], ['ABC123', 'code39'], ['400638133393', 'ean13'],
    ['9638507', 'ean8'], ['12345678901', 'upca'], ['1234567890123', 'itf14'],
  ]
  for (const [value, format] of cases) {
    const svg = implementation.run(value, { format })
    assert.match(svg, /^<svg viewBox=/)
    assert.match(svg, /<\/svg>\s*$/)
  }
})

test('supports scale, height and human-readable text options', () => {
  const svg = implementation.run('HELLO', { scale: '2', height: '20', includeText: 'false' })
  assert.match(svg, /^<svg/)
})

test('rejects empty input, unsupported formats, malformed numeric data and unknown options', () => {
  assert.throws(() => implementation.run('', {}), /Enter text or digits/)
  assert.throws(() => implementation.run('123', { format: 'unknown' }), /format must be one/)
  assert.throws(() => implementation.run('123', { format: 'ean13' }), /12 or 13 numeric digits/)
  assert.throws(() => implementation.run('x'.repeat(257), {}), /256 UTF-8 bytes/)
  assert.throws(() => implementation.run('HELLO\nWORLD', {}), /control characters/)
  assert.throws(() => implementation.run('HELLO', { scale: '0' }), /scale must be/)
  assert.throws(() => implementation.run('HELLO', { includeText: 'yes' }), /includeText/)
  assert.throws(() => implementation.run('HELLO', { extra: 'x' }), /Unknown option/)
})
