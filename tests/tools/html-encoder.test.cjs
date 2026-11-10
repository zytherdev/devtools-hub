/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/html-encoder/definition.ts')
const implementation = require('../../app/tools/html-encoder/logic.ts')

test('html-encoder follows the per-tool contract', () => {
  assert.equal(tool.id, 'html-encoder')
  assert.equal(tool.href, '/html-encoder')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})

const { run } = require('../../app/tools/html-encoder/logic.ts')

test('HTML entity encoder escapes markup delimiters and decodes supported references', () => {
  const encoded = run('A & <"\'>', { operation: 'encode' })
  assert.equal(encoded, 'A &amp; &lt;&quot;&#39;&gt;')
  assert.equal(run('A &amp; &#x1F642;', { operation: 'decode' }), 'A & 🙂')
})

test('HTML entity decoder rejects malformed numeric references', () => {
  assert.throws(() => run('&#xD800;', { operation: 'decode' }), /Invalid Unicode code point/i)
})
