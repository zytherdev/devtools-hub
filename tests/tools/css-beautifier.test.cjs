/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { tool } = require('../../app/tools/css-beautifier/definition.ts')
const implementation = require('../../app/tools/css-beautifier/logic.ts')
const { beautifyCSS, defaultCSSOptions, formatCSSWithPreferences, MAX_CSS_INPUT_LENGTH, run } = implementation

const modernCss = '.layout{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));--space:1rem;gap:var(--space);content:"keep   these spaces"}@layer components{@container card (width>20rem){.layout{padding:2rem;& .title{color:oklch(45% .16 260)}}}}@starting-style{.layout{opacity:0}}'

test('css-beautifier follows the per-tool contract and aligned catalog defaults', () => {
  assert.equal(tool.id, 'css-beautifier')
  assert.equal(tool.href, '/css-beautifier')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.outputExtension, 'css')
  assert.equal(tool.exampleInput, modernCss)
  assert.deepEqual(tool.defaultOptions, {
    indentSize: '2',
    indentChar: ' ',
    printWidth: '100',
    endWithNewline: 'false',
  })
  assert.deepEqual(defaultCSSOptions, {
    indentSize: 2,
    indentChar: ' ',
    printWidth: 100,
    endWithNewline: false,
  })
  assert.equal(typeof run, 'function')
  assert.match(fs.readFileSync(path.join(__dirname, '../../app/tools/registry.ts'), 'utf8'), /css-beautifier/)
  assert.match(fs.readFileSync(path.join(__dirname, '../../app/tools/componentRegistry.ts'), 'utf8'), /css-beautifier/)
})

test('formats modern CSS and preserves whitespace inside quoted strings', async () => {
  const result = await run(modernCss)
  assert.match(result, /@layer components/)
  assert.match(result, /@container card/)
  assert.match(result, /& \.title/)
  assert.match(result, /@starting-style/)
  assert.match(result, /content: "keep   these spaces";/)
  assert.equal(result.endsWith('\n'), false)
})

test('validates indentation, tabs, line width, and newline options through run', async () => {
  const spaces = await run('.a{color:red}', { indentSize: '4' })
  assert.match(spaces, /\n    color: red;/)

  const tabs = await run('.a{color:red}', { indentChar: '\t', endWithNewline: 'true' })
  assert.match(tabs, /\n\tcolor: red;/)
  assert.equal(tabs.endsWith('\n'), true)

  const withoutFinalNewline = await run('.a{color:red}', { endWithNewline: 'false' })
  assert.equal(withoutFinalNewline.endsWith('\n'), false)
})

test('the shared Line width preference is forwarded as Prettier printWidth', async () => {
  const source = '.layout{background-image:linear-gradient(90deg,red 0%,orange 20%,yellow 40%,green 60%,blue 80%,purple 100%);padding:1rem;margin:2rem}'
  const narrow = await formatCSSWithPreferences(source, { indentSize: 2, indentChar: ' ', wrapLineLength: 40 })
  const wide = await formatCSSWithPreferences(source, { indentSize: 2, indentChar: ' ', wrapLineLength: 140 })
  assert.notEqual(narrow, wide)
  assert.ok(narrow.split('\n').length > wide.split('\n').length)

  const wrapperSource = fs.readFileSync(path.join(__dirname, '../../app/tools/css-beautifier/Tool.tsx'), 'utf8')
  assert.match(wrapperSource, /formatCSSWithPreferences\(source, preferences, endWithNewline\)/)
  assert.match(wrapperSource, /id="css-end-with-newline"/)
})

test('rejects malformed CSS with a useful parser error', async () => {
  await assert.rejects(run('.card { color: red'), /CssSyntaxError|SyntaxError|Unexpected end/i)
})

test('rejects invalid inputs and every unsupported or malformed option', async () => {
  await assert.rejects(run(''), /Paste CSS code/i)
  await assert.rejects(run('   '), /Paste CSS code/i)
  await assert.rejects(run(null), /Paste CSS code/i)
  await assert.rejects(run('.a{}', { indentSize: '0' }), /Indent size must be a whole number from 1 to 8/i)
  await assert.rejects(run('.a{}', { indentSize: '9' }), /Indent size must be a whole number from 1 to 8/i)
  await assert.rejects(run('.a{}', { indentSize: '2.5' }), /Indent size must be a whole number/i)
  await assert.rejects(run('.a{}', { indentChar: 'spaces' }), /Indent character must be a space or a tab/i)
  await assert.rejects(run('.a{}', { printWidth: '39' }), /Line width must be a whole number from 40 to 160/i)
  await assert.rejects(run('.a{}', { wrapLineLength: '161' }), /Line width must be a whole number from 40 to 160/i)
  await assert.rejects(run('.a{}', { printWidth: '80.5' }), /Line width must be a whole number/i)
  await assert.rejects(run('.a{}', { endWithNewline: 'yes' }), /End with newline must be "true" or "false"/i)
  await assert.rejects(run('.a{}', { unknown: 'value' }), /Unknown CSS option: unknown/i)
  await assert.rejects(run('.a{}', { printWidth: '80', wrapLineLength: '100' }), /Choose either printWidth or wrapLineLength/i)
  await assert.rejects(run('.a{}', null), /CSS options must be provided as an object/i)
  await assert.rejects(beautifyCSS('.a{}', { indentSize: 2.5 }), /Indent size must be a whole number/i)
  await assert.rejects(beautifyCSS('.a{}', { endWithNewline: 'true' }), /End with newline must be true or false/i)
})

test('enforces the bounded input size and accepts the exact supported boundary', async () => {
  await assert.rejects(run(`/*${'x'.repeat(MAX_CSS_INPUT_LENGTH - 3)}*/`), /limited to 100,000 characters/i)
  const exactBoundary = `/*${'x'.repeat(MAX_CSS_INPUT_LENGTH - 4)}*/`
  assert.equal(exactBoundary.length, MAX_CSS_INPUT_LENGTH)
  const formatted = await run(exactBoundary)
  assert.ok(formatted.startsWith('/*'))
})

test('uses only locally bundled formatting code and does not make network requests', () => {
  const source = fs.readFileSync(path.join(__dirname, '../../app/tools/css-beautifier/logic.ts'), 'utf8')
  assert.match(source, /prettier\/standalone/)
  assert.match(source, /prettier\/plugins\/postcss/)
  assert.doesNotMatch(source, /\bfetch\s*\(|XMLHttpRequest|https?:\/\//i)
})
