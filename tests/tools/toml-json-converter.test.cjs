/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/toml-json-converter/definition.ts')
const implementation = require('../../app/tools/toml-json-converter/logic.ts')

test('toml-json-converter follows the per-tool contract', () => {
  assert.equal(tool.id, 'toml-json-converter')
  assert.equal(tool.href, '/toml-json-converter')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})

const { run } = require('../../app/tools/toml-json-converter/logic.ts')

test('TOML/JSON converter supports both directions', () => {
  const json = run('[server]\nhost = "localhost"\nport = 8080\n', { direction: 'toml-to-json', indent: '2' })
  assert.deepEqual(JSON.parse(json), { server: { host: 'localhost', port: 8080 } })
  const toml = run('{"server":{"host":"localhost","port":8080}}', { direction: 'json-to-toml' })
  assert.match(toml, /host\s*=\s*"localhost"/)
  assert.throws(() => run('[]', { direction: 'json-to-toml' }), /root object/i)
})
