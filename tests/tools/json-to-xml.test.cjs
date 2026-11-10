/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/json-to-xml/definition.ts')
const implementation = require('../../app/tools/json-to-xml/logic.ts')

test('json-to-xml follows the per-tool contract', () => {
  assert.equal(tool.id, 'json-to-xml')
  assert.equal(tool.href, '/json-to-xml')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})

const { run } = require('../../app/tools/json-to-xml/logic.ts')

test('JSON to XML creates escaped XML under a validated root element', () => {
  const output = run('{"name":"A & B","items":[1,2]}', { rootName: 'catalog' })
  assert.match(output, /<catalog>/)
  assert.match(output, /A &amp; B/)
  assert.match(output, /<items>1<\/items><items>2<\/items>/)
  assert.throws(() => run('{"x":1}', { rootName: '1invalid' }), /valid XML name/i)
})
