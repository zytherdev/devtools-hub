/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { tool } = require('../../app/tools/ip-lookup/definition.ts')
const implementation = require('../../app/tools/ip-lookup/logic.ts')

const originalFetch = global.fetch
const fixture = (extra = {}) => ({
  ip: '8.8.8.8',
  success: true,
  type: 'IPv4',
  continent: 'North America',
  country: 'United States',
  country_code: 'US',
  region: 'California',
  city: 'Mountain View',
  postal: '94035',
  latitude: 37.4056,
  longitude: -122.0775,
  connection: { asn: 15169, org: 'Google LLC', isp: 'Google LLC', domain: 'google.com' },
  timezone: { id: 'America/Los_Angeles', utc: '-08:00' },
  ...extra,
})

function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })
}

test.afterEach(() => { global.fetch = originalFetch })

test('IP Lookup metadata follows the dynamic tool contract', () => {
  assert.equal(tool.id, 'ip-lookup')
  assert.equal(tool.href, '/ip-lookup')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.exampleInput, '8.8.8.8')
  assert.equal(typeof implementation.lookupIpAddress, 'function')
})

test('validation accepts public IPv4 and IPv6 addresses', () => {
  assert.deepEqual(implementation.validatePublicIp('8.8.8.8'), { valid: true, version: 4 })
  assert.deepEqual(implementation.validatePublicIp('2001:4860:4860::8888'), { valid: true, version: 6 })
  assert.deepEqual(implementation.validatePublicIp('2606:4700:4700::1111'), { valid: true, version: 6 })
})

test('validation rejects malformed, user-controlled, whitespace, and overlong input', () => {
  for (const input of [
    '', ' 8.8.8.8', '8.8.8.8 ', '08.8.8.8', '256.8.8.8', '8.8.8',
    'https://8.8.8.8', 'example.com', '8.8.8.8:443', '[2001:4860::1]',
    'fe80::1%eth0', '2001:::1', '2001:4860::gggg', '1'.repeat(46),
  ]) {
    assert.equal(implementation.validatePublicIp(input).valid, false, `Expected rejection for ${input}`)
  }
})

test('no request is made before submission or for private, reserved, and special-use addresses', async () => {
  let requests = 0
  global.fetch = async () => { requests += 1; return jsonResponse(fixture()) }

  // Importing and rendering this client component does not invoke fetch; only its submit handler does.
  const source = fs.readFileSync(path.join(__dirname, '../../app/tools/ip-lookup/Tool.tsx'), 'utf8')
  assert.doesNotMatch(source, /useEffect\s*\(/)
  assert.match(source, /onSubmit=\{handleSubmit\}/)
  assert.equal(requests, 0)

  for (const input of [
    '10.0.0.1', '172.16.2.3', '192.168.1.1', '127.0.0.1', '169.254.1.2',
    '100.64.0.1', '192.0.2.1', '198.51.100.1', '203.0.113.1', '224.0.0.1',
    '255.255.255.255', '0.1.2.3', '240.0.0.1', '::', '::1', 'fc00::1',
    'fe80::1', 'ff02::1', '2001:db8::1', '2002::1', '::ffff:8.8.8.8',
  ]) {
    await assert.rejects(implementation.lookupIpAddress(input), /private, reserved, or special-use/)
  }
  assert.equal(requests, 0)
})

test('lookup calls only the exact fixed HTTPS provider URL with privacy-safe fetch options', async () => {
  let call
  global.fetch = async (url, options) => {
    call = { url, options }
    return jsonResponse(fixture())
  }

  const output = await implementation.lookupIpAddress('8.8.8.8')
  assert.equal(call.url, 'https://ipwho.is/8.8.8.8')
  assert.equal(call.options.method, 'GET')
  assert.equal(call.options.mode, 'cors')
  assert.equal(call.options.credentials, 'omit')
  assert.equal(call.options.cache, 'no-store')
  assert.equal(call.options.referrerPolicy, 'no-referrer')
  assert.equal(call.options.redirect, 'error')
  assert.equal(call.options.headers.Accept, 'application/json')
  assert.ok(call.options.signal instanceof AbortSignal)
  assert.equal(output.ip, '8.8.8.8')
  assert.equal(output.country, 'United States')
  assert.equal(output.connection.isp, 'Google LLC')
  assert.equal(output.latitude, 37.4056)
})

test('IPv6 lookup uses the fixed provider endpoint and valid provider fields', async () => {
  let requestedUrl
  global.fetch = async url => {
    requestedUrl = url
    return jsonResponse({ ...fixture(), ip: '2001:4860:4860::8888', type: 'IPv6' })
  }
  const result = await implementation.lookupIpAddress('2001:4860:4860::8888')
  assert.equal(requestedUrl, 'https://ipwho.is/2001:4860:4860::8888')
  assert.equal(result.type, 'IPv6')
})

test('lookup rejects declared and streamed responses over the byte limit', async () => {
  global.fetch = async () => new Response(JSON.stringify(fixture()), {
    status: 200,
    headers: { 'content-type': 'application/json', 'content-length': String(implementation.MAX_RESPONSE_BYTES + 1) },
  })
  await assert.rejects(implementation.lookupIpAddress('8.8.8.8'), /exceeded the 16384-byte limit/)

  global.fetch = async () => new Response(' '.repeat(implementation.MAX_RESPONSE_BYTES + 1), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
  await assert.rejects(implementation.lookupIpAddress('8.8.8.8'), /exceeded the 16384-byte limit/)
})

test('lookup handles timeout and network, HTTP, and malformed-provider errors clearly', async () => {
  const originalSetTimeout = global.setTimeout
  global.setTimeout = (callback, delay, ...args) => originalSetTimeout(callback, delay === implementation.REQUEST_TIMEOUT_MS ? 5 : delay, ...args)
  global.fetch = (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
  })
  await assert.rejects(implementation.lookupIpAddress('8.8.8.8'), /timed out/)
  global.setTimeout = originalSetTimeout

  global.fetch = async () => { throw new TypeError('private fetch details') }
  await assert.rejects(implementation.lookupIpAddress('8.8.8.8'), /request failed\. Check your connection/)

  global.fetch = async () => jsonResponse({}, 429)
  await assert.rejects(implementation.lookupIpAddress('8.8.8.8'), /rate limit was reached/)

  global.fetch = async () => jsonResponse({}, 503)
  await assert.rejects(implementation.lookupIpAddress('8.8.8.8'), /HTTP 503/)

  global.fetch = async () => new Response('{', { status: 200, headers: { 'content-type': 'application/json' } })
  await assert.rejects(implementation.lookupIpAddress('8.8.8.8'), /malformed JSON/)

  global.fetch = async () => new Response('not json', { status: 200, headers: { 'content-type': 'text/plain' } })
  await assert.rejects(implementation.lookupIpAddress('8.8.8.8'), /non-JSON response/)
})

test('failed provider data is rejected and tool options cannot alter the request', async () => {
  global.fetch = async () => jsonResponse({ success: false, message: 'Invalid IP address' })
  await assert.rejects(implementation.lookupIpAddress('8.8.8.8'), /could not complete this lookup/)
  await assert.rejects(implementation.run('8.8.8.8', { url: 'https://attacker.invalid' }), /does not accept options/)
})

test('privacy notice and form validation precede the explicit lookup action', () => {
  const source = fs.readFileSync(path.join(__dirname, '../../app/tools/ip-lookup/Tool.tsx'), 'utf8')
  assert.match(source, /submitting a valid public IP sends that address to/)
  assert.match(source, /<strong[^>]*>ipwho\.is<\/strong>/)
  assert.match(source, /does not look up an address automatically or store query results/)
  assert.match(source, /const validation = validatePublicIp\(address\)/)
  assert.match(source, /if \(!validation\.valid\) \{\s*setError\(validation\.reason\)/)
  assert.match(source, /onSubmit=\{handleSubmit\}/)
  assert.match(source, /Look up IP/)
  assert.doesNotMatch(source, /localStorage|sessionStorage|console\.(log|info|debug)/)
})
