/* eslint-disable @typescript-eslint/no-require-imports */
require('../register-ts.cjs')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const { X509Certificate } = require('node:crypto')
const { tool } = require('../../app/tools/certificate-decoder/definition.ts')
const { decodeCertificate, MAX_CERTIFICATE_BYTES, MAX_PEM_TEXT_BYTES, run } = require('../../app/tools/certificate-decoder/logic.ts')

// Public, self-signed fixture with no associated private key in this repository.
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
const pemToDer = pem => Buffer.from(pem.replace(/-----[^\n]+-----/g, '').replace(/\s/g, ''), 'base64')

test('certificate-decoder follows the implemented per-tool contract', () => {
  assert.equal(tool.id, 'certificate-decoder')
  assert.equal(tool.href, '/certificate-decoder')
  assert.equal(tool.status, 'implemented')
  assert.equal(tool.badge, '')
  assert.equal(tool.exampleInput, '')
  assert.doesNotThrow(() => run(CERTIFICATE, {}))
})

test('decodes known PEM subject, issuer, serial, validity, SAN, and RSA key metadata', () => {
  const result = JSON.parse(run(CERTIFICATE, {}))
  assert.equal(result.subject.displayName, 'C=US, O=Example Org, CN=decoder.example.test')
  assert.equal(result.issuer.displayName, result.subject.displayName)
  assert.equal(result.serialNumberHex, '4A343F644A12FAB09D46041A66F8826775CA943D')
  assert.equal(result.validity.notBefore, '2026-11-13T11:01:55.000Z')
  assert.equal(result.validity.notAfter, '2027-11-13T11:01:55.000Z')
  assert.deepEqual(result.subjectAlternativeNames, [
    { type: 'DNS', value: 'decoder.example.test' },
    { type: 'DNS', value: 'www.example.test' },
    { type: 'IP', value: '192.0.2.10' },
  ])
  assert.deepEqual(result.publicKey, { algorithm: 'RSA', oid: '1.2.840.113549.1.1.1', keySizeBits: 2048, exponent: 65537 })
  assert.equal(result.signatureAlgorithm.name, 'SHA-256 with RSA')
  assert.equal(result.security.signatureVerified, false)
  assert.equal(result.security.trustChainValidated, false)
  assert.match(result.security.warning, /does not verify the certificate signature/i)
})

test('DER and PEM decode to the same metadata and agree with Node X509 facts', () => {
  const der = pemToDer(CERTIFICATE)
  const fromPem = JSON.parse(decodeCertificate(CERTIFICATE))
  const fromDer = JSON.parse(decodeCertificate(new Uint8Array(der)))
  assert.deepEqual(fromDer, fromPem)
  const native = new X509Certificate(CERTIFICATE)
  assert.equal(native.publicKey.asymmetricKeyDetails.modulusLength, fromDer.publicKey.keySizeBits)
  assert.match(native.subject, /CN=decoder\.example\.test/)
  assert.match(native.subjectAltName, /DNS:decoder\.example\.test/)
  assert.equal(new Date(native.validFrom).toISOString(), fromDer.validity.notBefore)
  assert.equal(new Date(native.validTo).toISOString(), fromDer.validity.notAfter)
  assert.equal(native.serialNumber, fromDer.serialNumberHex)
})

test('rejects missing, non-certificate, malformed, and truncated inputs', () => {
  assert.throws(() => run('', {}), /Paste a PEM certificate or choose a DER certificate file/i)
  assert.throws(() => run('not a certificate', {}), /one PEM CERTIFICATE block/i)
  assert.throws(() => run(CERTIFICATE.replace('CERTIFICATE', 'PRIVATE KEY'), {}), /one PEM CERTIFICATE block/i)
  assert.throws(() => decodeCertificate(new Uint8Array([0x30, 0x82, 0x00])), /Malformed DER certificate/i)
  assert.throws(() => decodeCertificate(new Uint8Array(pemToDer(CERTIFICATE).subarray(0, 40))), /Malformed DER certificate/i)
  assert.throws(() => run(`${CERTIFICATE}\n-----BEGIN CERTIFICATE-----\nAA==\n-----END CERTIFICATE-----`, {}), /exactly one PEM CERTIFICATE block/i)
  assert.throws(() => run(CERTIFICATE.replace(/MIID/, 'MI!D'), {}), /Base64/i)
})

test('rejects input beyond DER and PEM processing bounds before parsing', () => {
  assert.throws(() => decodeCertificate(new Uint8Array(MAX_CERTIFICATE_BYTES + 1)), /128 KiB/i)
  assert.throws(() => run(`-----BEGIN CERTIFICATE-----\n${'A'.repeat(MAX_PEM_TEXT_BYTES)}\n-----END CERTIFICATE-----`, {}), /256 KiB/i)
  assert.ok(pemToDer(CERTIFICATE).length < MAX_CERTIFICATE_BYTES)
})

test('rejects options and non-text input rather than changing the decode operation', () => {
  assert.throws(() => run(CERTIFICATE, { format: 'compact' }), /Unknown Certificate Decoder option/i)
  assert.throws(() => run(CERTIFICATE, null), /options must be an object/i)
  assert.throws(() => run(CERTIFICATE, []), /options must be an object/i)
  assert.throws(() => decodeCertificate(123), /input must be PEM text or DER bytes/i)
})

test('UI and documentation keep defaults empty and disclose local handling and non-validation', () => {
  const root = path.join(__dirname, '../../app/tools/certificate-decoder')
  const ui = fs.readFileSync(path.join(root, 'Tool.tsx'), 'utf8')
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8')
  assert.match(ui, /useState\(''\)/)
  assert.match(ui, /Choose PEM or DER file/)
  assert.match(ui, /Decoding runs in this browser/)
  assert.match(ui, /not trust-chain validation/i)
  assert.match(ui, /not intentionally transmitted, logged, or persisted/i)
  assert.doesNotMatch(ui, /console\.(?:log|info|debug|warn|error)/)
  assert.doesNotMatch(ui, /defaultValue=/)
  assert.match(readme, /no additional package dependencies/i)
  assert.match(readme, /128 KiB/i)
  assert.match(readme, /256 KiB/i)
  assert.match(readme, /does not validate trust chain|not trust-chain validation/i)
})
