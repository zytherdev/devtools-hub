/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { tool } = require('../../app/tools/emoji-picker/definition.ts')
const implementation = require('../../app/tools/emoji-picker/logic.ts')

const uiPath = path.join(__dirname, '../../app/tools/emoji-picker/Tool.tsx')
const uiSource = fs.readFileSync(uiPath, 'utf8')

test('emoji-picker is marked implemented without a planned badge', () => {
  assert.equal(tool.id, 'emoji-picker')
  assert.equal(tool.href, '/emoji-picker')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.badge, '')
  assert.equal(tool.exampleInput, 'smile')
  assert.equal(typeof implementation.run, 'function')
})

test('curated catalog provides searchable emoji in each advertised category', () => {
  const expectedCategories = implementation.EMOJI_CATEGORIES.map(({ id }) => id).filter(id => id !== 'all')
  const foundCategories = new Set(implementation.EMOJI_CATALOG.map(({ category }) => category))
  assert.equal(implementation.EMOJI_CATALOG.length <= implementation.MAX_RESULTS, true)
  assert.ok(implementation.EMOJI_CATALOG.length >= 80)
  for (const category of expectedCategories) assert.ok(foundCategories.has(category), `missing ${category}`)
  assert.ok(implementation.filterEmojis('coffee').some(entry => entry.emoji === '☕'))
  assert.ok(implementation.filterEmojis('HAPPY', 'smileys').some(entry => entry.emoji === '😀'))
  assert.ok(implementation.filterEmojis('🇯🇵', 'flags').some(entry => entry.name.includes('Japan')))
  assert.equal(implementation.filterEmojis('coffee', 'animals').length, 0)
})

test('runner returns bounded JSON results and honors category and limit options', () => {
  const result = JSON.parse(implementation.run('heart', { category: 'symbols', limit: '2' }))
  assert.equal(result.length, 2)
  assert.ok(result.every(entry => entry.category === 'symbols'))
  assert.equal(JSON.parse(implementation.run('', { limit: '1' })).length, 1)
  assert.equal(JSON.parse(implementation.run('there-is-no-matching-emoji')).length, 0)
  assert.deepEqual(JSON.parse(implementation.run('')), implementation.EMOJI_CATALOG)
})

test('query and runner option validation reject invalid, excessive, and unsupported values', () => {
  assert.throws(() => implementation.filterEmojis(null), /Search query must be text/)
  assert.throws(() => implementation.filterEmojis('x'.repeat(implementation.MAX_QUERY_LENGTH + 1)), /80 characters or fewer/)
  assert.throws(() => implementation.filterEmojis('', 'unknown'), /available emoji categories/)
  assert.throws(() => implementation.filterEmojis('', 'all', 0), /integer from 1 to 100/)
  assert.throws(() => implementation.filterEmojis('', 'all', 1.5), /integer from 1 to 100/)
  assert.throws(() => implementation.run('', { limit: '0' }), /whole number from 1 to 100/)
  assert.throws(() => implementation.run('', { limit: '101' }), /whole number from 1 to 100/)
  assert.throws(() => implementation.run('', { limit: '1.5' }), /whole number from 1 to 100/)
  assert.throws(() => implementation.run('', { surprise: 'yes' }), /Unsupported option/)
  assert.throws(() => implementation.run('', null), /plain object/)
  assert.throws(() => implementation.run('', { category: 'unknown' }), /available emoji categories/)
})

test('query and result boundaries are inclusive and capped', () => {
  assert.doesNotThrow(() => implementation.filterEmojis('x'.repeat(implementation.MAX_QUERY_LENGTH)))
  assert.equal(implementation.filterEmojis('', 'all', implementation.MAX_RESULTS).length, implementation.EMOJI_CATALOG.length)
  assert.equal(implementation.filterEmojis('', 'all', 1).length, 1)
  assert.equal(implementation.EMOJI_CATALOG.length, implementation.filterEmojis('').length)
})

test('picker UI exposes labeled search, selected category controls, result names, and clipboard feedback', () => {
  assert.match(uiSource, /ToolPanel/)
  assert.match(uiSource, /htmlFor="emoji-picker-search"/)
  assert.match(uiSource, /aria-label="Filter emojis by category"/)
  assert.match(uiSource, /aria-pressed=\{category === id\}/)
  assert.match(uiSource, /aria-label=\{`Copy \$\{name\} \(\$\{emoji\}\)`\}/)
  assert.match(uiSource, /navigator\.clipboard\?\.writeText/)
  assert.match(uiSource, /role=\{feedback\?\.kind === 'error' \? 'alert' : 'status'\}/)
  assert.doesNotMatch(uiSource, /PlannedTool|fetch\s*\(/)
})
