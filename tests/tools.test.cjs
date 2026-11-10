/* eslint-disable @typescript-eslint/no-require-imports */
require('./register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { allTools, categories, getToolCatalogIssues, quickTools } = require('../app/tools/registry.ts')
const { genericToolSlugs, runTool } = require('../app/lib/tools/toolEngine.ts')

const root = path.resolve(__dirname, '..')

test('catalog slugs are unique, categorized and represented by one canonical definition', () => {
  assert.equal(allTools.length, 86)
  assert.deepEqual(getToolCatalogIssues(), [])
  assert.equal(new Set(allTools.map(tool => tool.id)).size, allTools.length)
  assert.equal(new Set(allTools.map(tool => tool.href)).size, allTools.length)
  assert.equal(allTools.filter(tool => tool.status === 'implemented').length, 43)
  assert.equal(allTools.filter(tool => tool.status === 'planned').length, 43)
  assert.ok(categories.length > 0)
  assert.ok(quickTools.every(tool => allTools.includes(tool)))
})

test('every catalog entry has the same folder, view, logic, README and focused test contract', () => {
  for (const tool of allTools) {
    const folder = path.join(root, 'app/tools', tool.id)
    for (const file of ['definition.ts', 'logic.ts', 'Tool.tsx', 'README.md']) {
      assert.ok(fs.existsSync(path.join(folder, file)), `${tool.id} is missing ${file}`)
    }
    assert.ok(fs.existsSync(path.join(root, 'tests/tools', `${tool.id}.test.cjs`)), `${tool.id} is missing its test file`)
    assert.equal(tool.id, path.basename(folder))
    assert.equal(tool.href, `/${tool.id}`)
  }
})

test('generic executor registry contains exactly the implemented generic tools', () => {
  assert.equal(new Set(genericToolSlugs).size, genericToolSlugs.length)
  assert.equal(genericToolSlugs.length, 30)
  for (const slug of genericToolSlugs) {
    assert.equal(allTools.find(tool => tool.id === slug)?.status, 'implemented', `${slug} must be marked implemented`)
  }
})

test('generic dispatcher delegates to per-tool modules and rejects unknown slugs', async () => {
  const outputs = await Promise.all([
    runTool('csv-to-json', 'name\nAda'),
    runTool('php-json-converter', '["x" => 1]', { format: 'array' }),
    runTool('toml-json-converter', 'x = 1'),
    runTool('json-schema-generator', '{"x":1}'),
    runTool('base64-encoder', 'ok'),
    runTool('ascii-converter', 'A', { mode: 'text-to-codes', base: 'decimal' }),
    runTool('mime-type-validator', 'application/json', { mode: 'validate', target: 'mime' }),
    runTool('uuid-generator', '', { version: '4', count: '1' }),
    runTool('password-generator', '', { length: '20', count: '1', uppercase: 'true', lowercase: 'true', numbers: 'true', symbols: 'true', excludeAmbiguous: 'false' }),
    runTool('qr-generator', 'https://example.com', { errorCorrection: 'M', margin: '4', scale: '4' }),
    runTool('robots-txt-generator', '/admin/', { userAgent: '*', allow: '/', crawlDelay: '', sitemap: '' }),
    runTool('sitemap-generator', 'https://example.com/', { changeFrequency: 'weekly', priority: '0.5', lastModified: '' }),
    runTool('random-number-generator', '', { min: '1', max: '10', count: '2', unique: 'false' }),
    runTool('cron-generator', '', { minute: '0', hour: '9', dayOfMonth: '*', month: '*', dayOfWeek: '1-5' }),
    runTool('barcode-generator', 'DEMO-123', { format: 'code128', scale: '3', height: '12', includeText: 'true' }),
  ])
  assert.deepEqual(JSON.parse(outputs[0]), [{ name: 'Ada' }])
  assert.deepEqual(JSON.parse(outputs[1]), { x: 1 })
  assert.deepEqual(JSON.parse(outputs[2]), { x: 1 })
  assert.equal(JSON.parse(outputs[3]).type, 'object')
  assert.equal(outputs[4], 'b2s=')
  assert.equal(outputs[5], '65')
  assert.match(outputs[6], /valid/i)
  assert.match(outputs[7], /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  assert.equal(outputs[8].length, 20)
  assert.match(outputs[9], /^<svg[\s>]/)
  assert.match(outputs[10], /^User-agent: \*\nAllow: \/\nDisallow: \/admin\//)
  assert.match(outputs[11], /^<\?xml version="1\.0"/)
  assert.equal(outputs[12].split('\n').length, 2)
  assert.match(outputs[13], /Cron expression: 0 9 \* \* 1-5/)
  assert.match(outputs[14], /^<svg viewBox=/)
  await assert.rejects(runTool('not-a-tool', ''), /no generic text processor/i)
})

test('component registry has one statically analyzable UI import for every catalog slug', () => {
  const source = fs.readFileSync(path.join(root, 'app/tools/componentRegistry.ts'), 'utf8')
  const registered = [...source.matchAll(/^\s*'([^']+)': dynamic\(\(\) => import\('\.\/([^/]+)\/Tool'\)\),$/gm)]
  assert.equal(registered.length, allTools.length)
  assert.deepEqual(registered.map(([, slug, folder]) => [slug, folder]), allTools.map(tool => [tool.id, tool.id]).sort(([a], [b]) => a.localeCompare(b)))
})
