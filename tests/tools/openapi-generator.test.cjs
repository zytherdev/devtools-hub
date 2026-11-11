/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const { tool } = require('../../app/tools/openapi-generator/definition.ts')
const { run } = require('../../app/tools/openapi-generator/logic.ts')

const sample = {
  title: 'Example API',
  version: '1.0.0',
  description: '',
  servers: ['https://api.example.com'],
  endpoints: [{
    path: '/users',
    method: 'get',
    summary: 'List users',
    responseDescription: 'Success',
    responseSchema: {
      type: 'array',
      items: {
        type: 'object',
        properties: { id: { type: 'integer' }, name: { type: 'string' } },
      },
    },
  }],
}

const input = (value = sample) => JSON.stringify(value)
const clone = value => JSON.parse(JSON.stringify(value))

test('openapi-generator is implemented and connected to UniversalTool with its canonical slug', () => {
  assert.equal(tool.id, 'openapi-generator')
  assert.equal(tool.href, '/openapi-generator')
  assert.equal(tool.status, 'implemented')
  assert.deepEqual(tool.defaultOptions, {})
  assert.equal(tool.outputExtension, 'json')
  assert.ok(tool.exampleInput.length > 0)
  const component = fs.readFileSync(require.resolve('../../app/tools/openapi-generator/Tool.tsx'), 'utf8')
  assert.match(component, /<UniversalTool\s+tool=\{tool\}\s+slug="openapi-generator"\s*\/>/)
})

test('generates an OpenAPI 3.1 JSON document with the endpoint response schema', () => {
  const document = JSON.parse(run(input(), {}))
  assert.equal(document.openapi, '3.1.0')
  assert.deepEqual(document.info, { title: 'Example API', version: '1.0.0' })
  assert.deepEqual(document.servers, [{ url: 'https://api.example.com' }])
  assert.equal(document.paths['/users'].get.summary, 'List users')
  assert.deepEqual(document.paths['/users'].get.responses['200'].content['application/json'].schema, sample.endpoints[0].responseSchema)
})

test('accepts the exact 100,000-character input boundary', () => {
  const serialized = input()
  const padded = `${' '.repeat(100_000 - serialized.length)}${serialized}`
  assert.equal(padded.length, 100_000)
  assert.equal(JSON.parse(run(padded)).openapi, '3.1.0')
})

test('rejects malformed JSON, empty input, and input above 100,000 characters', () => {
  assert.throws(() => run(''), /JSON object/i)
  assert.throws(() => run('{oops'), /Invalid JSON/i)
  assert.throws(() => run(`${' '.repeat(100_001)}${input()}`), /100,000-character limit/i)
})

test('enforces endpoint count, text limits, and the documented HTTP methods', () => {
  const emptyEndpoints = clone(sample)
  emptyEndpoints.endpoints = []
  assert.throws(() => run(input(emptyEndpoints)), /between 1 and 100/i)

  const manyEndpoints = clone(sample)
  manyEndpoints.endpoints = Array.from({ length: 101 }, (_, index) => ({
    ...sample.endpoints[0], path: `/users/${index}`,
  }))
  assert.throws(() => run(input(manyEndpoints)), /between 1 and 100/i)

  const longTitle = clone(sample)
  longTitle.title = 'x'.repeat(129)
  assert.throws(() => run(input(longTitle)), /title.*128/i)

  const invalidMethod = clone(sample)
  invalidMethod.endpoints[0].method = 'CONNECT'
  assert.throws(() => run(input(invalidMethod)), /Invalid HTTP method/i)
})

test('rejects paths with query/hash and duplicate method-path pairs', () => {
  for (const path of ['/users?active=true', '/users#top', 'users']) {
    const invalid = clone(sample)
    invalid.endpoints[0].path = path
    assert.throws(() => run(input(invalid)), /path must start with \/|query or fragment/i)
  }

  const duplicate = clone(sample)
  duplicate.endpoints.push({ ...duplicate.endpoints[0], method: 'GET' })
  assert.throws(() => run(input(duplicate)), /Duplicate operation/i)
})

test('requires absolute HTTP(S) servers without credentials or fragments', () => {
  for (const server of ['//api.example.com', 'ftp://api.example.com', 'https://user:pass@example.com', 'https://api.example.com/#part', 'https://']) {
    const invalid = clone(sample)
    invalid.servers = [server]
    assert.throws(() => run(input(invalid)), /servers\[0\]/i)
  }
})

test('validates response schema depth, JSON numbers, and references recursively', () => {
  const tooDeep = clone(sample)
  let schema = {}
  for (let index = 0; index < 17; index++) schema = { nested: schema }
  tooDeep.endpoints[0].responseSchema = schema
  assert.throws(() => run(input(tooDeep)), /maximum depth of 16/i)

  const nonJsonNumber = clone(sample)
  nonJsonNumber.endpoints[0].responseSchema = { enum: [1e400] }
  const nonJsonNumberInput = input(nonJsonNumber).replace('[null]', '[1e400]')
  assert.throws(() => run(nonJsonNumberInput), /non-JSON number/i)

  for (const referenceKey of ['$ref', '$dynamicRef', '$recursiveRef']) {
    const referenced = clone(sample)
    referenced.endpoints[0].responseSchema = { properties: { user: { [referenceKey]: 'https://example.com/schema.json' } } }
    assert.throws(() => run(input(referenced)), /does not allow .*references/i)
  }
})

test('rejects unsupported fields and non-empty options', () => {
  const extra = clone(sample)
  extra.unexpected = true
  assert.throws(() => run(input(extra)), /Unrecognized field/i)
  assert.throws(() => run(input(), { indent: '4' }), /does not accept options/i)
})
