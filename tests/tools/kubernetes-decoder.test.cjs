/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { parse } = require('yaml')
const { tool } = require('../../app/tools/kubernetes-decoder/definition.ts')
const { run } = require('../../app/tools/kubernetes-decoder/logic.ts')

const MAX_INPUT_CHARS = 500_000
const MAX_KEYS = 10_000

function secretYaml(data = '  username: YWRtaW4=\n') {
  return `apiVersion: v1\nkind: Secret\nmetadata:\n  name: app-secret\n  namespace: staging\n${data ? `data:\n${data}` : ''}`
}

test('kubernetes-decoder is implemented, has an empty badge, and uses the UniversalTool UI', () => {
  assert.equal(tool.id, 'kubernetes-decoder')
  assert.equal(tool.href, '/kubernetes-decoder')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.badge, '')
  assert.equal(tool.outputExtension, 'yaml')
  assert.equal(typeof run, 'function')

  const uiPath = path.join(__dirname, '../../app/tools/kubernetes-decoder/Tool.tsx')
  const ui = fs.readFileSync(uiPath, 'utf8')
  assert.match(ui, /UniversalTool/)
  assert.match(ui, /tool=\{tool\}\s+slug=\{tool\.id\}/)
  assert.match(ui, /output contains secrets in clear text/i)
  assert.match(ui, /processing occurs locally/i)

  const readme = fs.readFileSync(path.join(__dirname, '../../app/tools/kubernetes-decoder/README.md'), 'utf8')
  assert.match(readme, /output contains secrets in plain text/i)
  assert.match(readme, /locally in your browser/i)
})

test('decodes a Secret into stringData, preserves metadata, and gives original stringData precedence', () => {
  const input = `apiVersion: v1
kind: Secret
metadata:
  name: app-secret
  namespace: staging
  labels:
    team: platform
type: Opaque
data:
  username: YWRtaW4=
  shared: ZGF0YS12YWx1ZQ==
stringData:
  shared: original-plaintext
  direct: plain English text
`
  const output = parse(run(input))
  assert.equal(output.apiVersion, 'v1')
  assert.deepEqual(output.metadata, { name: 'app-secret', namespace: 'staging', labels: { team: 'platform' } })
  assert.equal(output.type, 'Opaque')
  assert.equal(Object.hasOwn(output, 'data'), false)
  assert.deepEqual(output.stringData, {
    username: 'admin',
    shared: 'original-plaintext',
    direct: 'plain English text',
  })
  assert.equal(parse(run(run(input))).stringData.username, 'admin')
})

test('rejects invalid YAML, multiple documents, missing metadata, and malformed data fields', () => {
  assert.throws(() => run('kind: [Secret'), /invalid YAML/i)
  assert.throws(() => run(`${secretYaml()}---\n${secretYaml()}`), /exactly one.*document/i)
  assert.throws(() => run('kind: Secret\ndata: {}\n'), /required metadata/i)
  assert.throws(() => run('kind: Secret\nmetadata: {}\ndata: []\n'), /data must be a YAML map/i)
  assert.throws(() => run('kind: Secret\nmetadata: {}\nstringData:\n  token: 42\n'), /must be a string/i)
})

test('rejects malformed and non-canonical base64 values', () => {
  for (const value of ['abc', 'YQ=', 'YQ==junk', 'Y Q==']) {
    assert.throws(() => run(`kind: Secret\nmetadata: {}\ndata:\n  token: '${value}'\n`), /base64/i)
  }
})

test('rejects base64 bytes that are not valid UTF-8', () => {
  assert.throws(() => run('kind: Secret\nmetadata: {}\ndata:\n  token: /w==\n'), /utf-8/i)
  assert.throws(() => run('kind: Secret\nmetadata: {}\ndata:\n  token: 4oI=\n'), /utf-8/i)
})

test('rejects Kubernetes objects whose kind is not Secret', () => {
  assert.throws(() => run('apiVersion: v1\nkind: ConfigMap\nmetadata: {}\ndata: {}\n'), /kind: Secret/i)
  assert.throws(() => run('apiVersion: v1\nkind: secret\nmetadata: {}\n'), /kind: Secret/i)
})

test('enforces the 500,000-character input limit and accepts its boundary', () => {
  const tooLong = `${secretYaml()}#${'x'.repeat(MAX_INPUT_CHARS)}`
  assert.throws(() => run(tooLong), /500,000-character limit/i)

  const prefix = secretYaml()
  const exactLimit = `${prefix}#${'x'.repeat(MAX_INPUT_CHARS - prefix.length - 1)}`
  assert.equal(exactLimit.length, MAX_INPUT_CHARS)
  assert.match(run(exactLimit), /stringData:/)
})

test('enforces the maximum number of Secret keys and accepts the boundary', () => {
  const makeInput = count => `kind: Secret\nmetadata: {}\ndata:\n${Array.from({ length: count }, (_, index) => `  k${index}: ''\n`).join('')}`
  assert.match(run(makeInput(MAX_KEYS)), /stringData:/)
  assert.throws(() => run(makeInput(MAX_KEYS + 1)), /limit of 10,000 keys/i)
})

test('validates Kubernetes Secret key syntax and length', () => {
  assert.throws(() => run("kind: Secret\nmetadata: {}\ndata:\n  'bad/key': ''\n"), /Secret key.*invalid/i)
  assert.throws(() => run(`kind: Secret\nmetadata: {}\ndata:\n  '${'a'.repeat(254)}': ''\n`), /up to 253 ASCII/i)
})
