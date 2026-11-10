/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/robots-txt-generator/definition.ts')
const implementation = require('../../app/tools/robots-txt-generator/logic.ts')

test('robots-txt-generator follows the per-tool contract and is implemented', () => {
  assert.equal(tool.id, 'robots-txt-generator')
  assert.equal(tool.href, '/robots-txt-generator')
  assert.equal(tool.status, 'implemented')
  assert.equal(typeof implementation.run, 'function')
  assert.match(require('node:fs').readFileSync('app/tools/robots-txt-generator/Tool.tsx', 'utf8'), /UniversalTool/)
})

test('generates ordered rules, de-duplicates paths and validates sitemap URLs', () => {
  const output = implementation.run('/admin/\n/private/\n/admin/', {
    userAgent: 'Googlebot', allow: '/\n/public/', crawlDelay: '10', sitemap: 'https://example.com/sitemap.xml',
  })
  assert.equal(output, 'User-agent: Googlebot\nAllow: /\nAllow: /public/\nDisallow: /admin/\nDisallow: /private/\nCrawl-delay: 10\nSitemap: https://example.com/sitemap.xml\n')
})

test('generates a minimal default policy and allows a blank disallow list', () => {
  assert.equal(implementation.run('', {}), 'User-agent: *\n')
})

test('rejects malformed paths, unsupported agents, bad delays, and unknown options', () => {
  assert.throws(() => implementation.run('admin', {}), /paths beginning with/)
  assert.throws(() => implementation.run('/private path', {}), /no spaces/)
  assert.throws(() => implementation.run('', { userAgent: 'bad bot' }), /userAgent/)
  assert.throws(() => implementation.run('', { crawlDelay: '86401' }), /crawlDelay/)
  assert.throws(() => implementation.run('', { extra: 'no' }), /Unknown option/)
  assert.throws(() => implementation.run('', { sitemap: 'javascript:alert(1)' }), /HTTP\(S\) URLs/)
})

test('bounds input size and directive count', () => {
  assert.throws(() => implementation.run('x'.repeat(100_001), {}), /100,000/)
  assert.throws(() => implementation.run(Array(1_002).fill('/x').join('\n'), {}), /at most 1000/)
})
