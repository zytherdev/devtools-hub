/* eslint-disable @typescript-eslint/no-require-imports */
require('./register-ts.cjs')
const assert = require('node:assert/strict')
const { parse: parseYaml } = require('yaml')
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
  assert.equal(allTools.filter(tool => tool.status === 'implemented').length, 86)
  assert.equal(allTools.filter(tool => tool.status === 'planned').length, 0)
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
  assert.equal(genericToolSlugs.length, 73)
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
    runTool('openapi-generator', JSON.stringify({ title: 'API', version: '1.0.0', servers: ['https://example.com'], endpoints: [{ path: '/health', method: 'get', summary: 'Health', responseDescription: 'Success', responseSchema: { type: 'object', properties: { ok: { type: 'boolean' } } } }] })),
    runTool('mock-api-generator', '{"name":"Ada"}', { count: '2', wrapper: 'data', idField: 'id' }),
    runTool('text-case-converter', 'Hello world', { mode: 'snake' }),
    runTool('word-counter', 'One two'),
    runTool('diff-checker', 'old\n---8<---\nnew'),
    runTool('json-diff', '{"before":{"x":1},"after":{"x":2}}'),
    runTool('lorem-ipsum', '', { paragraphs: '1', sentencesPerParagraph: '1', wordsPerSentence: '5', format: 'paragraphs' }),
    runTool('remove-duplicate-lines', 'a\na', { caseSensitive: 'true', trimWhitespace: 'false', keepEmpty: 'false' }),
    runTool('slug-generator', 'Hello World', { separator: '-', maxLength: '80', lowercase: 'true' }),
    runTool('line-sorter', '10\n2', { order: 'numeric-asc', unique: 'false', trimWhitespace: 'false', ignoreEmpty: 'false' }),
    runTool('unit-converter', '0', { from: 'C', to: 'F', precision: '2' }),
    runTool('timestamp-converter', '1970-01-01T00:00:00Z', { mode: 'iso-to-epoch' }),
    runTool('number-base-converter', '255', { fromBase: '10', toBase: '16' }),
    runTool('file-size-converter', '1536', { from: 'B', to: 'KiB', precision: '3' }),
    runTool('roman-numeral', '2024', { mode: 'arabic-to-roman' }),
    runTool('currency-converter', '100', { from: 'USD', to: 'EUR', rate: '0.92', precision: '2' }),
    runTool('sql-formatter', 'select id,name from users'),
    runTool('docker-compose-converter', 'docker run --name app -p 8080:80 nginx:alpine'),
    runTool('kubernetes-decoder', 'apiVersion: v1\nkind: Secret\nmetadata:\n  name: demo\ndata:\n  token: YWRtaW4=\n'),
    runTool('chmod-calculator', '755'),
    runTool('password-strength', 'Longer stable phrase!'),
    runTool('email-validator', 'alex.lee+updates@example.co.uk'),
    runTool('hash-generator', 'abc', { algorithm: 'SHA-256' }),
    runTool('hash-verifier', 'abc', { algorithm: 'SHA-256', expectedDigest: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad' }),
    runTool('hmac-generator', 'message', { secretKey: 'secret', algorithm: 'SHA-256', encoding: 'hex' }),
    runTool('cron-validator', '0 9 * * 1-5'),
    runTool('eta-calculator', JSON.stringify({ progress: 40, elapsedMinutes: 120, asOf: '2026-01-01T12:00:00Z' })),
    runTool('date-difference', JSON.stringify({ start: '2024-01-31', end: '2024-03-01' })),
    runTool('timezone-converter', JSON.stringify({ instant: '2024-06-15T12:00:00Z', fromTimeZone: 'UTC', toTimeZone: 'America/New_York' })),
    runTool('text-statistics', 'one two\nthree', { includeReadingTime: 'true', wordsPerMinute: '60' }),
    runTool('subnet-calculator', '192.168.1.10/24'),
    runTool('user-agent-parser', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'),
    runTool('http-status-codes', '404'),
    runTool('emoji-picker', 'coffee'),
    runTool('benchmark-tool', 'map-lookup', { iterations: '20', samples: '2' }),
    runTool('rsa-key-generator', '', { modulusLength: '2048', algorithm: 'RSA-OAEP', format: 'pem' }),
    runTool('bcrypt-generator', 'Integration test password', { action: 'hash', cost: '4' }),
    runTool('aes-encryptor', 'dispatcher test', { mode: 'encrypt', password: 'a sufficiently long test passphrase' }),
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
  assert.equal(JSON.parse(outputs[15]).openapi, '3.1.0')
  assert.equal(JSON.parse(outputs[16]).data.length, 2)
  assert.equal(outputs[17], 'hello_world')
  assert.equal(JSON.parse(outputs[18]).words, 2)
  assert.match(outputs[19], /-old\n\+new/)
  assert.equal(JSON.parse(outputs[20]).changed[0].path, '/x')
  assert.equal((outputs[21].match(/\./g) ?? []).length, 1)
  assert.equal(outputs[22], 'a')
  assert.equal(outputs[23], 'hello-world')
  assert.equal(outputs[24], '2\n10')
  assert.equal(JSON.parse(outputs[25]).result, 32)
  assert.equal(JSON.parse(outputs[26]).unixMilliseconds, 0)
  assert.equal(outputs[27], 'ff')
  assert.equal(JSON.parse(outputs[28]).result, 1.5)
  assert.equal(outputs[29], 'MMXXIV')
  assert.equal(JSON.parse(outputs[30]).result, 92)
  assert.match(outputs[31], /^SELECT id,\n  name\nFROM users/)
  assert.equal(parseYaml(outputs[32]).services.converted.image, 'nginx:alpine')
  assert.equal(parseYaml(outputs[33]).stringData.token, 'admin')
  assert.equal(JSON.parse(outputs[34]).symbolic, 'rwxr-xr-x')
  assert.equal(JSON.parse(outputs[35]).characterCount, 'Longer stable phrase!'.length)
  assert.equal(JSON.parse(outputs[36]).valid, true)
  assert.equal(outputs[37], 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  assert.match(outputs[38], /^MATCH\nAlgorithm: SHA-256/)
  assert.match(outputs[39], /^[0-9a-f]{64}$/)
  assert.match(outputs[40], /Valid five-field cron expression/)
  assert.equal(JSON.parse(outputs[41]).estimatedCompletion, '2026-01-01T15:00:00.000Z')
  assert.deepEqual(JSON.parse(outputs[42]).calendarDifference, { years: 0, months: 1, days: 1, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })
  assert.equal(JSON.parse(outputs[43]).target.utcOffset, 'UTC-04:00')
  assert.match(outputs[44], /^Words: 3$/m)
  assert.match(outputs[44], /^Lines: 2$/m)
  assert.equal(JSON.parse(outputs[45]).networkAddress, '192.168.1.0')
  assert.equal(JSON.parse(outputs[46]).browser.name, 'Chrome')
  assert.equal(JSON.parse(outputs[47]).results[0].title, 'Not Found')
  assert.equal(JSON.parse(outputs[48])[0].emoji, '☕')
  assert.equal(JSON.parse(outputs[49]).sampleCount, 2)
  const rsa = JSON.parse(outputs[50])
  assert.equal(rsa.algorithm, 'RSA-OAEP')
  assert.equal(rsa.modulusLength, 2048)
  assert.match(rsa.publicKey, /BEGIN PUBLIC KEY/)
  assert.match(rsa.privateKey, /BEGIN PRIVATE KEY/)
  assert.match(outputs[51], /^\$2[ab]\$04\$/)
  const aes = JSON.parse(outputs[52])
  assert.equal(aes.algorithm, 'AES-256-GCM')
  assert.equal(aes.kdf, 'PBKDF2')
  assert.ok(aes.ciphertext)
  await assert.rejects(runTool('certificate-decoder', 'not a certificate'), /PEM CERTIFICATE block/i)
  await assert.rejects(runTool('ssl-checker', 'not a certificate'), /PEM CERTIFICATE block/i)
  await assert.rejects(runTool('not-a-tool', ''), /no generic text processor/i)
})

test('final tool handlers are wired without making implicit public lookup requests', async () => {
  const phrase = await runTool('bip39-generator', '', { strength: '128' })
  assert.equal(phrase.trim().split(/\s+/).length, 12)
  await assert.rejects(runTool('ip-lookup', '127.0.0.1'), /private, reserved, or special-use/)
  await assert.rejects(runTool('mac-lookup', 'not-a-mac'), /Enter a valid 24-bit OUI or 48-bit MAC/)
})

test('component registry has one statically analyzable UI import for every catalog slug', () => {
  const source = fs.readFileSync(path.join(root, 'app/tools/componentRegistry.ts'), 'utf8')
  const registered = [...source.matchAll(/^\s*'([^']+)': dynamic\(\(\) => import\('\.\/([^/]+)\/Tool'\)\),$/gm)]
  assert.equal(registered.length, allTools.length)
  assert.deepEqual(registered.map(([, slug, folder]) => [slug, folder]), allTools.map(tool => [tool.id, tool.id]).sort(([a], [b]) => a.localeCompare(b)))
})
