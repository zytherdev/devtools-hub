/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { tool } = require('../../app/tools/mac-lookup/definition.ts')
const { lookupVendor, normalizeOui, MacLookupError, MACVENDORS_ENDPOINT, MAX_RESPONSE_BYTES, REQUEST_TIMEOUT_MS } = require('../../app/tools/mac-lookup/logic.ts')

function textResponse(body, status = 200, headers = {}) {
  const bytes = new TextEncoder().encode(body)
  return new Response(new ReadableStream({
    start(controller) {
      controller.enqueue(bytes)
      controller.close()
    },
  }), { status, headers: { 'content-type': 'text/plain', ...headers } })
}

function expectCode(code) {
  return error => error instanceof MacLookupError && error.code === code
}

test('mac-lookup is implemented and retains the dynamic catalog route', () => {
  assert.equal(tool.id, 'mac-lookup')
  assert.equal(tool.href, '/mac-lookup')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.exampleInput, '00:11:22:AA:BB:CC')
})

test('normalizes supported OUI and MAC notations to the first 24 bits', () => {
  assert.equal(normalizeOui('00:11:22:aa:bb:cc'), '001122')
  assert.equal(normalizeOui('00-11-22'), '001122')
  assert.equal(normalizeOui('0011.2233.4455'), '001122')
  assert.equal(normalizeOui(' 001122 '), '001122')
})

test('sends only the normalized OUI prefix to the fixed HTTPS endpoint', async () => {
  let requestedUrl
  let requestInit
  const fetchMock = async (url, init) => {
    requestedUrl = String(url)
    requestInit = init
    return textResponse('Example Devices, Inc.')
  }

  const result = await lookupVendor('de:ad:be:ef:01:23', fetchMock)
  assert.deepEqual(result, { oui: 'DEADBE', vendor: 'Example Devices, Inc.' })
  assert.equal(requestedUrl, `${MACVENDORS_ENDPOINT}DEADBE`)
  assert.equal(new URL(requestedUrl).origin, 'https://api.macvendors.com')
  assert.equal(new URL(requestedUrl).pathname, '/DEADBE')
  assert.equal(requestInit.method, 'GET')
  assert.equal(requestInit.credentials, 'omit')
  assert.equal(requestInit.cache, 'no-store')
  assert.equal(requestInit.referrerPolicy, 'no-referrer')
  assert.equal(requestInit.headers.Accept, 'text/plain')
  assert.ok(requestInit.signal instanceof AbortSignal)
  assert.equal(requestedUrl.includes('EF0123'), false)
})

test('rejects invalid and overlong inputs without contacting the provider', async () => {
  let fetchCalls = 0
  const fetchMock = async () => { fetchCalls += 1; return textResponse('should not be called') }
  for (const input of ['', 'xyz', '00112233', '00:11-22:33:44:55', '00:11:22:33:44:55:66', 'a'.repeat(33)]) {
    await assert.rejects(lookupVendor(input, fetchMock), expectCode('invalid'))
  }
  assert.equal(fetchCalls, 0)
})

test('maps provider not-found and rate-limit statuses explicitly', async () => {
  await assert.rejects(lookupVendor('001122', async () => new Response('', { status: 404 })), expectCode('not-found'))
  await assert.rejects(lookupVendor('001122', async () => new Response('', { status: 429 })), expectCode('rate-limit'))
  await assert.rejects(lookupVendor('001122', async () => new Response('', { status: 503 })), error => error.code === 'provider' && /503/.test(error.message))
})

test('reports network/CORS failures distinctly', async () => {
  await assert.rejects(lookupVendor('001122', async () => { throw new TypeError('Failed to fetch') }), error => error.code === 'network' && /CORS/.test(error.message))
})

test('enforces the 5-second request timeout and abort signal', async () => {
  let signal
  const fetchMock = (_url, init) => {
    signal = init.signal
    return new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true }))
  }
  const started = Date.now()
  await assert.rejects(lookupVendor('001122', fetchMock), expectCode('timeout'))
  assert.ok(Date.now() - started >= REQUEST_TIMEOUT_MS - 100)
  assert.equal(signal.aborted, true)
})

test('rejects declared and streamed responses above the byte limit', async () => {
  await assert.rejects(lookupVendor('001122', async () => textResponse('x', 200, { 'content-length': String(MAX_RESPONSE_BYTES + 1) })), expectCode('response-too-large'))
  const hugeText = 'x'.repeat(MAX_RESPONSE_BYTES + 1)
  await assert.rejects(lookupVendor('001122', async () => textResponse(hugeText)), expectCode('response-too-large'))
})

test('rejects an empty provider result', async () => {
  await assert.rejects(lookupVendor('001122', async () => textResponse('  ')), expectCode('invalid-response'))
})

test('discloses the fixed provider, exact prefix-only data, and privacy implications before the Lookup control', () => {
  const component = fs.readFileSync(path.join(__dirname, '../../app/tools/mac-lookup/Tool.tsx'), 'utf8')
  const disclosureIndex = component.indexOf('only the first 24-bit OUI prefix (the first 6 hexadecimal digits)')
  const providerIndex = component.indexOf('MACVendors')
  const privacyIndex = component.indexOf('IP address and standard browser/connection metadata')
  const lookupControlIndex = component.indexOf(": 'Lookup'}")
  assert.ok(disclosureIndex >= 0 && providerIndex > disclosureIndex)
  assert.ok(privacyIndex > disclosureIndex)
  assert.ok(lookupControlIndex > privacyIndex)
  assert.match(component, /Nothing is sent while you type/)
  assert.match(component, /remaining device-specific MAC bytes are never sent/)
  assert.match(component, /privacy-policy/)
  assert.match(component, /onSubmit=\{event => void submit\(event\)\}/)
  assert.equal((component.match(/lookupVendor\(/g) || []).length, 1)
})
