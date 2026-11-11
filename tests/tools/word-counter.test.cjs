/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/word-counter/definition.ts')
const { MAX_INPUT_LENGTH, run } = require('../../app/tools/word-counter/logic.ts')

function parse(input, options) {
  return JSON.parse(run(input, options))
}

test('word-counter has an implemented definition and JSON output contract', () => {
  assert.equal(tool.id, 'word-counter')
  assert.equal(tool.href, '/word-counter')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.outputExtension, 'json')
  assert.deepEqual(tool.defaultOptions, {})

  const result = parse(tool.exampleInput, tool.defaultOptions)
  assert.deepEqual(Object.keys(result), [
    'words',
    'characters',
    'charactersWithoutWhitespace',
    'lines',
    'paragraphs',
    'sentences',
    'readingMinutes',
  ])
  assert.equal(typeof run('text'), 'string')
})

test('counts accented Unicode words and grapheme characters including a family emoji', () => {
  const input = 'Olá, mundo! Café e 👨‍👩‍👧‍👦.'
  assert.deepEqual(parse(input), {
    words: 4,
    characters: 21,
    charactersWithoutWhitespace: 17,
    lines: 1,
    paragraphs: 1,
    sentences: 2,
    readingMinutes: 0.02,
  })
})

test('counts sentence punctuation, CRLF/LF lines, and paragraphs separated by blank lines', () => {
  const result = parse('Ação, coração.\r\nPróxima frase? Sim!\n\nÚltimo parágrafo.')
  assert.equal(result.words, 7)
  assert.equal(result.lines, 4)
  assert.equal(result.paragraphs, 2)
  assert.equal(result.sentences, 4)
  assert.equal(result.readingMinutes, 7 / 200)
})

test('returns zero for every count when the input is empty', () => {
  assert.deepEqual(parse(''), {
    words: 0,
    characters: 0,
    charactersWithoutWhitespace: 0,
    lines: 0,
    paragraphs: 0,
    sentences: 0,
    readingMinutes: 0,
  })
})

test('counts whitespace-only content as characters and lines but no words or paragraphs', () => {
  assert.deepEqual(parse(' \t\n'), {
    words: 0,
    characters: 3,
    charactersWithoutWhitespace: 0,
    lines: 2,
    paragraphs: 0,
    sentences: 0,
    readingMinutes: 0,
  })
})

test('accepts the maximum input size and rejects anything larger', () => {
  assert.equal(parse('x'.repeat(MAX_INPUT_LENGTH)).characters, MAX_INPUT_LENGTH)
  assert.throws(() => run('x'.repeat(MAX_INPUT_LENGTH + 1)), /1,000,000 characters/)
})

test('rejects invalid input and all supplied options', () => {
  assert.throws(() => run(null), /input must be a string/i)
  assert.throws(() => run('text', null), /options must be an empty object/i)
  assert.throws(() => run('text', { locale: 'en-US' }), /unknown option.*locale/i)
  assert.throws(() => run('text', []), /options must be an empty object/i)
})
