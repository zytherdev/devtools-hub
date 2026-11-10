/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const QRCode = require('qrcode')
const { tool } = require('../../app/tools/qr-generator/definition.ts')
const { run } = require('../../app/tools/qr-generator/logic.ts')

const DEFAULT_OPTIONS = { errorCorrection: 'M', margin: '4', scale: '4' }
const payload = 'https://example.com/qr?local=true'

function assertValidSvg(svg) {
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)
  assert.match(svg, /<path\b[^>]*d="[^"]+"/)
  assert.match(svg.trimEnd(), /<\/svg>$/)
  assert.doesNotMatch(svg, /<(?:script|image|foreignObject)\b/i)
}

test('qr-generator follows the implemented per-tool contract', () => {
  assert.equal(tool.id, 'qr-generator')
  assert.equal(tool.href, '/qr-generator')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.outputExtension, 'svg')
})

test('returns local encoder SVG for payload at selected correction/options', async () => {
  const options = { errorCorrection: 'Q', margin: '2', scale: '3' }
  const result = await run(payload, options)
  const expected = await QRCode.toString(payload, {
    type: 'svg',
    errorCorrectionLevel: 'Q',
    margin: 2,
    scale: 3,
  })

  assertValidSvg(result)
  assert.ok(result.length <= 512_000)
  assert.equal(result, expected)
  assert.ok(QRCode.create(payload, { errorCorrectionLevel: 'Q' }).modules.size > 0)
})

test('supports each exact correction level and defaults to M', async () => {
  for (const errorCorrection of ['L', 'M', 'Q', 'H']) {
    assertValidSvg(await run('local QR', { errorCorrection }))
  }
  assert.equal(await run('local QR'), await QRCode.toString('local QR', {
    type: 'svg', errorCorrectionLevel: 'M', margin: 4, scale: 4,
  }))
})

test('generation succeeds when network access is unavailable', async () => {
  const previousFetch = global.fetch
  global.fetch = () => { throw new Error('network access is disabled in this test') }
  try {
    assertValidSvg(await run('offline payload', DEFAULT_OPTIONS))
  } finally {
    global.fetch = previousFetch
  }
})

test('rejects empty, malformed, and oversized payloads', async () => {
  await assert.rejects(run(''), /Enter text or a URL/)
  assertValidSvg(await run('x'.repeat(1200), { errorCorrection: 'L' }))
  await assert.rejects(run('x'.repeat(1201)), /1,200 UTF-8 bytes/)
  await assert.rejects(run('😀'.repeat(301)), /1,200 UTF-8 bytes/)
  await assert.rejects(run(null), /Enter text or a URL/)
})

test('validates correction level, integer bounds, and unsupported options', async () => {
  await assert.rejects(run('x', { errorCorrection: 'm' }), /errorCorrection must be one of L, M, Q, or H/)
  await assert.rejects(run('x', { errorCorrection: 'X' }), /errorCorrection must be one of L, M, Q, or H/)
  await assert.rejects(run('x', { margin: '-1' }), /margin must be a whole number from 0 to 16/)
  await assert.rejects(run('x', { margin: '17' }), /margin must be a whole number from 0 to 16/)
  await assert.rejects(run('x', { margin: '1.5' }), /margin must be a whole number from 0 to 16/)
  await assert.rejects(run('x', { scale: '0' }), /scale must be a whole number from 1 to 16/)
  await assert.rejects(run('x', { scale: '17' }), /scale must be a whole number from 1 to 16/)
  await assert.rejects(run('x', { scale: '1e2' }), /scale must be a whole number from 1 to 16/)
  await assert.rejects(run('x', { width: '128' }), /Unknown option: width/)
  assertValidSvg(await run('x', { margin: '0', scale: '16' }))
})
