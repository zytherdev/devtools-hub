/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const { tool } = require('../../app/tools/mock-api-generator/definition.ts')
const { run } = require('../../app/tools/mock-api-generator/logic.ts')
const template = { name: 'Ada', role: 'engineer', profile: { active: true, tags: ['api'] } }
const input = value => JSON.stringify(value)

test('mock-api-generator is implemented and connected to UniversalTool with JSON output', () => {
  assert.equal(tool.id, 'mock-api-generator')
  assert.equal(tool.href, '/mock-api-generator')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.outputExtension, 'json')
  assert.deepEqual(tool.defaultOptions, { count: '3', wrapper: 'data', idField: 'id' })
  const component = fs.readFileSync(require.resolve('../../app/tools/mock-api-generator/Tool.tsx'), 'utf8')
  assert.match(component, /<UniversalTool\s+tool=\{tool\}\s+slug="mock-api-generator"\s*\/>/)
})

test('generates the requested example with a wrapper, count, and incremental IDs', () => {
  const actual = JSON.parse(run('{"name":"Ada","role":"engineer"}', { count: '3', wrapper: 'data', idField: 'id' }))
  assert.deepEqual(actual, {
    data: [
      { name: 'Ada', role: 'engineer', id: 1 },
      { name: 'Ada', role: 'engineer', id: 2 },
      { name: 'Ada', role: 'engineer', id: 3 },
    ],
    meta: { count: 3 },
  })
})

test('creates independent copies of objects and nested values', () => {
  const result = JSON.parse(run(input(template), { count: '2', wrapper: 'items', idField: '' }))
  assert.notStrictEqual(result.items[0], result.items[1])
  assert.notStrictEqual(result.items[0].profile, result.items[1].profile)
  assert.notStrictEqual(result.items[0].profile.tags, result.items[1].profile.tags)
  result.items[0].profile.tags.push('changed')
  assert.deepEqual(result.items[1].profile.tags, ['api'])
})

test('adds IDs only at the root and replaces any root property with the same name', () => {
  const source = { id: 'template', nested: { id: 'nested' } }
  const result = JSON.parse(run(input(source), { count: '2', wrapper: 'data', idField: 'id' }))
  assert.deepEqual(result.data.map(row => row.id), [1, 2])
  assert.deepEqual(result.data.map(row => row.nested.id), ['nested', 'nested'])
  assert.equal(source.id, 'template')
})

test('an empty wrapper returns a raw array and an empty idField omits IDs', () => {
  const result = JSON.parse(run(input(template), { count: '2', wrapper: '', idField: '' }))
  assert.ok(Array.isArray(result))
  assert.equal(result.length, 2)
  assert.equal(Object.hasOwn(result[0], 'id'), false)
})

test('accepts valid count, wrapper, and idField boundaries', () => {
  assert.equal(JSON.parse(run('{}', { count: '1', wrapper: 'w'.repeat(64), idField: 'i'.repeat(64) }))[`w${'w'.repeat(63)}`][0][`i${'i'.repeat(63)}`], 1)
  assert.equal(JSON.parse(run('{}', { count: '100', wrapper: '', idField: '' })).length, 100)
  const padded = `${' '.repeat(100_000 - 2)}{}`
  assert.equal(padded.length, 100_000)
  assert.equal(JSON.parse(run(padded, { count: '1', wrapper: '', idField: '' })).length, 1)
})

test('rejects invalid JSON, non-object roots, and inputs over 100,000 characters', () => {
  assert.throws(() => run(''), /JSON template object/i)
  assert.throws(() => run('{quebrado'), /Invalid JSON/i)
  for (const invalidRoot of ['null', '[]', '"texto"', '42', 'true']) {
    assert.throws(() => run(invalidRoot), /plain JSON object/i)
  }
  assert.throws(() => run(`${' '.repeat(100_001)}{}`), /100,000-character limit/i)
})

test('rejects excessive depth, non-finite numbers, and oversized collections', () => {
  let nested = '{}'
  for (let index = 0; index < 21; index++) nested = `{"child":${nested}}`
  assert.throws(() => run(nested), /maximum depth of 20/i)
  assert.throws(() => run('{"value":1e400}'), /number outside the JSON numeric range/i)
  const tooManyArrayItems = `[${Array(10_001).fill('null').join(',')}]`
  assert.throws(() => run(`{"items":${tooManyArrayItems}}`), /Arrays may contain no more than 10,000 items/i)
  const entries = Array.from({ length: 10_001 }, (_, index) => `"k${index}":0`).join(',')
  assert.ok(entries.length < 100_000)
  assert.throws(() => run(`{${entries}}`), /Objects may contain no more than 10,000 properties/i)
})

test('validates options, counts, names, and control characters', () => {
  assert.throws(() => run('{}', { unexpected: 'yes' }), /Unknown option/i)
  assert.throws(() => run('{}', { count: '0' }), /count must be an integer/i)
  assert.throws(() => run('{}', { count: '101' }), /count must be an integer/i)
  assert.throws(() => run('{}', { count: '1.5' }), /count must be an integer/i)
  assert.throws(() => run('{}', { wrapper: 'w'.repeat(65) }), /wrapper must be no more than 64/i)
  assert.throws(() => run('{}', { idField: 'i'.repeat(65) }), /idField must be no more than 64/i)
  assert.throws(() => run('{}', { wrapper: 'bad\nname' }), /wrapper cannot contain control characters/i)
  assert.throws(() => run('{}', { idField: 'bad\u0085name' }), /idField cannot contain control characters/i)
  assert.throws(() => run('{}', { wrapper: 'meta' }), /reserved/i)
})

test('rejects output exceeding 1 MB', () => {
  const largeTemplate = { payload: 'x'.repeat(12_000) }
  assert.throws(() => run(input(largeTemplate), { count: '100', wrapper: '', idField: '' }), /Output exceeds the 1,000,000-byte limit/i)
})

test('safely handles special property names', () => {
  const source = JSON.parse('{"__proto__":{"safe":true}}')
  const result = JSON.parse(run(input(source), { count: '1', wrapper: '__proto__', idField: '__proto__' }))
  assert.deepEqual(result.__proto__[0].__proto__, 1)
  assert.equal(Object.getPrototypeOf(result), Object.prototype)
})
