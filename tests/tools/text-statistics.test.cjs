/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { tool } = require('../../app/tools/text-statistics/definition.ts')
const implementation = require('../../app/tools/text-statistics/logic.ts')

test('counts Unicode words, grapheme clusters, and non-whitespace characters', () => {
  const result = implementation.analyzeText('A e\u0301 👩‍👩‍👧‍👦!')
  assert.equal(result.words, 2)
  assert.equal(result.characters, 6)
  assert.equal(result.charactersWithoutWhitespace, 4)
  assert.equal(result.lines, 1)
  assert.equal(result.paragraphs, 1)
  assert.equal(result.readingTimeMinutes, 1)
  assert.equal(result.wordsPerMinute, 200)
})

test('counts Unicode word-like segments and groups paragraphs across blank lines', () => {
  const text = 'Hello, world! don’t stop.\r\nNext.\r\n \t\r\nLast line\u2028'
  const result = implementation.analyzeText(text, { wordsPerMinute: '2' })
  assert.equal(result.words, 7)
  assert.equal(result.lines, 5)
  assert.equal(result.paragraphs, 2)
  assert.equal(result.readingTimeMinutes, 4)
  assert.equal(result.wordsPerMinute, 2)
})

test('empty text and disabled reading-time option have explicit zero/omitted values', () => {
  assert.deepEqual(implementation.analyzeText(''), {
    words: 0,
    characters: 0,
    charactersWithoutWhitespace: 0,
    lines: 0,
    paragraphs: 0,
    readingTimeMinutes: 0,
    wordsPerMinute: 200,
  })
  const withoutEstimate = implementation.analyzeText('One two.', { includeReadingTime: 'false' })
  assert.equal(withoutEstimate.words, 2)
  assert.equal(Object.hasOwn(withoutEstimate, 'readingTimeMinutes'), false)
  assert.equal(Object.hasOwn(withoutEstimate, 'wordsPerMinute'), false)
})

test('line boundaries include trailing empty lines and treat CRLF as one break', () => {
  const result = implementation.analyzeText('a\r\nb\n')
  assert.equal(result.lines, 3)
  assert.equal(result.paragraphs, 1)
})

test('rejects invalid input and invalid or unsupported options', () => {
  assert.throws(() => implementation.run(null), /Input must be a string/i)
  assert.throws(() => implementation.run('x'.repeat(implementation.MAX_INPUT_CHARS + 1)), /character limit/i)
  assert.throws(() => implementation.run('x', null), /Options must be an object/i)
  assert.throws(() => implementation.run('x', []), /Options must be an object/i)
  assert.throws(() => implementation.run('x', Object.create({ includeReadingTime: 'false' })), /plain object/i)
  assert.throws(() => implementation.run('x', { format: 'json' }), /Unsupported option: format/i)
  assert.throws(() => implementation.run('x', { includeReadingTime: 'yes' }), /includeReadingTime/i)
  assert.throws(() => implementation.run('x', { includeReadingTime: undefined }), /includeReadingTime/i)
  assert.throws(() => implementation.run('x', { includeReadingTime: true }), /includeReadingTime/i)
  for (const wordsPerMinute of ['', '0', '-1', '1.5', '1001', '0200', 200]) {
    assert.throws(() => implementation.run('x', { wordsPerMinute }), /wordsPerMinute/i)
  }
})

test('accepts input and reading-rate boundary values', () => {
  const atLimit = implementation.analyzeText('x'.repeat(implementation.MAX_INPUT_CHARS), { wordsPerMinute: '1' })
  assert.equal(atLimit.characters, implementation.MAX_INPUT_CHARS)
  assert.equal(atLimit.words, 1)
  assert.equal(atLimit.wordsPerMinute, 1)
  assert.equal(implementation.analyzeText('x', { wordsPerMinute: '1000' }).wordsPerMinute, 1000)
})

test('run produces a readable report with an optional reading-time line', () => {
  assert.match(implementation.run('one two', { wordsPerMinute: '1' }), /Estimated reading time: 2 min at 1 words\/min/)
  assert.doesNotMatch(implementation.run('one two', { includeReadingTime: 'false' }), /reading time/i)
})

test('definition and UI follow the implemented local-tool contract', () => {
  assert.equal(tool.id, 'text-statistics')
  assert.equal(tool.href, '/text-statistics')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.badge, '')
  const source = fs.readFileSync(path.join(__dirname, '../../app/tools/text-statistics/Tool.tsx'), 'utf8')
  assert.match(source, /ToolPanel/)
  assert.match(source, /not transmit or store your text/i)
  assert.match(source, /onKeyDown=/)
  assert.doesNotMatch(source, /fetch\s*\(|localStorage|sessionStorage/)
})
