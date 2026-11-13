/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { tool } = require('../../app/tools/user-agent-parser/definition.ts')
const parser = require('../../app/tools/user-agent-parser/logic.ts')

const desktopChrome = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

test('user-agent-parser is implemented with an empty badge and a local JSON output contract', () => {
  assert.equal(tool.id, 'user-agent-parser')
  assert.equal(tool.href, '/user-agent-parser')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.badge, '')
  assert.equal(tool.outputExtension, 'json')
  assert.deepEqual(tool.defaultOptions, {})
  assert.match(parser.run(tool.exampleInput), /"browser"/)
})

test('identifies common desktop browser, Blink engine, Windows version, and device class', () => {
  const parsed = parser.parseUserAgent(`  ${desktopChrome}  `)
  assert.equal(parsed.userAgent, desktopChrome)
  assert.deepEqual(parsed.browser, { name: 'Chrome', version: '124.0.0.0', major: '124' })
  assert.deepEqual(parsed.engine, { name: 'Blink', version: '124.0.0.0' })
  assert.deepEqual(parsed.os, { name: 'Windows', version: '10' })
  assert.deepEqual(parsed.device, { type: 'desktop', vendor: null, model: null })
  assert.deepEqual(JSON.parse(parser.run(desktopChrome)), parsed)
})

test('recognizes iPhone Safari, Android Samsung, and desktop Firefox patterns', () => {
  const iphone = parser.parseUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1')
  assert.deepEqual(iphone.browser, { name: 'Safari', version: '17.2', major: '17' })
  assert.deepEqual(iphone.engine, { name: 'WebKit', version: '605.1.15' })
  assert.deepEqual(iphone.os, { name: 'iOS', version: '17.2' })
  assert.deepEqual(iphone.device, { type: 'mobile', vendor: 'Apple', model: 'iPhone' })

  const samsung = parser.parseUserAgent('Mozilla/5.0 (Linux; Android 13; SM-S918B Build/TP1A) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36')
  assert.equal(samsung.browser.name, 'Chrome')
  assert.equal(samsung.os.name, 'Android')
  assert.equal(samsung.device.type, 'mobile')
  assert.equal(samsung.device.vendor, 'Samsung')

  const firefox = parser.parseUserAgent('Mozilla/5.0 (X11; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0')
  assert.equal(firefox.browser.name, 'Firefox')
  assert.equal(firefox.engine.name, 'Gecko')
  assert.equal(firefox.os.name, 'Linux')

  const legacyEdge = parser.parseUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36 Edge/18.19041')
  assert.equal(legacyEdge.browser.name, 'Microsoft Edge')
  assert.equal(legacyEdge.engine.name, 'EdgeHTML')

  const internetExplorer = parser.parseUserAgent('Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)')
  assert.equal(internetExplorer.browser.name, 'Internet Explorer')
  assert.equal(internetExplorer.engine.name, 'Trident')
})

test('returns explicit unknowns for an unfamiliar but valid user-agent string', () => {
  const parsed = parser.parseUserAgent('ExampleClient/1.0')
  assert.deepEqual(parsed.browser, { name: null, version: null, major: null })
  assert.deepEqual(parsed.engine, { name: null, version: null })
  assert.deepEqual(parsed.os, { name: null, version: null })
  assert.deepEqual(parsed.device, { type: 'unknown', vendor: null, model: null })
})

test('rejects invalid types, blank input, control characters, and input over the limit', () => {
  for (const input of ['', ' \n ', null, undefined, 12, {}, []]) {
    assert.throws(() => parser.parseUserAgent(input), Error)
  }
  assert.throws(() => parser.parseUserAgent('Example\nClient'), /control characters/i)
  assert.throws(() => parser.parseUserAgent('x'.repeat(parser.MAX_USER_AGENT_LENGTH + 1)), /2048 characters/i)
  assert.equal(parser.parseUserAgent('x'.repeat(parser.MAX_USER_AGENT_LENGTH)).userAgent.length, parser.MAX_USER_AGENT_LENGTH)
})

test('rejects non-empty, non-plain, and malformed options', () => {
  assert.doesNotThrow(() => parser.run(desktopChrome, {}))
  assert.throws(() => parser.run(desktopChrome, { locale: 'en' }), /Unsupported option.*locale/i)
  assert.throws(() => parser.run(desktopChrome, null), /empty plain object/i)
  assert.throws(() => parser.run(desktopChrome, []), /empty plain object/i)
  assert.throws(() => parser.run(desktopChrome, 'x'), /empty plain object/i)
  assert.throws(() => parser.run(desktopChrome, Object.create({ inherited: true })), /empty plain object/i)
})

test('UI is connected to local parsing and communicates limits, uncertainty, and accessible feedback', () => {
  const source = fs.readFileSync(path.join(__dirname, '../../app/tools/user-agent-parser/Tool.tsx'), 'utf8')
  assert.match(source, /parseUserAgent\(userAgent\)/)
  assert.match(source, /maxLength=\{MAX_USER_AGENT_LENGTH\}/)
  assert.match(source, /aria-invalid=/)
  assert.match(source, /aria-live=/)
  assert.match(source, /role=\{error \? 'alert' : 'status'\}/)
  assert.match(source, /spoofable/i)
  assert.match(source, /unknown/i)
  assert.match(source, /No network requests are made/i)
  assert.match(source, /ToolPanel/)
  assert.doesNotMatch(source, /fetch\s*\(|\balert\s*\(/)
})
