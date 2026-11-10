/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { tool } = require('../../app/tools/gradient-generator/definition.ts')
const Gradient = require('../../app/tools/gradient-generator/logic.ts')

const linear = {
  type: 'linear',
  angle: 0,
  stops: [
    { color: '#ffffff', position: 100 },
    { color: '#000000', position: 0 }
  ]
}

 test('gradient-generator follows the per-tool contract and advertises CSS output', () => {
  assert.equal(tool.id, 'gradient-generator')
  assert.equal(tool.href, '/gradient-generator')
  assert.equal(tool.outputExtension, 'css')
  assert.ok(Object.values(Gradient).some(value => typeof value === 'function'))
  assert.equal(tool.status, 'implemented')
})

test('linear CSS sorts stops and preserves angle zero', () => {
  assert.equal(
    Gradient.generateGradientCSS(linear),
    'background: linear-gradient(0deg, #000000 0%, #ffffff 100%);'
  )
})

test('invalid stops are rejected instead of silently removed', () => {
  const invalidColor = { ...linear, stops: [...linear.stops, { color: 'not-a-color', position: 50 }] }
  assert.throws(() => Gradient.generateGradientCSS(invalidColor), /stop 3.*invalid color/i)

  for (const position of [-1, 101, Number.NaN, Number.POSITIVE_INFINITY]) {
    const invalidPosition = { ...linear, stops: [{ color: '#000000', position }, linear.stops[1]] }
    assert.throws(() => Gradient.generateGradientCSS(invalidPosition), /position must be.*0 to 100/i)
  }
})

test('gradient stop count is bounded to 2–6 and cannot silently exceed the limit', () => {
  const sixStops = {
    ...linear,
    stops: Array.from({ length: 6 }, (_, index) => ({ color: '#123456', position: index * 20 }))
  }
  assert.match(Gradient.generateGradientCSS(sixStops), /linear-gradient/)
  assert.throws(() => Gradient.addStop(sixStops, '#abcdef', 100), /at most 6/i)
  assert.throws(() => Gradient.generateGradientCSS({ ...linear, stops: [linear.stops[0]] }), /at least 2/i)
})

test('add, update, and remove stop helpers enforce their limits and indices', () => {
  const added = Gradient.addStop(linear, 'red', 50)
  assert.equal(added.stops.length, 3)
  assert.equal(added.stops[2].position, 50)
  assert.throws(() => Gradient.addStop(linear, 'invalid-color', 50), /valid color/i)
  assert.throws(() => Gradient.addStop(linear, 'red', 101), /position must be.*0 to 100/i)
  assert.throws(() => Gradient.removeStop(linear, 0), /at least 2/i)
  assert.throws(() => Gradient.removeStop(added, 9), /existing color stop/i)
  assert.equal(Gradient.removeStop(added, 1).stops.length, 2)
  assert.throws(() => Gradient.updateStop(linear, 4, '#fff', 0), /existing color stop/i)
  assert.throws(() => Gradient.updateStop(linear, 0, '#fff', -1), /position must be.*0 to 100/i)

  const temporarilyInvalid = Gradient.updateStop(linear, 0, 'bad-color', 20)
  assert.equal(temporarilyInvalid.stops[0].color, 'bad-color')
  assert.throws(() => Gradient.generateGradientCSS(temporarilyInvalid), /invalid color/i)
})

test('radial CSS uses editable shape and position without an effective angle', () => {
  const radial = {
    type: 'radial',
    shape: 'ellipse',
    position: 'top right',
    angle: 250,
    stops: [
      { color: 'rgba(0, 0, 0, 0.5)', position: 0 },
      { color: 'hsl(120, 50%, 40%)', position: 100 }
    ]
  }
  assert.equal(
    Gradient.generateGradientCSS(radial),
    'background: radial-gradient(ellipse at top right, rgba(0, 0, 0, 0.5) 0%, hsl(120, 50%, 40%) 100%);'
  )
  assert.throws(() => Gradient.generateGradientCSS({ ...radial, shape: 'square' }), /circle or ellipse/i)
  assert.throws(() => Gradient.generateGradientCSS({ ...radial, position: '20% 30%' }), /supported radial gradient position/i)
})

test('color validation is bounded and random gradients remain within the shared limits', () => {
  for (const color of ['#abc', '#abcd', '#aabbcc', '#aabbccdd', 'rgb(1, 2, 3)', 'hsl(360, 100%, 0%)', 'coral']) {
    assert.equal(Gradient.isValidColor(color), true, `${color} should be accepted`)
  }
  for (const color of ['#12', 'rgb(999, 0, 0)', 'hsl(361, 50%, 50%)', 'not-a-color', 'rebeccapurple']) {
    assert.equal(Gradient.isValidColor(color), false, `${color} should be rejected`)
  }
  for (let index = 0; index < 20; index += 1) {
    const random = Gradient.generateRandomGradient()
    assert.ok(random.stops.length >= 2 && random.stops.length <= 6)
    assert.doesNotThrow(() => Gradient.generateGradientCSS(random))
  }
})

test('editor exposes named controls, radial options, inline feedback and no false swatch tip', () => {
  const componentPath = path.join(__dirname, '../../app/tools/gradient-generator/Tool.tsx')
  const source = fs.readFileSync(componentPath, 'utf8')
  assert.match(source, /aria-label={`Color for stop \$\{index \+ 1\}`}/)
  assert.match(source, /Radial shape/)
  assert.match(source, /Radial position/)
  assert.match(source, /selectedPreset, setSelectedPreset.*number \| null/)
  assert.match(source, /setSelectedPreset\(null\)/)
  assert.match(source, /disabled=\{gradient\.stops\.length >= 6/)
  assert.match(source, /role=\{feedback\?\.kind === 'error' \? 'alert' : 'status'\}/)
  assert.doesNotMatch(source, /\balert\s*\(/)
  assert.doesNotMatch(source, /Click on color swatches/)
  assert.doesNotMatch(source, /useState\(''\)\s*\n\s*const \[selectedPreset/)
})
