/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/sitemap-generator/definition.ts')
const implementation = require('../../app/tools/sitemap-generator/logic.ts')

test('sitemap-generator follows the per-tool contract and is implemented', () => {
  assert.equal(tool.id, 'sitemap-generator')
  assert.equal(tool.href, '/sitemap-generator')
  assert.equal(tool.status, 'implemented')
  assert.equal(typeof implementation.run, 'function')
  assert.match(require('node:fs').readFileSync('app/tools/sitemap-generator/Tool.tsx', 'utf8'), /UniversalTool/)
})

test('creates an XML sitemap with escaped locations, optional metadata, and duplicate removal', () => {
  const output = implementation.run('https://example.com/a?x=1&y=2\nhttps://example.com/about\nhttps://example.com/about', {
    changeFrequency: 'weekly', priority: '0.5', lastModified: '2026-11-10',
  })
  assert.match(output, /^<\?xml version="1\.0" encoding="UTF-8"\?>/)
  assert.match(output, /<loc>https:\/\/example\.com\/a\?x=1&amp;y=2<\/loc>/)
  assert.match(output, /<lastmod>2026-11-10<\/lastmod>/)
  assert.match(output, /<changefreq>weekly<\/changefreq>/)
  assert.match(output, /<priority>0\.5<\/priority>/)
  assert.equal((output.match(/<url>/g) ?? []).length, 2)
  assert.match(output, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/)
})

test('omits optional tags when their option values are empty', () => {
  const output = implementation.run('https://example.com/', { changeFrequency: '', priority: '', lastModified: '' })
  assert.doesNotMatch(output, /<lastmod>|<changefreq>|<priority>/)
})

test('rejects invalid protocols, credentials, fragments, option values, and dates', () => {
  for (const url of ['ftp://example.com/', 'https://user:pass@example.com/', 'https://example.com/#part', 'not a URL']) {
    assert.throws(() => implementation.run(url, {}), /Invalid absolute URL|HTTP\(S\)/)
  }
  assert.throws(() => implementation.run('https://example.com', { changeFrequency: 'sometimes' }), /changeFrequency/)
  assert.throws(() => implementation.run('https://example.com', { priority: '1.1' }), /priority/)
  assert.throws(() => implementation.run('https://example.com', { lastModified: '2026-02-30' }), /YYYY-MM-DD/)
  assert.throws(() => implementation.run('https://example.com', { extra: 'x' }), /Unknown option/)
})

test('rejects empty input and excessive URL counts', () => {
  assert.throws(() => implementation.run('  \n ', {}), /at least one/)
  assert.throws(() => implementation.run(Array(50_001).fill('https://example.com').join('\n'), {}), /at most 50,000/)
})
