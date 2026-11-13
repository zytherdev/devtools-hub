/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { tool } = require('../../app/tools/http-status-codes/definition.ts')
const catalog = require('../../app/tools/http-status-codes/logic.ts')

const { MAX_QUERY_LENGTH, STATUS_CODES, run, searchStatusCodes } = catalog

test('http-status-codes is implemented with the expected route and an empty badge', () => {
  assert.equal(tool.id, 'http-status-codes')
  assert.equal(tool.href, '/http-status-codes')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.badge, '')
  assert.equal(tool.exampleInput, '404')
  assert.deepEqual(tool.defaultOptions, { category: 'all' })
})

test('numeric lookups are exact and search text is case-insensitive across metadata', () => {
  assert.deepEqual(searchStatusCodes('404').map(item => item.title), ['Not Found'])
  assert.deepEqual(searchStatusCodes('tOo MaNy ReQuEsTs').map(item => item.code), [429])
  assert.deepEqual(searchStatusCodes('client error').map(item => item.category), Array(29).fill('4xx'))
  assert.equal(searchStatusCodes('226').at(0).categoryLabel, 'Successful')
  assert.equal(searchStatusCodes('306').length, 0)
})

test('category options filter results and JSON output includes query, category, and entries', () => {
  assert.ok(searchStatusCodes('error', { category: '5xx' }).every(item => item.category === '5xx'))
  assert.equal(searchStatusCodes('error', { category: '1xx' }).length, 0)
  const response = JSON.parse(run(' 404 ', { category: '4xx' }))
  assert.equal(response.query, '404')
  assert.equal(response.category, '4xx')
  assert.equal(response.total, 1)
  assert.equal(response.results[0].code, 404)
})

test('the curated catalog is bounded, sorted, unique, and has consistent category metadata', () => {
  assert.equal(STATUS_CODES.length, 62)
  assert.deepEqual(STATUS_CODES.map(item => item.code), [...STATUS_CODES.map(item => item.code)].sort((a, b) => a - b))
  assert.equal(new Set(STATUS_CODES.map(item => item.code)).size, STATUS_CODES.length)
  for (const item of STATUS_CODES) {
    assert.equal(item.category, `${Math.floor(item.code / 100)}xx`)
    assert.ok(item.title.length > 0)
    assert.ok(item.description.length > 0)
  }
})

test('lookup validation rejects empty, non-text, overlong, control, and out-of-range numeric inputs', () => {
  for (const query of ['', '   ', null, 404, 'x'.repeat(MAX_QUERY_LENGTH + 1), 'not\nvalid', '99', '099', '600', '1000']) {
    assert.throws(() => searchStatusCodes(query), Error)
  }
  assert.equal(searchStatusCodes('x'.repeat(MAX_QUERY_LENGTH)).length, 0)
  assert.equal(searchStatusCodes('100')[0].code, 100)
  assert.equal(searchStatusCodes('599').length, 0)
})

test('options reject unknown keys, invalid categories, and non-object values', () => {
  assert.throws(() => searchStatusCodes('404', { limit: '1' }), /Only the category option/)
  assert.throws(() => searchStatusCodes('404', { category: '4xx', extra: 'value' }), /Only the category option/)
  assert.throws(() => searchStatusCodes('404', { category: '4Xx' }), /Category must be/)
  assert.throws(() => searchStatusCodes('404', null), /Options must be an object/)
})

test('tool UI exposes an accessible local search and category filter using the shared panel', () => {
  const source = fs.readFileSync(path.join(__dirname, '../../app/tools/http-status-codes/Tool.tsx'), 'utf8')
  assert.match(source, /ToolPanel/)
  assert.match(source, /type="search"/)
  assert.match(source, /htmlFor="http-status-search"/)
  assert.match(source, /aria-invalid=\{Boolean\(error\)\}/)
  assert.match(source, /http-status-category/)
  assert.match(source, /searchStatusCodes\(query, \{ category \}\)/)
  assert.match(source, /No matching status codes in this curated reference/)
})
