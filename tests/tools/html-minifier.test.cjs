/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/html-minifier/definition.ts')
const { MAX_INPUT_LENGTH, minifyHTML, run } = require('../../app/tools/html-minifier/logic.ts')

test('html-minifier follows the per-tool contract', () => {
  assert.equal(tool.id, 'html-minifier')
  assert.equal(tool.href, '/html-minifier')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.outputExtension, 'html')
  assert.ok(tool.exampleInput.length > 0)
  assert.equal(run('<p>  hi </p>', {}), '<p> hi </p>')
})

test('raw-text close tags require a valid tag-name boundary', () => {
  const input = '<script>const a="</scripture><!-- keep me -->"; // </scripture>\nconst b=1;</script><p>  ok  </p>'
  const expected = '<script>const a="</scripture><!-- keep me -->"; // </scripture>\nconst b=1;</script><p> ok </p>'
  assert.equal(minifyHTML(input), expected)
})

test('script strings and comments are not treated as HTML comments', () => {
  const input = '<script>const s="<!-- not markup -->"; /* <!-- also not markup --> */</script><!-- remove me -->'
  assert.equal(minifyHTML(input), '<script>const s="<!-- not markup -->"; /* <!-- also not markup --> */</script>')
})

test('raw-text scanning keeps correct offsets after Unicode text', () => {
  const input = 'İ<script>const s="</scripture>";</script><p>  after  </p>'
  assert.equal(minifyHTML(input), 'İ<script>const s="</scripture>";</script><p> after </p>')
})

test('preserves whitespace-sensitive style, textarea, and pre contents', () => {
  const input = '<style>\n  .x {  color: red; }\n</style><textarea>\n  A   B\n  <b>raw</b>\n</textarea><pre>\n  A   B\n</pre>'
  assert.equal(minifyHTML(input), input)
})

test('preserves conditional, SSI, license, and directive comments but removes ordinary comments', () => {
  const input = '<!-- ordinary --><!--[if IE]>legacy<![endif]--><!--#include virtual="/x" --><!--! keep --><!-- @license MIT --><!-- @preserve keep --><!--googleoff: all--><div><!-- gone --></div>'
  const expected = '<!--[if IE]>legacy<![endif]--><!--#include virtual="/x" --><!--! keep --><!-- @license MIT --><!-- @preserve keep --><!--googleoff: all--><div></div>'
  assert.equal(minifyHTML(input), expected)
})

test('compresses ordinary text whitespace without erasing significant separators', () => {
  const input = '<p> alpha   <em title="keep   spaces">beta</em> \n gamma </p>'
  assert.equal(minifyHTML(input), '<p> alpha <em title="keep   spaces">beta</em> gamma </p>')
})

test('normalizes tag whitespace while retaining quoted attribute contents', () => {
  assert.equal(minifyHTML('<div   class =  "a   b"   data-x = one  >x</div>'), '<div class="a   b" data-x=one>x</div>')
})

test('retains malformed unterminated comments and tags instead of discarding content', () => {
  const comment = '<p>before<!-- unclosed  comment'
  const tag = '<div title="unclosed>  content'
  assert.equal(minifyHTML(comment), comment)
  assert.equal(minifyHTML(tag), tag)
})

test('enforces the explicit input limit and validates input/options', () => {
  assert.equal(minifyHTML('x'.repeat(MAX_INPUT_LENGTH)).length, MAX_INPUT_LENGTH)
  assert.throws(() => run('x'.repeat(MAX_INPUT_LENGTH + 1), {}), /1,000,000 characters or fewer/)
  assert.throws(() => run(null, {}), /input must be a string/i)
  assert.throws(() => run('<p>x</p>', { advanced: 'true' }), /unsupported.*option/i)
  assert.throws(() => run('<p>x</p>', null), /options must be an object/i)
})
