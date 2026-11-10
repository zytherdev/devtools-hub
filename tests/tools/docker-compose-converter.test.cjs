/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/docker-compose-converter/definition.ts')
const implementation = require('../../app/tools/docker-compose-converter/logic.ts')

test('docker-compose-converter follows the per-tool contract', () => {
  assert.equal(tool.id, 'docker-compose-converter')
  assert.equal(tool.href, '/docker-compose-converter')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})
