/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/yaml-formatter/definition.ts')
const implementation = require('../../app/tools/yaml-formatter/logic.ts')

test('yaml-formatter follows the per-tool contract', () => {
  assert.equal(tool.id, 'yaml-formatter')
  assert.equal(tool.href, '/yaml-formatter')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})

const YAML = require('yaml')
const { run } = require('../../app/tools/yaml-formatter/logic.ts')

test('YAML Formatter emits valid YAML and supports recursive key sorting', () => {
  const output = run('z: 1\na: 2', { sortKeys: 'true', indent: '2' })
  assert.deepEqual(YAML.parse(output), { a: 2, z: 1 })
  assert.ok(output.indexOf('a:') < output.indexOf('z:'))
})
