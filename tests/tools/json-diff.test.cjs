/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/json-diff/definition.ts')
const implementation = require('../../app/tools/json-diff/logic.ts')

test('json-diff follows the per-tool contract and is connected to UniversalTool', () => {
  assert.equal(tool.id, 'json-diff')
  assert.equal(tool.href, '/json-diff')
  assert.equal(tool.status, 'implemented')
  assert.equal(typeof implementation.run, 'function')
  assert.match(require('node:fs').readFileSync('app/tools/json-diff/Tool.tsx', 'utf8'), /UniversalTool/)
})

test('reports added, removed, and changed object paths', () => {
  const result = JSON.parse(implementation.run(JSON.stringify({
    before: { name: 'Ada', age: 36, address: { city: 'London', postal: 'x' } },
    after: { name: 'Grace', address: { city: 'London', street: 'Main' }, active: true },
  })))
  assert.deepEqual(result.added, [{ path: '/active', value: true }, { path: '/address/street', value: 'Main' }])
  assert.deepEqual(result.removed, [{ path: '/address/postal', value: 'x' }, { path: '/age', value: 36 }])
  assert.deepEqual(result.changed, [{ path: '/name', before: 'Ada', after: 'Grace' }])
})

test('escapes JSON Pointer tokens and compares same-length arrays by index', () => {
  const result = JSON.parse(implementation.run(JSON.stringify({ before: { 'a/b~c': [1, 2] }, after: { 'a/b~c': [1, 3] } })))
  assert.deepEqual(result.changed, [{ path: '/a~1b~0c/1', before: 2, after: 3 }])
})

test('reports different-length arrays as one changed value and handles equality', () => {
  const arrayDiff = JSON.parse(implementation.run('{"before":{"items":[1]},"after":{"items":[1,2]}}'))
  assert.deepEqual(arrayDiff.changed, [{ path: '/items', before: [1], after: [1, 2] }])
  assert.deepEqual(JSON.parse(implementation.run('{"before":{"x":1},"after":{"x":1}}')), { added: [], removed: [], changed: [] })
})

test('rejects malformed payloads, options, excessive depth, and oversized input', () => {
  for (const input of ['', '{', '[]', '{"before":1}', '{"before":1,"after":2,"extra":3}']) assert.throws(() => implementation.run(input, {}))
  assert.throws(() => implementation.run('{"before":1,"after":2}', { extra: 'x' }), /does not accept options/)
  const nested = value => ({ x: value })
  let before = 0
  let after = 0
  for (let i = 0; i < 52; i += 1) { before = nested(before); after = nested(after) }
  assert.throws(() => implementation.run(JSON.stringify({ before, after }), {}), /maximum depth/)
  assert.throws(() => implementation.run(' '.repeat(1_000_001), {}), /1,000,000/)
})
