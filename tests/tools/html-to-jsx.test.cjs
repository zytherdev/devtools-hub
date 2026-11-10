/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/html-to-jsx/definition.ts')
const implementation = require('../../app/tools/html-to-jsx/logic.ts')
const { MAX_HTML_DEPTH, MAX_HTML_INPUT_LENGTH } = require('../../app/tools/html-to-jsx/lib/constants.ts')

test('html-to-jsx follows the per-tool contract and supplies a JSX sample', () => {
  assert.equal(tool.id, 'html-to-jsx')
  assert.equal(tool.href, '/html-to-jsx')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.outputExtension, 'jsx')
  assert.ok(tool.exampleInput.includes('<li>Item 1</li>'))
  assert.equal(implementation.sampleHTML, tool.exampleInput)
  assert.equal(typeof implementation.run, 'function')
  assert.match(implementation.run('<label for="name" class="field">Name</label>'), /htmlFor="name" className="field"/)
})

test('script and style raw text preserve less-than signs and embedded tag-like strings', () => {
  const source = '<script>const limit = 3 < 4; /* <div> */</script><style>.x::before { content: "<"; }</style>'
  const output = implementation.run(source)
  assert.match(output, /const limit = 3 < 4; \/\* <div> \*\//)
  assert.ok(output.includes('content: \\"<\\"'))
  assert.match(output, /<\/script>/)
  assert.match(output, /<\/style>/)
})

test('implicitly closes common list items and paragraphs', () => {
  const source = '<ul><li>First<li>Second</ul><p>One<p>Two<div>Next</div>'
  assert.equal(implementation.isValidHTML(source), true)
  const output = implementation.run(source)
  assert.equal((output.match(/<li>/g) || []).length, 2)
  assert.equal((output.match(/<p>/g) || []).length, 2)
  assert.match(output, /<\/ul>/)
  assert.match(output, /<div>/)
})

test('preserves significant spaces between inline nodes and text', () => {
  const output = implementation.run('<p>Hello <strong>bright</strong> world <em>today</em>!</p>')
  assert.match(output, /"Hello "/)
  assert.match(output, /" world "/)
  assert.match(output, /"!"/)
  const adjacent = implementation.run('<p><span>one</span> <span>two</span></p>')
  assert.match(adjacent, /\{" "\}/)
})

test('decodes common named and numeric entities while retaining unknown names', () => {
  const output = implementation.run('<p title="Tom &amp; Jerry">&copy; &#x1F642; &unknown;</p>')
  assert.match(output, /title="Tom &amp; Jerry"/)
  assert.match(output, /© 🙂 &unknown;/)
})

test('filters event and selected dangerous URL attributes case-insensitively', () => {
  const source = '<a HREF="JaVaScRiPt:alert(1)" ONCLICK="run()" Xlink:href="javascript:bad()" target="_blank">link</a><form><button FORMACTION=" javascript:bad()" onLoad="run()">send</button></form><iframe SRCDOC="<script>bad()</script>"></iframe>'
  const output = implementation.run(source)
  assert.doesNotMatch(output, /(?:href|formAction|onClick|onLoad|srcDoc)=/i)
  assert.match(output, /target="_blank"/)
  assert.match(output, /<a(?:\s|>)/)
  assert.match(output, /<button(?:\s|>)/)
})

test('round-trips normal attribute/style/text content through the conversion output', () => {
  const source = '<div class="card"><p style="margin-top: 0; color: red">A &amp; B</p><input disabled></div>'
  const output = implementation.run(source)
  assert.match(output, /className="card"/)
  assert.match(output, /style=\{ marginTop: "0", color: "red" \}/)
  assert.match(output, /"A & B"/)
  assert.match(output, /<input disabled \/>/)
})

test('rejects invalid markup and invalid conversion options with useful errors', () => {
  assert.equal(implementation.isValidHTML('<div></span>'), false)
  assert.throws(() => implementation.run('<div></span>'), /Unexpected closing tag/i)
  assert.throws(() => implementation.run('<p>ok</p>', { preserveWhitespace: 'yes' }), /must be a boolean/i)
  assert.throws(() => implementation.run('<p>ok</p>', { unsupported: true }), /Unknown conversion option/i)
})

test('checks size and depth bounds before building the AST or JSX', () => {
  assert.throws(() => implementation.run('x'.repeat(MAX_HTML_INPUT_LENGTH + 1)), /character limit/i)
  const deep = `${'<div>'.repeat(MAX_HTML_DEPTH + 1)}x${'</div>'.repeat(MAX_HTML_DEPTH + 1)}`
  assert.throws(() => implementation.run(deep), /maximum nesting depth/i)
  assert.equal(implementation.isValidHTML(deep), false)
})
