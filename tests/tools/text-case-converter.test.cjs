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
  assert.equal(tool.exampleInput, 'Olá, Mundo! revisão 2:Texto')
  assert.deepEqual(tool.defaultOptions, { mode: 'camel' })
  assert.equal(CASE_MODES.length, 9)
})

test('camel mode normalizes words and existing camel-case boundaries', () => {
  assert.equal(run('Olá, Mundo! revisão 2:Texto', { mode: 'camel' }), 'oláMundoRevisão2Texto')
  assert.equal(run('alreadyCamelCase', { mode: 'camel' }), 'alreadyCamelCase')
})

test('pascal mode capitalizes every token', () => {
  assert.equal(run('olá mundo', { mode: 'pascal' }), 'OláMundo')
})

test('snake mode joins lowercase Unicode words with underscores', () => {
  assert.equal(run('Crème brûlée déjà', { mode: 'snake' }), 'crème_brûlée_déjà')
})

test('kebab mode joins lowercase words with hyphens', () => {
  assert.equal(run('Bom dia, mundo!', { mode: 'kebab' }), 'bom-dia-mundo')
})

test('constant mode joins uppercase words with underscores', () => {
  assert.equal(run('ação rápida', { mode: 'constant' }), 'AÇÃO_RÁPIDA')
})

test('title mode capitalizes every word and uses spaces', () => {
  assert.equal(run('mistura de palavras', { mode: 'title' }), 'Mistura De Palavras')
})

test('sentence mode uppercases the first letter and lowercases the rest, preserving separators', () => {
  assert.equal(run('  hÉLLO, WORLD! ', { mode: 'sentence' }), '  Héllo, world! ')
  assert.equal(run('123 -- ÀBC', { mode: 'sentence' }), '123 -- Àbc')
})

test('lower and upper modes convert the full string while preserving punctuation', () => {
  assert.equal(run('Já É! 42?', { mode: 'lower' }), 'já é! 42?')
  assert.equal(run('Já É! 42?', { mode: 'upper' }), 'JÁ É! 42?')
})

test('Unicode words include accented letters, acronym boundaries, and numeric tokens', () => {
  assert.equal(run('ÉcoleHTTPServer42Name', { mode: 'snake' }), 'école_http_server_42_name')
  assert.equal(run('cafe\u0301 noir', { mode: 'title' }), 'Café Noir')
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
