/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/url-encoder/definition.ts')
const implementation = require('../../app/tools/url-encoder/logic.ts')

test('url-encoder follows the per-tool contract', () => {
  assert.equal(tool.id, 'url-encoder')
  assert.equal(tool.href, '/url-encoder')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})

const { run } = require('../../app/tools/url-encoder/logic.ts')

test('URL component encoding round-trips UTF-8 text', () => {
  const encoded = run('café & 100%', { operation: 'encode' })
  assert.equal(encoded, 'caf%C3%A9%20%26%20100%25')
  assert.equal(run(encoded, { operation: 'decode' }), 'café & 100%')
})

test('URL decoder rejects malformed percent escapes and invalid UTF-8', () => {
  assert.throws(() => run('%C0%AF', { operation: 'decode' }), /Malformed percent-encoding|invalid UTF-8/i)
})
