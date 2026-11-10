/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const YAML = require('yaml')
const { tool } = require('../../app/tools/json-formatter/definition.ts')
const implementation = require('../../app/tools/json-formatter/logic.ts')

const { run, formatJSON, minifyJSON, validateJSON, escapeJSON, unescapeJSON, sortJSONKeys, jsonToCSV, jsonToYAML } = implementation

test('json-formatter follows the per-tool contract and declares its real modes', () => {
  assert.equal(tool.id, 'json-formatter')
  assert.equal(tool.href, '/json-formatter')
  assert.equal(tool.status, 'implemented')
  assert.ok(tool.exampleInput.length > 0)
  assert.equal(tool.outputExtension, 'json')
  assert.equal(typeof run, 'function')
})

test('format and minify preserve JSON values and honor indentation bounds', () => {
  const source = '{"zero":0,"false":false,"nil":null,"text":"a\\nb"}'
  const formatted = formatJSON(source, 4)
  assert.match(formatted, /\n    "zero": 0/)
  assert.deepEqual(JSON.parse(formatted), JSON.parse(source))
  assert.equal(minifyJSON(formatted), source)
  assert.equal(formatJSON(source, 0), source)
  assert.throws(() => formatJSON(source, -1), /Indent size/)
  assert.throws(() => formatJSON(source, 11), /Indent size/)
  assert.throws(() => formatJSON(source, 1.5), /Indent size/)
})

test('JSON validation rejects invalid syntax, raw controls, and empty input', () => {
  assert.deepEqual(validateJSON('{"ok":true}'), { valid: true })
  assert.equal(validateJSON('{"ok":}').valid, false)
  assert.equal(validateJSON('   ').valid, false)
  assert.equal(validateJSON('{"value":"line\nbreak"}').valid, false)
  assert.throws(() => run('{"ok":}', { mode: 'format' }), /Invalid JSON/)
})

test('JSON string escaping encodes every control and unescaping rejects malformed escapes', () => {
  const original = 'quote " slash \\ controls: \u0000\b\f\n\r\t\u001f'
  const escaped = escapeJSON(original)
  assert.equal(JSON.parse(`"${escaped}"`), original)
  assert.match(escaped, /\\u0000/)
  assert.match(escaped, /\\u001f/)
  assert.equal(unescapeJSON(escaped), original)
  assert.equal(unescapeJSON('plain text'), 'plain text')
  for (const invalid of ['\\x', '\\u12', '\\', 'raw\nnewline']) {
    assert.throws(() => unescapeJSON(invalid), /Invalid JSON escape sequence/)
  }
})

test('recursive sorting retains an own __proto__ key without prototype mutation', () => {
  const source = '{"z":1,"__proto__":{"polluted":true},"a":{"z":0,"b":false}}'
  const sortedText = sortJSONKeys(source)
  const sorted = JSON.parse(sortedText)
  assert.deepEqual(Object.keys(sorted), ['__proto__', 'a', 'z'])
  assert.equal(Object.hasOwn(sorted, '__proto__'), true)
  assert.deepEqual(Object.keys(sorted.a), ['b', 'z'])
  assert.equal({}.polluted, undefined)
})

test('CSV serialization quotes delimiters, quotes, line breaks and preserves falsy values', () => {
  const source = JSON.stringify([
    { text: 'comma, quote " and\nline', zero: 0, no: false, nil: null, extra: 'value' },
    { text: 'plain', zero: 2, no: true, nil: null, later: 'new column' },
  ])
  const csv = jsonToCSV(source)
  const records = csv.split('\r\n')
  assert.equal(records[0], '"text","zero","no","nil","extra","later"')
  assert.equal(records[1], '"comma, quote "" and\nline","0","false","null","value",""')
  assert.equal(records[2], '"plain","2","true","null","","new column"')
  assert.match(csv, /\r\n/)
})

test('CSV formula protection is explicit, defaults to safe, and can be disabled intentionally', () => {
  const source = JSON.stringify([{ value: '=1+1' }, { value: ' \t@SUM(1,1)' }, { value: '-2+3' }])
  const protectedCSV = jsonToCSV(source)
  assert.match(protectedCSV, /"'=1\+1"/)
  assert.match(protectedCSV, /"' \t@SUM\(1,1\)"/)
  assert.match(protectedCSV, /"'-2\+3"/)
  assert.equal(jsonToCSV(source, { escapeFormulaInjection: false }), '"value"\r\n"=1+1"\r\n" \t@SUM(1,1)"\r\n"-2+3"')
  assert.throws(() => jsonToCSV(source, { escapeFormulaInjection: 'false' }), /must be a boolean/)
})

test('CSV rejects unsupported shapes and preserves nested JSON values', () => {
  assert.throws(() => jsonToCSV('[]'), /non-empty array of objects/)
  assert.throws(() => jsonToCSV('[1]'), /Every row/)
  assert.throws(() => jsonToCSV('[{}]'), /at least one object property/)
  const nested = jsonToCSV('[{"value":{"a":1}}]')
  assert.equal(nested, '"value"\r\n"{""a"":1}"')
})

test('YAML serializer round-trips JSON primitives and special strings', () => {
  const source = JSON.stringify({ zero: 0, no: false, nil: null, quote: '"hello"', multiline: 'a\nb', hash: '# literal' })
  const yaml = jsonToYAML(source)
  assert.deepEqual(YAML.parse(yaml), JSON.parse(source))
  assert.deepEqual(YAML.parse(jsonToYAML('[0,false,null,"quoted, value"]')), [0, false, null, 'quoted, value'])
})

test('run dispatches modes and rejects unsupported options/modes cleanly', () => {
  assert.equal(run('{"a":1}'), '{\n  "a": 1\n}')
  assert.equal(run('{"z":1,"a":2}', { mode: 'sort', indentSize: 1 }), '{\n "a": 2,\n "z": 1\n}')
  assert.equal(run('[{"n":0}]', { mode: 'csv' }), '"n"\r\n"0"')
  assert.equal(run('{"active":false}', { mode: 'yaml' }).includes('active: false'), true)
  assert.throws(() => run('{}', { mode: 'unknown' }), /Unsupported formatter mode/)
})

test('processing limits input and nesting while accepting boundary-sized data', () => {
  assert.equal(formatJSON('0'), '0')
  assert.throws(() => formatJSON(' '.repeat(1_000_001)), /character limit/)
  assert.throws(() => formatJSON(`${'['.repeat(101)}0${']'.repeat(101)}`), /maximum depth of 100/)
})
