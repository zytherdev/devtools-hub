/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const test = require('node:test')
const { tool } = require('../../app/tools/curl-to-code/definition.ts')
const { generateCode, parseCurl, run } = require('../../app/tools/curl-to-code/logic.ts')

const command = 'curl -X POST https://api.example.com/items -H "Content-Type: application/json" -d \'{"name":"Ada"}\''

test('curl-to-code follows the per-tool contract', () => {
  assert.equal(tool.id, 'curl-to-code')
  assert.equal(tool.href, '/curl-to-code')
  assert.equal(tool.status, 'implemented')
  assert.equal(typeof parseCurl, 'function')
  assert.equal(typeof generateCode, 'function')
  assert.equal(typeof run, 'function')
})

test('parses a representative request, quoting and headers', () => {
  const parsed = parseCurl(command)
  assert.ok(parsed)
  assert.equal(parsed.method, 'POST')
  assert.equal(parsed.url, 'https://api.example.com/items')
  assert.equal(parsed.headers['Content-Type'], 'application/json')
  assert.equal(parsed.data, '{"name":"Ada"}')
  assert.equal(parseCurl('curl --url=https://api.example.com/a -A "Agent Test"')?.headers['User-Agent'], 'Agent Test')
})

test('preserves an explicitly requested method even when a body is present', () => {
  const parsed = parseCurl('curl -X GET https://api.example.com/items -d q=1')
  assert.equal(parsed?.method, 'GET')
  assert.equal(parsed?.data, 'q=1')
  assert.equal(parseCurl('curl https://api.example.com/items -d q=1')?.method, 'POST')
  assert.equal(parseCurl('curl -d q=1 -X DELETE https://api.example.com/items')?.method, 'DELETE')
  assert.equal(parseCurl('curl -I https://api.example.com/items -d q=1')?.method, 'HEAD')
})

test('rejects missing values and option-shaped values for argument flags', () => {
  for (const flag of ['--url', '-A', '--user-agent', '-X', '--request', '-H', '--header', '-d', '--data', '--data-raw', '--data-binary', '-F', '--form', '-u', '--user', '--bearer']) {
    assert.equal(parseCurl(`curl https://api.example.com ${flag}`), null, `${flag} without a value`)
    assert.equal(parseCurl(`curl ${flag} --url https://api.example.com`), null, `${flag} must not consume another option`)
  }
  assert.equal(parseCurl('curl --url= https://api.example.com'), null)
  assert.equal(parseCurl('curl -X POST'), null)
})

test('rejects redirect, fail, timeout, retry and compression options that are not faithfully emitted', () => {
  const unsupported = [
    '-L', '--location', '--location-trusted', '-f', '--fail', '--fail-early', '--fail-with-body',
    '-m 5', '--max-time=5', '--connect-timeout 2', '--connect-timeout-ms=2000',
    '--retry 3', '--retry-delay=1', '--retry-max-time 10', '--retry-all-errors', '--retry-connrefused',
    '--max-redirs 4', '--post301', '--post302', '--post303', '--speed-limit 100', '--speed-time 10', '--compressed',
  ]
  for (const option of unsupported) {
    assert.equal(parseCurl(`curl ${option} https://api.example.com`), null, option)
  }
})

test('preserves repeated multipart fields as ordered entries in all generated languages', () => {
  const parsed = parseCurl('curl https://api.example.com/form -F tag=one -F tag=two -F empty=')
  assert.ok(parsed)
  assert.deepEqual(parsed.formData, [
    { name: 'tag', value: 'one' },
    { name: 'tag', value: 'two' },
    { name: 'empty', value: '' },
  ])
  for (const language of ['javascript', 'python', 'php', 'go', 'ruby', 'java', 'csharp']) {
    const output = generateCode({ ...parsed, language })
    assert.ok(output.length > 0, `${language} output`)
    assert.equal((output.match(/tag/g) || []).length >= 2, true, `${language} repeated key`)
  }
  const go = generateCode({ ...parsed, language: 'go' })
  assert.match(go, /for _, formField := range \[\]\[2\]string/)
  assert.doesNotMatch(go, /Object\.keys|indexOf/)
  const python = generateCode({ ...parsed, language: 'python' })
  assert.match(python, /form_data = \[\("tag", \(None, "one"\)\), \("tag", \(None, "two"\)\)/)
  const php = generateCode({ ...parsed, language: 'php' })
  assert.equal((php.match(/Content-Disposition: form-data; name="tag"/g) || []).length, 2)
  assert.ok(php.includes('. "\\r\\n";'))
})

test('routes C# content headers to HttpContent.Headers rather than request headers', () => {
  const parsed = parseCurl('curl https://api.example.com -H "Content-Type: application/json" -H "Content-Language: en" -d hello')
  assert.ok(parsed)
  const output = generateCode({ ...parsed, language: 'csharp' })
  assert.match(output, /new StringContent\("hello", Encoding\.UTF8, "application\/json"\)/)
  assert.match(output, /request\.Content\.Headers\.TryAddWithoutValidation\("Content-Language", "en"\)/)
  assert.doesNotMatch(output, /request\.Headers\.TryAddWithoutValidation\("Content-Type"/)
})

test('reports when JavaScript fetch cannot represent a GET/HEAD body', () => {
  const parsed = parseCurl('curl -X GET https://api.example.com -d q=1')
  assert.ok(parsed)
  assert.throws(() => generateCode({ ...parsed, language: 'javascript' }), /fetch cannot send a GET or HEAD request body/)
  assert.match(generateCode({ ...parsed, language: 'python' }), /requests\.request\("GET"/)
})

test('run returns target-language source and rejects invalid input or language', () => {
  assert.match(run(command, { language: 'python' }), /import requests/)
  assert.throws(() => run('not curl'), /Invalid or unsupported cURL command/)
  assert.throws(() => run(command, { language: 'made-up' }), /Unsupported target language/)
})

test('rejects malformed, unsupported, unsafe, and oversized input', () => {
  assert.equal(parseCurl(''), null)
  assert.equal(parseCurl('curl "https://api.example.com'), null)
  assert.equal(parseCurl('curl file:///etc/passwd'), null)
  assert.equal(parseCurl('curl https://api.example.com -F upload=@secret.txt'), null)
  assert.equal(parseCurl('curl https://api.example.com -H "Bad Header: value"'), null)
  assert.equal(parseCurl(`curl https://api.example.com ${' '.repeat(100_001)}`), null)
  assert.equal(parseCurl('curl https://api.example.com -d x=1 -F x=2'), null)
})
