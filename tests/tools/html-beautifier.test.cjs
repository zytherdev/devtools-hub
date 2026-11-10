/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/html-beautifier/definition.ts')
const implementation = require('../../app/tools/html-beautifier/logic.ts')

test('html-beautifier follows the per-tool contract', () => {
  assert.equal(tool.id, 'html-beautifier')
  assert.equal(tool.href, '/html-beautifier')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})

const { run } = require('../../app/tools/html-beautifier/logic.ts')

test('HTML Beautifier formats nested markup and rejects empty input', () => {
  const output = run('<main><h1>Tools</h1><p>Ready</p></main>', {})
  assert.match(output, /<main>/)
  assert.match(output, /<h1>\s*Tools\s*<\/h1>/)
  assert.match(output, /<p>\s*Ready\s*<\/p>/)
  assert.throws(() => run('  ', {}), /Paste HTML/i)
})
