/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const test = require('node:test')
const { tool } = require('../../app/tools/regex-tester/definition.ts')
const implementation = require('../../app/tools/regex-tester/logic.ts')
const { createRegexWorkerSource, executeRegex, replaceRegex, run, runRegexInWorker, splitRegex, testRegex } = implementation

function workerResult(request) {
  let result
  const self = { postMessage(value) { result = value } }
  vm.runInNewContext(createRegexWorkerSource(), { self })
  self.onmessage({ data: request })
  return result
}

test('regex-tester follows the per-tool contract and documents manual execution', () => {
  assert.equal(tool.id, 'regex-tester')
  assert.equal(tool.href, '/regex-tester')
  assert.equal(tool.status, 'implemented')
  assert.equal(typeof run, 'function')
  assert.doesNotMatch(tool.description, /real[- ]time/i)
})

test('test mode counts matches and safely advances zero-width Unicode matches', () => {
  const result = testRegex('^|$', 'gm', 'one\ntwo')
  assert.equal(result.error, undefined)
  assert.equal(result.count, 4)
  assert.deepEqual(result.matches.map(match => match.index), [0, 3, 4, 7])
  const astral = testRegex('(?:)', 'gu', '😀')
  assert.deepEqual(astral.matches.map(match => match.index), [0, 2])
  assert.equal(testRegex('(', 'g', 'text').error?.length > 0, true)
})

test('replace reports actual matches, expands JavaScript replacement tokens, and limits match volume', () => {
  const result = executeRegex({ pattern: '(a)(?<letter>b)?', flags: 'g', text: 'ab a', mode: 'replace', replacement: '$1-$2-$<letter>-$&-$$' })
  assert.equal(result.count, 2)
  const nativeEquivalent = 'ab a'.replace(/(a)(?<letter>b)?/g, '$1-$2-$<letter>-$&-$$')
  assert.equal(result.display, nativeEquivalent)
  assert.equal(result.display, 'a-b-b-ab-$ a---a-$')
  assert.equal(replaceRegex(',', 'g', 'a,b,c', 'x'), 'axbxc')
  const tooMany = executeRegex({ pattern: 'x', flags: 'g', text: 'x'.repeat(5_001), mode: 'replace', replacement: 'y' })
  assert.match(tooMany.error, /5,000 matches/)
  assert.equal(tooMany.display, undefined)
})

test('replace rejects oversized expansion before building the output string', () => {
  const result = executeRegex({
    pattern: 'a',
    flags: 'g',
    text: 'a'.repeat(10),
    mode: 'replace',
    replacement: 'z'.repeat(60_000),
  })
  assert.match(result.error, /output exceeds 500,000/)
  assert.equal(result.display, undefined)
  assert.match(executeRegex({ pattern: 'a', flags: 'g', text: 'a', mode: 'replace', replacement: 'x'.repeat(200_001) }).error, /Replacement limit/)
})

test('split counts delimiters rather than capture groups and returns only text segments', () => {
  const result = executeRegex({ pattern: '(,)', flags: 'g', text: 'a,b,c', mode: 'split', replacement: '' })
  assert.equal(result.count, 2)
  assert.equal(result.display, 'a\n\n─────\n\nb\n\n─────\n\nc')
  assert.deepEqual(splitRegex(',', '', 'a,b,c'), ['a', 'b', 'c'])
  const joinerInInput = 'left\n\n─────\n\nright,end'
  assert.deepEqual(splitRegex(',', '', joinerInInput), ['left\n\n─────\n\nright', 'end'])
  assert.deepEqual(splitRegex('(?:)', '', ''), [])
  const emptyDelimiter = executeRegex({ pattern: '(?:)', flags: 'g', text: 'abc', mode: 'split', replacement: '' })
  assert.equal(emptyDelimiter.count, 2)
  assert.equal(emptyDelimiter.display, 'a\n\n─────\n\nb\n\n─────\n\nc')
})

test('split stops at the part cap and rejects display expansion before joining parts', () => {
  const result = executeRegex({ pattern: ',', flags: 'g', text: 'x,'.repeat(10_001), mode: 'split', replacement: '' })
  assert.match(result.error, /10,001 parts/)
  assert.equal(result.display, undefined)
  const oversizedInput = executeRegex({ pattern: ',', flags: 'g', text: 'x'.repeat(200_001), mode: 'split', replacement: '' })
  assert.match(oversizedInput.error, /Input limit: 200,000/)
})

test('the actual Blob Worker script uses the same bounded logic for all three modes', () => {
  const testResult = workerResult({ pattern: '\\d+', flags: 'g', text: 'a12 b3', mode: 'test', replacement: '' })
  assert.equal(testResult.count, 2)
  assert.deepEqual(Array.from(testResult.matches, match => match.match), ['12', '3'])
  const replaceResult = workerResult({ pattern: ',', flags: 'g', text: 'a,b,c', mode: 'replace', replacement: ';' })
  assert.equal(replaceResult.count, 2)
  assert.equal(replaceResult.display, 'a;b;c')
  const splitResult = workerResult({ pattern: '(,)', flags: 'g', text: 'a,b,c', mode: 'split', replacement: '' })
  assert.equal(splitResult.count, 2)
  assert.equal(splitResult.display, 'a\n\n─────\n\nb\n\n─────\n\nc')
})

test('worker runner terminates and rejects on timeout', async () => {
  const previousWorker = global.Worker
  const previousCreate = URL.createObjectURL
  const previousRevoke = URL.revokeObjectURL
  let terminated = false
  global.Worker = class {
    postMessage() {}
    terminate() { terminated = true }
  }
  URL.createObjectURL = () => 'blob:regex-test'
  URL.revokeObjectURL = () => {}
  try {
    await assert.rejects(
      runRegexInWorker({ pattern: '(a+)+$', flags: '', text: `${'a'.repeat(40)}!`, mode: 'test', replacement: '' }, 5),
      /timed out after 500 ms/,
    )
    assert.equal(terminated, true)
  } finally {
    global.Worker = previousWorker
    URL.createObjectURL = previousCreate
    URL.revokeObjectURL = previousRevoke
  }
})

test('shared run entry point returns output for each mode and rejects invalid syntax', () => {
  assert.match(run('a1b2', { pattern: '\\d', flags: 'g', mode: 'test' }), /1: 1\n3: 2/)
  assert.equal(run('a1b2', { pattern: '\\d', flags: 'g', mode: 'replace', replacement: 'X' }), 'aXbX')
  assert.equal(run('a1b2', { pattern: '\\d', flags: 'g', mode: 'split' }), 'a\n\n─────\n\nb\n\n─────\n\n')
  assert.throws(() => run('text', { pattern: '(', flags: 'g' }), /Invalid regular expression/)
})

test('every input-changing UI control invalidates results and stale worker replies are ignored', () => {
  const source = fs.readFileSync(path.join(__dirname, '../../app/tools/regex-tester/Tool.tsx'), 'utf8')
  assert.match(source, /if \(id !== requestId\.current\) return/)
  assert.match(source, /onChange=\{event => \{ invalidate\(\); setPattern/)
  assert.match(source, /onChange=\{event => \{ invalidate\(\); setTestText/)
  assert.match(source, /onChange=\{event => \{ invalidate\(\); setReplacement/)
  assert.match(source, /onClick=\{\(\) => \{ invalidate\(\); setMode/)
  assert.match(source, /function toggleFlag\(flag: string\) \{\s*invalidate\(\)/)
})

test('output can be copied in test, replace, and split modes without making the large result a live region', () => {
  const source = fs.readFileSync(path.join(__dirname, '../../app/tools/regex-tester/Tool.tsx'), 'utf8')
  assert.match(source, /result\.display !== undefined\s*\? result\.display\s*:\s*result\.matches\.map/)
  assert.match(source, /navigator\.clipboard\.writeText\(output\)/)
  assert.match(source, /mode === 'test' \? 'Copy matches' : 'Copy result'/)
  assert.doesNotMatch(source, /aria-live="polite"[\s\S]{0,150}aria-label=\{outputLabel\}/)
  assert.match(source, /role=\{error \? 'alert' : 'status'\}/)
})
