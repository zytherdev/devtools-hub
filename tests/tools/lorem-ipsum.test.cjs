/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/lorem-ipsum/definition.ts')
const implementation = require('../../app/tools/lorem-ipsum/logic.ts')

test('lorem-ipsum follows the per-tool contract and uses the shared UI', () => {
  assert.equal(tool.id, 'lorem-ipsum')
  assert.equal(tool.href, '/lorem-ipsum')
  assert.equal(tool.status, 'implemented')
  assert.equal(typeof implementation.run, 'function')
  assert.match(require('node:fs').readFileSync('app/tools/lorem-ipsum/Tool.tsx', 'utf8'), /UniversalTool/)
})

test('generates the requested paragraphs, sentences, and word count deterministically', () => {
  const options = { paragraphs: '2', sentencesPerParagraph: '2', wordsPerSentence: '5', format: 'paragraphs' }
  const output = implementation.run('', options)
  assert.equal(output, implementation.run('', options))
  assert.equal(output.split('\n\n').length, 2)
  assert.equal((output.match(/\./g) ?? []).length, 4)
  for (const sentence of output.match(/[^.]+\./g)) assert.equal(sentence.trim().split(/\s+/).length, 5)
})

test('single format combines paragraphs into one continuous block', () => {
  const output = implementation.run('', { paragraphs: '2', sentencesPerParagraph: '1', wordsPerSentence: '4', format: 'single' })
  assert.equal(output.includes('\n'), false)
  assert.equal((output.match(/\./g) ?? []).length, 2)
})

test('validates input, options, formats, and numeric boundaries', () => {
  assert.throws(() => implementation.run('seed', {}), /does not accept input text/)
  assert.throws(() => implementation.run('', { format: 'html' }), /format must be/)
  assert.throws(() => implementation.run('', { paragraphs: '0' }), /paragraphs must be/)
  assert.throws(() => implementation.run('', { sentencesPerParagraph: '21' }), /sentencesPerParagraph/)
  assert.throws(() => implementation.run('', { wordsPerSentence: '2' }), /wordsPerSentence/)
  assert.throws(() => implementation.run('', { extra: 'x' }), /Unknown option/)
})
