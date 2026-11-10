/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/markdown-to-html/definition.ts')
const implementation = require('../../app/tools/markdown-to-html/logic.ts')

test('markdown-to-html follows the per-tool contract', () => {
  assert.equal(tool.id, 'markdown-to-html')
  assert.equal(tool.href, '/markdown-to-html')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})

const { run } = require('../../app/tools/markdown-to-html/logic.ts')

test('Markdown converter renders structure while escaping raw HTML', () => {
  const output = run('# Hello\n\n**safe** <script>alert(1)</script>', {})
  assert.match(output, /<h1>Hello<\/h1>/)
  assert.match(output, /<strong>safe<\/strong>/)
  assert.match(output, /&lt;script&gt;/)
  assert.doesNotMatch(output, /<script>/)
})
