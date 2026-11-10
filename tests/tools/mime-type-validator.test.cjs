/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const { tool } = require('../../app/tools/mime-type-validator/definition.ts')
const { run } = require('../../app/tools/mime-type-validator/logic.ts')

const parse = output => JSON.parse(output)

test('mime-type-validator follows the catalog and shared UI contract', () => {
  assert.equal(tool.id, 'mime-type-validator')
  assert.equal(tool.href, '/mime-type-validator')
  assert.equal(tool.status, 'implemented')
  assert.deepEqual(tool.defaultOptions, { mode: 'lookup', target: 'auto' })
  assert.match(fs.readFileSync('app/tools/registry.ts', 'utf8'), /mimeTypeValidator/)
  assert.match(fs.readFileSync('app/tools/componentRegistry.ts', 'utf8'), /mime-type-validator/)
  assert.match(fs.readFileSync('app/tools/mime-type-validator/Tool.tsx', 'utf8'), /UniversalTool/)
})

test('looks up common MIME values case-insensitively and accepts parameters', () => {
  const result = parse(run('Application/JSON; Charset=utf-8'))
  assert.equal(result.valid, true)
  assert.equal(result.known, true)
  assert.equal(result.mimeType, 'application/json')
  assert.deepEqual(result.extensions, ['json', 'map'])

  const withQuotedValue = parse(run('text/plain; title="a; b"', { target: 'mime', mode: 'validate' }))
  assert.equal(withQuotedValue.valid, true)
  assert.equal(withQuotedValue.mimeType, 'text/plain; title="a; b"')
})

test('looks up extensions from bare suffixes, filenames, and compound suffixes', () => {
  assert.equal(parse(run('.JpEg')).mimeType, 'image/jpeg')
  assert.equal(parse(run('C:\\uploads\\archive.TAR.GZ')).mimeType, 'application/gzip')
  assert.equal(parse(run('report.pdf')).mimeType, 'application/pdf')
})

test('distinguishes valid but unknown values from malformed syntax', () => {
  const unknownMime = parse(run('application/x-custom-format', { mode: 'validate', target: 'mime' }))
  assert.equal(unknownMime.valid, true)
  assert.equal(unknownMime.known, false)
  assert.deepEqual(unknownMime.extensions, [])

  const unknownExtension = parse(run('myformat', { mode: 'validate', target: 'extension' }))
  assert.equal(unknownExtension.valid, true)
  assert.equal(unknownExtension.known, false)
  assert.equal(unknownExtension.mimeType, null)

  for (const malformed of ['text', '*/json', 'text/plain; charset', 'text/plain; a=1; A=2', 'text/plain; x="unterminated', 'text/plain\n; charset=utf-8']) {
    assert.throws(() => run(malformed, { target: 'mime' }), /Invalid MIME type syntax/)
  }
  assert.throws(() => run('bad extension!', { target: 'extension' }), /Invalid extension syntax/)
  assert.throws(() => run('name.txt\n', { target: 'extension' }), /Invalid extension syntax/)
})

test('rejects invalid options, empty and oversized input', () => {
  assert.throws(() => run('', {}), /Enter a filename extension or MIME type/)
  assert.throws(() => run('image/png', { target: 'automatic' }), /target must be/)
  assert.throws(() => run('image/png', { mode: 'check' }), /mode must be/)
  assert.throws(() => run('image/png', { other: 'value' }), /Unknown option/)
  assert.throws(() => run('a'.repeat(513)), /512 characters or fewer/)
})

test('uses a bounded local implementation with no network lookup', () => {
  const source = fs.readFileSync('app/tools/mime-type-validator/logic.ts', 'utf8')
  assert.doesNotMatch(source, /\b(fetch|XMLHttpRequest|WebSocket)\b/)
  const output = run('application/json')
  assert.ok(output.length <= 8192)
})
