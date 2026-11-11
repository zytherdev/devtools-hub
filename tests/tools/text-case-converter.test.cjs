/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/text-case-converter/definition.ts')
const { CASE_MODES, MAX_INPUT_LENGTH, run } = require('../../app/tools/text-case-converter/logic.ts')

test('text-case-converter exposes an implemented tool with a loadable example', () => {
  assert.equal(tool.id, 'text-case-converter')
  assert.equal(tool.href, '/text-case-converter')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.outputExtension, 'txt')
  assert.equal(tool.exampleInput, 'Hello, World! review 2:Text')
  assert.deepEqual(tool.defaultOptions, { mode: 'camel' })
  assert.equal(CASE_MODES.length, 9)
})

test('camel mode normalizes words and existing camel-case boundaries', () => {
  assert.equal(run('Hello, World! review 2:Text', { mode: 'camel' }), 'helloWorldReview2Text')
  assert.equal(run('alreadyCamelCase', { mode: 'camel' }), 'alreadyCamelCase')
})

test('pascal mode capitalizes every token', () => {
  assert.equal(run('hello world', { mode: 'pascal' }), 'HelloWorld')
})

test('snake mode joins lowercase Unicode words with underscores', () => {
  assert.equal(run('naïve café résumé', { mode: 'snake' }), 'naïve_café_résumé')
})

test('kebab mode joins lowercase words with hyphens', () => {
  assert.equal(run('Good morning, world!', { mode: 'kebab' }), 'good-morning-world')
})

test('constant mode joins uppercase words with underscores', () => {
  assert.equal(run('quick action', { mode: 'constant' }), 'QUICK_ACTION')
})

test('title mode capitalizes every word and uses spaces', () => {
  assert.equal(run('mixed words here', { mode: 'title' }), 'Mixed Words Here')
})

test('sentence mode uppercases the first letter and lowercases the rest, preserving separators', () => {
  assert.equal(run('  hÉLLO, WORLD! ', { mode: 'sentence' }), '  Héllo, world! ')
  assert.equal(run('123 -- ÀBC', { mode: 'sentence' }), '123 -- Àbc')
})

test('lower and upper modes convert the full string while preserving punctuation', () => {
  assert.equal(run('Café Is! 42?', { mode: 'lower' }), 'café is! 42?')
  assert.equal(run('Café Is! 42?', { mode: 'upper' }), 'CAFÉ IS! 42?')
})

test('Unicode words include accented letters, acronym boundaries, and numeric tokens', () => {
  assert.equal(run('CaféHTTPServer42Name', { mode: 'snake' }), 'café_http_server_42_name')
  assert.equal(run('cafe\u0301 blue', { mode: 'title' }), 'Café Blue')
})

test('punctuation and whitespace delimit words in word-based modes', () => {
  assert.equal(run('one---two...three / four', { mode: 'snake' }), 'one_two_three_four')
})

test('empty input and input containing no tokens are valid in every mode', () => {
  for (const mode of CASE_MODES) {
    assert.equal(run('', { mode }), '')
    assert.equal(run('  -- !!!  ', { mode }), mode === 'lower' || mode === 'sentence'
      ? '  -- !!!  '
      : mode === 'upper' ? '  -- !!!  ' : '')
  }
  assert.equal(run('   '), '')
})

test('camel is the default mode when no options are supplied', () => {
  assert.equal(run('HELLO world'), 'helloWorld')
})

test('unknown options are rejected', () => {
  assert.throws(() => run('hello', { mode: 'camel', separator: '_' }), /unknown option/i)
  assert.throws(() => run('hello', { other: 'value' }), /unknown option/i)
})

test('invalid modes and malformed options are rejected', () => {
  assert.throws(() => run('hello', { mode: 'uppercase' }), /invalid mode/i)
  assert.throws(() => run('hello', { mode: '' }), /invalid mode/i)
  assert.throws(() => run('hello', null), /options must be an object/i)
})

test('input length limit accepts exactly 100,000 characters and rejects longer input', () => {
  assert.equal(MAX_INPUT_LENGTH, 100_000)
  assert.equal(run('a'.repeat(MAX_INPUT_LENGTH), { mode: 'lower' }).length, MAX_INPUT_LENGTH)
  assert.throws(() => run('a'.repeat(MAX_INPUT_LENGTH + 1), { mode: 'lower' }), /100,000.*limit/i)
})
