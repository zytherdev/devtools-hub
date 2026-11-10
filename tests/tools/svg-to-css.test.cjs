/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/svg-to-css/definition.ts')
const implementation = require('../../app/tools/svg-to-css/logic.ts')

const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M1 2"/></svg>'
const encodedDataURI = output => output.match(/data:image\/svg\+xml,([^"\s)]+)/)?.[1]

test('svg-to-css follows the per-tool contract and downloads CSS', () => {
  assert.equal(tool.id, 'svg-to-css')
  assert.equal(tool.href, '/svg-to-css')
  assert.equal(tool.outputExtension, 'css')
  assert.equal(typeof implementation.run, 'function')
  assert.equal(tool.status, 'implemented')
})

test('generates valid background and mask rules without an invalid empty selector', () => {
  const background = implementation.run(svg, { format: 'background-image', addPrefix: false })
  assert.match(background, /^:root \{/)
  assert.match(background, /background-image: url\("data:image\/svg\+xml,/)
  assert.doesNotMatch(background, /^\s*\{/)

  const mask = implementation.run(svg, { format: 'mask-image', addPrefix: false })
  assert.match(mask, /^:root \{/)
  assert.match(mask, /mask-image:/)
  assert.match(mask, /-webkit-mask-image:/)
})

test('content mode emits a selector even without a configured class', () => {
  const output = implementation.run(svg, { format: 'content', addPrefix: false })
  assert.match(output, /^:root::before \{/)
  assert.match(output, /content: url\("data:image\/svg\+xml,/)
})

test('all output modes generate their expected forms', () => {
  const background = implementation.run(svg, { format: 'background-image', prefix: 'symbol' })
  const mask = implementation.run(svg, { format: 'mask-image', prefix: 'symbol' })
  const content = implementation.run(svg, { format: 'content', prefix: 'symbol' })
  const url = implementation.run(svg, { format: 'url' })

  assert.match(background, /^\.symbol \{/)
  assert.match(background, /background-repeat: no-repeat/)
  assert.match(mask, /^\.symbol \{/)
  assert.match(mask, /-webkit-mask-repeat: no-repeat/)
  assert.match(content, /^\.symbol::before \{/)
  assert.match(url, /^url\("data:image\/svg\+xml,[^"\n]+"\)$/)
})

test('percent-encodes URI-sensitive SVG text and survives URI decoding', () => {
  const source = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><text>café #1 &amp; \'quoted\'</text></svg>'
  const output = implementation.run(source, { format: 'url' })
  const encoded = encodedDataURI(output)
  assert.ok(encoded)
  assert.match(encoded, /%23/)
  assert.match(encoded, /%26/)
  assert.match(encoded, /%27/)
  assert.equal(decodeURIComponent(encoded), source)
})

test('structural scanner rejects malformed XML and reports its scope honestly', () => {
  const malformed = [
    '<svg viewBox="0 0 1 1"><g></svg>',
    '<svg viewBox="0 0 1 1"><path d=x/></svg>',
    '<svg viewBox="0 0 1 1"><path></svg>',
    '<svg viewBox="0 0 1 1"><path a="1" a="2"/></svg>',
    '<svg viewBox="0 0 1 1"><text>&unknown;</text></svg>',
    '<svg viewBox="0 0 1 1"></svg><svg viewBox="0 0 1 1"></svg>',
    '<svg viewBox="0 0 1 1"><!-- invalid -- comment --></svg>',
    '<svg viewBox="0 0 1 1"><path></svg>',
    '<?xml?><svg viewBox="0 0 1 1"/>',
    ' <svg viewBox="0 0 1 1"/>',
  ]
  for (const source of malformed) {
    assert.equal(implementation.isValidSVG(source), false, source)
    assert.throws(() => implementation.run(source), /Malformed XML|unknown XML entity/)
  }
  assert.throws(() => implementation.run('<!DOCTYPE svg><svg viewBox="0 0 1 1"/>'), /DOCTYPE.*not supported/)
  assert.equal(implementation.isValidSVG('<svg viewBox="0 0 1 1"><path d="M0 0"/></svg>'), true)
})

test('requires one SVG root and dimensions', () => {
  assert.equal(implementation.isValidSVG('<html viewBox="0 0 1 1"/>'), false)
  assert.equal(implementation.isValidSVG('<svg width="12"/>'), false)
  assert.equal(implementation.isValidSVG('<svg width="12" height="12"/>'), true)
  assert.equal(implementation.isValidSVG('<svg viewBox=""/>'), false)
})

test('enforces the input limit before conversion', () => {
  const atLimit = svg + ' '.repeat(implementation.MAX_SVG_INPUT_LENGTH - svg.length)
  assert.equal(atLimit.length, implementation.MAX_SVG_INPUT_LENGTH)
  assert.equal(implementation.isValidSVG(atLimit), true)
  assert.equal(implementation.run(atLimit, { format: 'url' }).startsWith('url('), true)

  const overLimit = `${atLimit} `
  assert.equal(implementation.isValidSVG(overLimit), false)
  assert.throws(() => implementation.run(overLimit), /200,000 character limit/)
})

test('optimization and CSS minification perform distinct transformations', () => {
  const source = '<?xml version="1.0"?>\n<svg viewBox="0 0 1 1"><!-- note --><path/></svg>\n'
  const optimized = implementation.run(source, { format: 'url', optimize: true })
  const preserved = implementation.run(source, { format: 'url', optimize: false })
  assert.equal(decodeURIComponent(encodedDataURI(optimized)), '<svg viewBox="0 0 1 1"><path/></svg>')
  assert.equal(decodeURIComponent(encodedDataURI(preserved)), source.trim())

  const prettyCSS = implementation.run(svg, { minify: false })
  const compactCSS = implementation.run(svg, { minify: true })
  assert.notEqual(compactCSS, prettyCSS)
  assert.match(compactCSS, /^\.icon\{background-image:/)
  assert.equal(decodeURIComponent(encodedDataURI(compactCSS)), decodeURIComponent(encodedDataURI(prettyCSS)))
})

test('validates conversion options', () => {
  assert.throws(() => implementation.run(svg, { format: 'invalid' }), /Format must be/)
  assert.throws(() => implementation.run(svg, { prefix: 'not a class' }), /valid identifier/)
  assert.throws(() => implementation.run(svg, { minify: 'yes' }), /must be boolean/)
  assert.throws(() => implementation.run(''), /Paste SVG markup/)
})
