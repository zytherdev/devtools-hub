/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/favicon-generator/definition.ts')
const implementation = require('../../app/tools/favicon-generator/logic.ts')

test('favicon-generator follows the per-tool contract', () => {
  assert.equal(tool.id, 'favicon-generator')
  assert.equal(tool.href, '/favicon-generator')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})

const { run } = require('../../app/tools/favicon-generator/logic.ts')

test('Favicon Generator returns a safe SVG preview with validated controls', () => {
  const output = run('<&', { foreground: '#fff', background: '#000', shape: 'circle' })
  assert.match(output, /^<svg xmlns=/)
  assert.match(output, /&lt;&amp;/)
  assert.match(output, /<circle /)
})
