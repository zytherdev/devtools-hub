/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/color-converter/definition.ts')
const implementation = require('../../app/tools/color-converter/logic.ts')

test('parses every advertised format and supported color names', () => {
  assert.deepEqual(implementation.parseColorString('#f00'), { r: 255, g: 0, b: 0 })
  assert.deepEqual(implementation.parseColorString('RGB(0, 128, 255)'), { r: 0, g: 128, b: 255 })
  assert.deepEqual(implementation.parseColorString('hsl(120, 100%, 50%)'), { r: 0, g: 255, b: 0 })
  assert.deepEqual(implementation.parseColorString('hsv(240, 100%, 100%)'), { r: 0, g: 0, b: 255 })
  assert.deepEqual(implementation.parseColorString('cmyk(0%, 100%, 100%, 0%)'), { r: 255, g: 0, b: 0 })
  assert.deepEqual(implementation.parseColorString('  CORAL  '), { r: 255, g: 127, b: 80 })
})

test('rejects inherited object-property names as colors', () => {
  for (const name of ['constructor', 'toString', 'hasOwnProperty', '__proto__', 'valueOf']) {
    assert.equal(implementation.parseColorString(name), null)
  }
})

test('rejects out-of-range and overlong input while accepting channel boundaries', () => {
  assert.deepEqual(implementation.parseColorString('rgb(0, 255, 255)'), { r: 0, g: 255, b: 255 })
  assert.deepEqual(implementation.parseColorString('hsl(360, 100%, 50%)'), { r: 255, g: 0, b: 0 })
  assert.equal(implementation.parseColorString('rgb(256, 0, 0)'), null)
  assert.equal(implementation.parseColorString('hsl(361, 0%, 50%)'), null)
  assert.equal(implementation.parseColorString('hsv(0, 101%, 50%)'), null)
  assert.equal(implementation.parseColorString('cmyk(0%, 0%, 0%, 101%)'), null)
  assert.equal(implementation.parseColorString('x'.repeat(implementation.MAX_COLOR_INPUT_LENGTH + 1)), null)
  assert.equal(implementation.parseColorString(''), null)
  assert.equal(implementation.parseColorString(null), null)
})

test('run emits each supported output and rejects invalid formats/options/input', () => {
  const expected = {
    hex: '#ff0000',
    rgb: 'rgb(255, 0, 0)',
    hsl: 'hsl(0, 100%, 50%)',
    hsv: 'hsv(0, 100%, 100%)',
    cmyk: 'cmyk(0%, 100%, 100%, 0%)',
    name: 'Red',
  }
  for (const [format, output] of Object.entries(expected)) {
    assert.equal(implementation.run('red', { format }), output)
  }
  assert.throws(() => implementation.run('not-a-color'), /Invalid color/i)
  assert.throws(() => implementation.run('#fff', { format: 'lab' }), /Unsupported color format/i)
  assert.throws(() => implementation.run('#fff', { precision: 2 }), /Unsupported option/i)
})

test('all color formats retain zero-valued RGB channels for black', () => {
  const black = { r: 0, g: 0, b: 0 }
  assert.deepEqual(Object.fromEntries(implementation.COLOR_FORMATS.map(format => [format, implementation.formatColor(black, format)])), {
    hex: '#000000',
    rgb: 'rgb(0, 0, 0)',
    hsl: 'hsl(0, 0%, 0%)',
    hsv: 'hsv(0, 0%, 0%)',
    cmyk: 'cmyk(0%, 0%, 0%, 100%)',
    name: 'Black',
  })
})

test('complementary color rotates hue and contrast uses WCAG relative luminance', () => {
  assert.deepEqual(implementation.getHueComplementaryColor({ r: 255, g: 0, b: 0 }), { r: 0, g: 255, b: 255 })
  assert.equal(implementation.getContrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }), 21)
  assert.equal(implementation.getContrastColor({ r: 119, g: 119, b: 119 }).r, 0)
  assert.equal(implementation.getContrastRatio({ r: 119, g: 119, b: 119 }, { r: 0, g: 0, b: 0 }).toFixed(2), '4.69')
})

test('UI provides one input-scoped shortcut and accessible inline feedback without alerts', () => {
  const source = require('node:fs').readFileSync(require('node:path').join(__dirname, '../../app/tools/color-converter/Tool.tsx'), 'utf8')
  assert.match(source, /onKeyDown=\{handleInputKeyDown\}/)
  assert.match(source, /event\.ctrlKey \|\| event\.metaKey/)
  assert.doesNotMatch(source, /document\.addEventListener/)
  assert.doesNotMatch(source, /\balert\s*\(/)
  assert.match(source, /aria-invalid=/)
  assert.match(source, /aria-live=/)
})

test('color-converter follows the per-tool contract', () => {
  assert.equal(tool.id, 'color-converter')
  assert.equal(tool.href, '/color-converter')
  assert.ok(Object.values(implementation).some(value => typeof value === 'function'))
  assert.ok(['implemented', 'planned'].includes(tool.status))
  if (tool.status === 'planned') assert.throws(() => implementation.run('', {}), /planned but not implemented/i)
})
