/* eslint-disable @typescript-eslint/no-require-imports -- Node's CJS test loader is used to register the TypeScript require hook. */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const test = require('node:test')
const ts = require('typescript')

require.extensions['.ts'] = (module, fileName) => {
  const source = fs.readFileSync(fileName, 'utf8')
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName,
  }).outputText
  module._compile(output, fileName)
}

const { csvToJson } = require('../app/lib/tools/csvToJson.ts')
const { convertPhpJson } = require('../app/lib/tools/phpJsonConverter.ts')
const { convertTomlJson } = require('../app/lib/tools/tomlJsonConverter.ts')
const { generateJsonSchema } = require('../app/lib/tools/jsonSchemaGenerator.ts')
const { transformBase64 } = require('../app/lib/tools/base64.ts')
const { genericToolSlugs, runTool } = require('../app/lib/tools/toolEngine.ts')
const { allTools, categories, getToolCatalogIssues, quickTools } = require('../app/lib/utils/tools.ts')

test('catalog slugs are unique, routed, categorized, and quick links are derived', () => {
  assert.deepEqual(getToolCatalogIssues(), [])
  assert.equal(new Set(allTools.map(tool => tool.href)).size, allTools.length)
  assert.ok(categories.length > 0)
  assert.ok(quickTools.every(tool => allTools.includes(tool)))
})

test('generic executor registry contains unique catalog slugs', () => {
  assert.equal(new Set(genericToolSlugs).size, genericToolSlugs.length)
  assert.ok(genericToolSlugs.every(slug => allTools.some(tool => tool.id === slug)))
  for (const slug of ['csv-to-json', 'toml-json-converter', 'php-json-converter', 'json-schema-generator', 'base64-encoder']) {
    assert.ok(genericToolSlugs.includes(slug), `${slug} must be registered in the shared executor`)
  }
})

test('CSV to JSON handles quoted commas and opt-in type inference', () => {
  const result = JSON.parse(csvToJson(
    'name,score,active\n"Ada, Lovelace",42,true\nGrace,36,false',
    { headers: 'true', infer: 'true', structure: 'objects', indent: '0' },
  ))
  assert.deepEqual(result, [
    { name: 'Ada, Lovelace', score: 42, active: true },
    { name: 'Grace', score: 36, active: false },
  ])
})

test('CSV to JSON rejects malformed quoted fields with row context', () => {
  assert.throws(() => csvToJson('name\n"unfinished', {}), /Unterminated quoted field.*row 2/)
})

test('PHP array conversion parses data without executing PHP', () => {
  const output = convertPhpJson('array("name" => "Ada", "roles" => array("editor", "admin"))', { format: 'array' })
  assert.deepEqual(JSON.parse(output), { name: 'Ada', roles: ['editor', 'admin'] })
  assert.throws(() => convertPhpJson('<?php system("id");', {}), /Unsupported|Invalid|expected/i)
})

test('TOML/JSON conversion supports both directions', () => {
  const json = convertTomlJson('[server]\nhost = "localhost"\nport = 8080\n', { direction: 'toml-to-json', indent: '2' })
  assert.deepEqual(JSON.parse(json), { server: { host: 'localhost', port: 8080 } })
  const toml = convertTomlJson('{"server":{"host":"localhost","port":8080}}', { direction: 'json-to-toml' })
  assert.match(toml, /host\s*=\s*"localhost"/)
  assert.throws(() => convertTomlJson('[]', { direction: 'json-to-toml' }), /root object/i)
})

test('JSON Schema inference creates nested properties and validates its options', () => {
  const schema = JSON.parse(generateJsonSchema('{"name":"Ada","active":true}', { title: 'Person', required: 'observed' }))
  assert.equal(schema.title, 'Person')
  assert.equal(schema.type, 'object')
  assert.deepEqual(schema.required, ['active', 'name'])
  assert.equal(schema.properties.name.type, 'string')
  assert.equal(schema.properties.active.type, 'boolean')
  assert.throws(() => generateJsonSchema('{"x":1}', { mode: 'validate' }), /not implemented/i)
})

test('Base64 round-trips Unicode and rejects malformed UTF-8 on decode', () => {
  const text = 'DevTools Hub — café 🌱'
  const encoded = transformBase64(text, { operation: 'encode' })
  assert.equal(transformBase64(encoded, { operation: 'decode' }), text)
  assert.throws(() => transformBase64('////', { operation: 'decode' }), /UTF-8|encoded data/i)
})

test('the universal dispatcher exposes all five new tools', async () => {
  const outputs = await Promise.all([
    runTool('csv-to-json', 'name\nAda'),
    runTool('php-json-converter', '["x" => 1]', { format: 'array' }),
    runTool('toml-json-converter', 'x = 1'),
    runTool('json-schema-generator', '{"x":1}'),
    runTool('base64-encoder', 'ok'),
  ])
  assert.deepEqual(JSON.parse(outputs[0]), [{ name: 'Ada' }])
  assert.deepEqual(JSON.parse(outputs[1]), { x: 1 })
  assert.deepEqual(JSON.parse(outputs[2]), { x: 1 })
  assert.equal(JSON.parse(outputs[3]).type, 'object')
  assert.equal(outputs[4], 'b2s=')
})
