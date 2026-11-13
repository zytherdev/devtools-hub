/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { X509Certificate } = require('node:crypto')
const { tool } = require('../../app/tools/ssl-checker/definition.ts')
const {
  inspectCertificate,
  MAX_HOSTNAME_LENGTH,
  run,
} = require('../../app/tools/ssl-checker/logic.ts')
const { MAX_CERTIFICATE_BYTES, MAX_PEM_TEXT_BYTES } = require('../../app/tools/certificate-decoder/logic.ts')

// Public, self-signed test certificate; no associated private key is stored in this repository.
const CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIIDoDCCAoigAwIBAgIUSjQ/ZEoS+rCdRgQaZviCZ3XKlD0wDQYJKoZIhvcNAQEL
BQAwQjELMAkGA1UEBhMCVVMxFDASBgNVBAoMC0V4YW1wbGUgT3JnMR0wGwYDVQQD
DBRkZWNvZGVyLmV4YW1wbGUudGVzdDAeFw0yNjExMTMxMTAxNTVaFw0yNzExMTMx
MTAxNTVaMEIxCzAJBgNVBAYTAlVTMRQwEgYDVQQKDAtFeGFtcGxlIE9yZzEdMBsG
A1UEAwwUZGVjb2Rlci5leGFtcGxlLnRlc3QwggEiMA0GCSqGSIb3DQEBAQUAA4IB
DwAwggEKAoIBAQDo8eyo9brbgSbhUHPnmcgjJo73fO6/BMamfOhXsWzVHHlK05H2
SDmhAvEHjhWy+ynoxyWWed9sDuEc+K9D3lF1l2Rvw7Dx1wxOEjlsLF1mav79y875
ePE72bZNmOtUvTrFByz35H6RTa+qypve6mYm/zv04pF3jSanak/Z9vQRUb3MjoG9
0FtgkpwL9ICrzls3GHwnoxeBoPHIgonNub/qF52dpAToDALRD/bq4aeKHGoAbJhO
rOvm8oXMYr9OuPIk0kJUOc/R23PciSFXqk9710OmkJPYU0+dtb07ytx7tYG3rirC
zLjQv1vZhrgoj2sUZdDhXrjOiA74wSdjRC+nAgMBAAGjgY0wgYowHQYDVR0OBBYE
FOPIhAXz0r8sjCX9lV8Od6UhWtmzMB8GA1UdIwQYMBaAFOPIhAXz0r8sjCX9lV8O
d6UhWtmzMA8GA1UdEwEB/wQFMAMBAf8wNwYDVR0RBDAwLoIUZGVjb2Rlci5leGFt
cGxlLnRlc3SCEHd3dy5leGFtcGxlLnRlc3SHBMAAAgowDQYJKoZIhvcNAQELBQAD
ggEBACtpYMbH0fZofb6iBgOoP72x+8Yh63Vq+2cVIV1rHMPqA819hp4ubxidIt/Q
Osa7VOxhE0+3JKxnwrQySBPh8iDkTAd1i50Y+iDyS5tNIV4y3YuNVn7vp4ejIjBX
HIhgSwe/Q8eE1ys4c/ORjD3OMVz49SR2SWm1FIJfnkBUfpHAM3rJQBFOAwBHkzOr
qeI35MxzpScyH3Wot+7otccZgJvCzQrGXiOgqHv0SR27j+m6GIG5p6t2U5IXIIW0
l47Cdtt5Wr5d9da8mdyTkhmBaDPsdQ8OhH1Xc+fMbpC8gTeCKGvh8npIuqDgWb8G
n2vn3UdGi7viFDL6A1DwAVe7xRk=
-----END CERTIFICATE-----`

const CHECK_TIME = new Date('2026-11-14T00:00:00.000Z')
const runAt = (hostname, checkedAt = CHECK_TIME) => inspectCertificate(CERTIFICATE, hostname, checkedAt)
const root = path.join(__dirname, '../../app/tools/ssl-checker')

test('ssl-checker follows the implemented per-tool contract', () => {
  assert.equal(tool.id, 'ssl-checker')
  assert.equal(tool.href, '/ssl-checker')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.badge, '')
  assert.equal(tool.exampleInput, '')
  assert.deepEqual(tool.defaultOptions, {})
  assert.doesNotThrow(() => run(CERTIFICATE, {}))
})

test('decodes the PEM and reports validity dates against a supplied local check time', () => {
  const result = runAt(undefined)
  assert.equal(result.decoding.status, 'success')
  assert.equal(result.validityCheck.status, 'valid')
  assert.equal(result.validityCheck.notBefore, '2026-11-13T11:01:55.000Z')
  assert.equal(result.validityCheck.notAfter, '2027-11-13T11:01:55.000Z')
  assert.equal(result.validityCheck.checkedAt, CHECK_TIME.toISOString())
  assert.equal(result.hostnameCheck.status, 'not-requested')
  assert.deepEqual(result.subjectAlternativeNames, [
    { type: 'DNS', value: 'decoder.example.test' },
    { type: 'DNS', value: 'www.example.test' },
    { type: 'IP', value: '192.0.2.10' },
  ])
})

test('checks not-yet-valid and expired dates without conflating them with decoding', () => {
  const before = runAt(undefined, new Date('2026-11-12T00:00:00.000Z'))
  const after = runAt(undefined, new Date('2027-11-14T00:00:00.000Z'))
  assert.equal(before.decoding.status, 'success')
  assert.equal(before.validityCheck.status, 'not-yet-valid')
  assert.equal(after.decoding.status, 'success')
  assert.equal(after.validityCheck.status, 'expired')
})

test('matches DNS SANs case-insensitively and IP SANs exactly', () => {
  const dns = runAt('DECODER.EXAMPLE.TEST.')
  const ip = runAt('192.0.2.10')
  assert.equal(dns.hostnameCheck.status, 'matched')
  assert.equal(dns.hostnameCheck.matchedSan, 'decoder.example.test')
  assert.equal(ip.hostnameCheck.status, 'matched')
  assert.equal(ip.hostnameCheck.matchedSan, '192.0.2.10')
})

test('reports hostname mismatch when SANs exist and never falls back to the common name', () => {
  const result = runAt('other.example.test')
  assert.equal(result.hostnameCheck.status, 'mismatched')
  assert.match(result.hostnameCheck.message, /common-name fallback is not performed/i)
})

test('accepts hostname boundaries and rejects URLs, ports, malformed names, and overlong input', () => {
  const maxLengthHostname = `${'a'.repeat(63)}.${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(61)}`
  assert.equal(maxLengthHostname.length, MAX_HOSTNAME_LENGTH)
  assert.equal(runAt(maxLengthHostname).hostnameCheck.status, 'mismatched')
  assert.throws(() => run(CERTIFICATE, { hostname: `${maxLengthHostname}a` }), /253-character limit/i)
  assert.throws(() => run(CERTIFICATE, { hostname: 'https://example.test' }), /hostname only/i)
  assert.throws(() => run(CERTIFICATE, { hostname: 'example.test:443' }), /valid DNS hostname/i)
  assert.throws(() => run(CERTIFICATE, { hostname: 'bad..example.test' }), /valid DNS hostname/i)
  assert.throws(() => run(CERTIFICATE, { hostname: 12 }), /Hostname option must be text/i)
})

test('rejects empty, malformed, non-certificate, and oversized PEM input', () => {
  assert.throws(() => run('', {}), /Paste one PEM X\.509 certificate/i)
  assert.throws(() => run('not a certificate', {}), /PEM CERTIFICATE block/i)
  assert.throws(() => run(CERTIFICATE.replace('CERTIFICATE', 'PRIVATE KEY'), {}), /PEM CERTIFICATE block/i)
  assert.throws(() => run(`${CERTIFICATE}\n${CERTIFICATE}`, {}), /exactly one PEM CERTIFICATE block/i)
  assert.throws(() => run(CERTIFICATE.replace(/MIID/, 'MI!D'), {}), /Base64/i)
  assert.throws(() => run(`${CERTIFICATE}${' '.repeat(MAX_PEM_TEXT_BYTES)}`, {}), /256 KiB/i)
  const oversizedDecodedPem = `-----BEGIN CERTIFICATE-----\n${'A'.repeat(Math.ceil((MAX_CERTIFICATE_BYTES + 1) * 4 / 3))}\n-----END CERTIFICATE-----`
  assert.throws(() => run(oversizedDecodedPem, {}), /128 KiB/i)
})

test('rejects invalid options and invalid injected check times', () => {
  assert.throws(() => run(CERTIFICATE, { unexpected: 'value' }), /Unknown SSL Checker option/i)
  assert.throws(() => run(CERTIFICATE, null), /options must be an object/i)
  assert.throws(() => run(CERTIFICATE, []), /options must be an object/i)
  assert.throws(() => inspectCertificate(CERTIFICATE, undefined, new Date('invalid')), /valid date/i)
})

test('cryptographic expectations remain explicit and agree with native X.509 date/SAN decoding', () => {
  const result = runAt('decoder.example.test')
  const native = new X509Certificate(CERTIFICATE)
  assert.equal(new Date(native.validFrom).toISOString(), result.validityCheck.notBefore)
  assert.equal(new Date(native.validTo).toISOString(), result.validityCheck.notAfter)
  assert.match(native.subjectAltName, /DNS:decoder\.example\.test/)
  assert.deepEqual(result.cryptographicValidation, {
    signatureVerified: false,
    trustChainValidated: false,
    revocationChecked: false,
  })
})

test('UI, metadata, and documentation disclose local privacy and do not claim live TLS or trust checks', () => {
  const ui = fs.readFileSync(path.join(root, 'Tool.tsx'), 'utf8')
  const logic = fs.readFileSync(path.join(root, 'logic.ts'), 'utf8')
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8')
  assert.match(ui, /useState\(''\)/)
  assert.match(ui, /PEM X\.509 certificate/)
  assert.match(ui, /Hostname \(optional\)/)
  assert.match(ui, /does not send the hostname or certificate to a server, does not save them, and does not log their contents/i)
  assert.match(ui, /does not connect to the hostname, perform a live TLS handshake/i)
  assert.match(ui, /does not.*trust chain/i)
  assert.doesNotMatch(ui, /console\.(?:log|info|debug|warn|error)/)
  assert.doesNotMatch(ui, /fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|document\.cookie/)
  assert.doesNotMatch(logic, /fetch\s*\(|XMLHttpRequest|WebSocket/)
  assert.match(readme, /live TLS connection or handshake/i)
  assert.match(readme, /does not transmit them/i)
  assert.match(readme, /No additional package dependencies/i)
  assert.equal(tool.status, 'implemented')
})
