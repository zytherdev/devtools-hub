/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/yaml-to-json/definition.ts')
const implementation = require('../../app/tools/yaml-to-json/logic.ts')

test('yaml-to-json follows the per-tool contract', () => {
  assert.equal(tool.id, 'yaml-to-json')
  assert.equal(tool.href, '/yaml-to-json')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})

const { run } = require('../../app/tools/yaml-to-json/logic.ts')

test('YAML to JSON converts nested values with bounded indentation', () => {
  const output = run('app:\n  name: DevTools\nitems:\n  - one\n  - two', { indent: '4' })
  assert.deepEqual(JSON.parse(output), { app: { name: 'DevTools' }, items: ['one', 'two'] })
  assert.throws(() => run('', {}), /paste data/i)
})
