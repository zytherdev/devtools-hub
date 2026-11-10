/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/json-schema-generator/definition.ts')
const implementation = require('../../app/tools/json-schema-generator/logic.ts')

test('json-schema-generator follows the per-tool contract', () => {
  assert.equal(tool.id, 'json-schema-generator')
  assert.equal(tool.href, '/json-schema-generator')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})

const { run } = require('../../app/tools/json-schema-generator/logic.ts')

test('JSON Schema inference creates properties and validates options', () => {
  const schema = JSON.parse(run('{"name":"Ada","active":true}', { title: 'Person', required: 'observed' }))
  assert.equal(schema.title, 'Person')
  assert.equal(schema.type, 'object')
  assert.deepEqual(schema.required, ['active', 'name'])
  assert.equal(schema.properties.name.type, 'string')
  assert.equal(schema.properties.active.type, 'boolean')
  assert.throws(() => run('{"x":1}', { mode: 'validate' }), /not implemented/i)
})
