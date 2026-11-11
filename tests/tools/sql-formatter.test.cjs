/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/sql-formatter/definition.ts')
const { run } = require('../../app/tools/sql-formatter/logic.ts')

test('SQL Formatter is implemented and connected through its slug', () => {
  assert.equal(tool.id, 'sql-formatter')
  assert.equal(tool.href, '/sql-formatter')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.badge, '')
  assert.match(tool.exampleInput, /^select\b/i)
})

test('formats common clauses, comma-separated fields, and multiple statements', () => {
  const output = run('select id,name from users where active=true order by name;update users set name=\'Ada\' where id=1;', {})
  assert.match(output, /^SELECT id,\n  name\nFROM users\nWHERE active = true\nORDER BY name;\nUPDATE users\nSET name = 'Ada'\nWHERE id = 1;$/)
})

test('preserves quoted strings, quoted identifiers, and comment contents', () => {
  const input = `select 'where ORDER BY -- keep' as "from", \`select\` from [users] -- ORDER BY stays\nwhere note = 'it''s WHERE'; /* JOIN remains */`
  const output = run(input, { keywordCase: 'upper' })
  assert.ok(output.includes("'where ORDER BY -- keep'"))
  assert.ok(output.includes('"from"'))
  assert.ok(output.includes('`select`'))
  assert.ok(output.includes('[users]'))
  assert.ok(output.includes('-- ORDER BY stays'))
  assert.ok(output.includes('/* JOIN remains */'))
  assert.ok(output.includes("'it''s WHERE'"))
  assert.ok(output.includes('WHERE note'))
})

test('supports keyword casing and the configured continuation indentation', () => {
  assert.equal(run('select a,b from t', { keywordCase: 'lower', indent: '4' }), 'select a,\n    b\nfrom t')
  assert.equal(run('select a,b from t', { keywordCase: 'preserve', indent: '2' }), 'select a,\n  b\nfrom t')
})

test('rejects malformed input and invalid options', () => {
  assert.throws(() => run('   '), /Paste a SQL statement/i)
  assert.throws(() => run("select 'unfinished"), /Unterminated quoted/i)
  assert.throws(() => run('select 1 /* unfinished'), /Unterminated block comment/i)
  assert.throws(() => run('select 1', { keywordCase: 'capitalize' }), /keywordCase/i)
  assert.throws(() => run('select 1', { indent: '3' }), /indent/i)
  assert.throws(() => run('select 1', { unknown: 'value' }), /Unknown option/i)
  assert.throws(() => run('x'.repeat(100_001)), /100,000 characters/i)
})
