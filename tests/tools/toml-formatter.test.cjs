/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/toml-formatter/definition.ts')
const implementation = require('../../app/tools/toml-formatter/logic.ts')

test('toml-formatter follows the per-tool contract', () => {
  assert.equal(tool.id, 'toml-formatter')
  assert.equal(tool.href, '/toml-formatter')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})

const { run } = require('../../app/tools/toml-formatter/logic.ts')

test('TOML Formatter parses and serializes data', () => {
  const output = run('[service]\nname = "hub"\nport = 3000\n', {})
  assert.match(output, /\[service\]/)
  assert.match(output, /port\s*=\s*3_?000/)
  assert.throws(() => run('name = [', {}))
})
