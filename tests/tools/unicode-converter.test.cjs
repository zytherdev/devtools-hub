/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/unicode-converter/definition.ts')
const implementation = require('../../app/tools/unicode-converter/logic.ts')

test('unicode-converter follows the per-tool contract', () => {
  assert.equal(tool.id, 'unicode-converter')
  assert.equal(tool.href, '/unicode-converter')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})

const { run } = require('../../app/tools/unicode-converter/logic.ts')

test('Unicode converter round-trips supplementary code points', () => {
  const text = 'Hi 🌱'
  const encoded = run(text, { operation: 'encode', format: 'codepoint' })
  assert.equal(encoded, 'U+0048 U+0069 U+0020 U+1F331')
  assert.equal(run(encoded, { operation: 'decode', format: 'codepoint' }), text)
})

test('Unicode decoder rejects surrogate code points', () => {
  assert.throws(() => run('U+D800', { operation: 'decode', format: 'codepoint' }), /Invalid Unicode scalar/i)
})
