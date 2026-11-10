/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/php-json-converter/definition.ts')
const implementation = require('../../app/tools/php-json-converter/logic.ts')

test('php-json-converter follows the per-tool contract', () => {
  assert.equal(tool.id, 'php-json-converter')
  assert.equal(tool.href, '/php-json-converter')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})

const { run } = require('../../app/tools/php-json-converter/logic.ts')

test('PHP array conversion parses data without executing PHP', () => {
  const output = run('array("name" => "Ada", "roles" => array("editor", "admin"))', { format: 'array' })
  assert.deepEqual(JSON.parse(output), { name: 'Ada', roles: ['editor', 'admin'] })
  assert.throws(() => run('<?php system("id");', {}), /Unsupported|Invalid|expected/i)
})
