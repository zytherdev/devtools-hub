/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/box-shadow-generator/definition.ts')
const BoxShadow = require('../../app/tools/box-shadow-generator/logic.ts')

const sampleShadow = {
  inset: false,
  offsetX: 2,
  offsetY: 4,
  blur: 8,
  spread: 1,
  color: 'rgba(0, 0, 0, 0.25)'
}

test('box-shadow-generator keeps its canonical metadata and CSS output contract', () => {
  assert.equal(tool.id, 'box-shadow-generator')
  assert.equal(tool.href, '/box-shadow-generator')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.outputExtension, 'css')
})

test('generates CSS from shadow data, including presets and the empty none state', () => {
  assert.equal(BoxShadow.generateBoxShadowCSS([sampleShadow]), '2px 4px 8px 1px rgba(0, 0, 0, 0.25)')
  assert.equal(BoxShadow.generateBoxShadowCSS([{ ...sampleShadow, inset: true, spread: 0 }]), 'inset 2px 4px 8px rgba(0, 0, 0, 0.25)')
  assert.equal(BoxShadow.generateBoxShadowCSS([]), 'none')
  assert.match(BoxShadow.generateBoxShadowCSS(BoxShadow.presetShadows[6].shadows), /, /)
  assert.ok(BoxShadow.presetShadows.every(preset => BoxShadow.generateBoxShadowCSS(preset.shadows)))
})

test('validates supported colors and converts preset RGBA colors to native picker RGB', () => {
  assert.equal(BoxShadow.isValidColor('rgba(59, 130, 246, 0.4)'), true)
  assert.equal(BoxShadow.isValidColor('#abcd'), true)
  assert.equal(BoxShadow.isValidColor('hsla(210, 50%, 40%, 0.5)'), true)
  assert.equal(BoxShadow.isValidColor('transparent'), true)
  assert.equal(BoxShadow.isValidColor('rgba(256,0,0,0.5)'), false)
  assert.equal(BoxShadow.isValidColor('rgba(0,0,0,1.5)'), false)
  assert.equal(BoxShadow.isValidColor('not-a-color'), false)
  assert.equal(BoxShadow.isValidColor(null), false)

  assert.equal(BoxShadow.colorToPickerHex('rgba(59,130,246,0.4)'), '#3b82f6')
  assert.equal(BoxShadow.colorToPickerHex('rgba(0,0,0,0.1)'), '#000000')
  assert.equal(BoxShadow.colorToPickerHex('#abcd'), '#aabbcc')
  assert.equal(BoxShadow.colorToPickerHex('hsl(0, 100%, 50%)'), '#ff0000')
  assert.equal(BoxShadow.colorToPickerHex('blue'), '#0000ff')
  assert.throws(() => BoxShadow.colorToPickerHex('invalid'), /supported CSS color/i)
})

test('updateShadow returns immutable changes and rejects invalid runtime input', () => {
  const shadows = [sampleShadow]
  const updated = BoxShadow.updateShadow(shadows, 0, 'offsetX', -50)
  assert.equal(updated[0].offsetX, -50)
  assert.equal(shadows[0].offsetX, 2)
  assert.equal(BoxShadow.updateShadow(shadows, 0, 'color', '  #abcdef  ')[0].color, '#abcdef')
  assert.throws(() => BoxShadow.updateShadow(shadows, 0, 'color', 'bad-color'), /supported CSS color/i)
  assert.throws(() => BoxShadow.updateShadow(shadows, 0, 'blur', 101), /0 to 100/i)
  assert.throws(() => BoxShadow.updateShadow(shadows, 0, 'offsetY', NaN), /finite number/i)
  assert.throws(() => BoxShadow.updateShadow(shadows, 0, 'inset', 'yes'), /boolean/i)
  assert.throws(() => BoxShadow.updateShadow(shadows, 0, 'notAField', true), /supported shadow property/i)
  assert.throws(() => BoxShadow.updateShadow(shadows, 1, 'inset', true), /exists/i)
  assert.throws(() => BoxShadow.updateShadow(null, 0, 'inset', true), /list/i)
})

test('rejects invalid colors at CSS generation rather than silently substituting a fallback', () => {
  assert.throws(() => BoxShadow.generateBoxShadowCSS([{ ...sampleShadow, color: 'broken' }]), /invalid color/i)
  assert.throws(() => BoxShadow.generateBoxShadowCSS([{ ...sampleShadow, blur: -1 }]), /blur.*0 to 100/i)
  assert.throws(() => BoxShadow.generateBoxShadowCSS(Array(6).fill(sampleShadow)), /maximum of 5/i)
})

test('adds at most five layers and can remove the final layer to produce none', () => {
  let shadows = []
  for (let index = 0; index < BoxShadow.MAX_SHADOWS; index += 1) shadows = BoxShadow.addShadow(shadows)
  assert.equal(shadows.length, 5)
  assert.throws(() => BoxShadow.addShadow(shadows), /maximum of 5/i)

  for (let index = shadows.length - 1; index >= 0; index -= 1) shadows = BoxShadow.removeShadow(shadows, index)
  assert.deepEqual(shadows, [])
  assert.equal(BoxShadow.generateBoxShadowCSS(shadows), 'none')
  assert.throws(() => BoxShadow.removeShadow([], 0), /exists/i)
  assert.throws(() => BoxShadow.removeShadow([sampleShadow], 1), /exists/i)
})
