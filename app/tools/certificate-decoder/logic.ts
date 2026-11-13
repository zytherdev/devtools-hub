import type { ToolOptions } from '@/app/tools/types'

export const MAX_CERTIFICATE_BYTES = 128 * 1024
export const MAX_PEM_TEXT_BYTES = 256 * 1024
const MAX_DER_NODES = 5000
const MAX_DER_DEPTH = 32
const MAX_SAN_ENTRIES = 100

type Tlv = { tag: number; start: number; contentStart: number; end: number }
type Attribute = { oid: string; name: string; value: string }
type DistinguishedName = { displayName: string; attributes: Attribute[] }
type San = { type: string; value: string }
type PublicKeyMetadata = { algorithm: string; oid: string; keySizeBits?: number; curve?: string; exponent?: number }

const OID_NAMES: Record<string, string> = {
  '2.5.4.3': 'CN', '2.5.4.6': 'C', '2.5.4.7': 'L', '2.5.4.8': 'ST',
  '2.5.4.9': 'street', '2.5.4.10': 'O', '2.5.4.11': 'OU',
  '2.5.4.5': 'serialNumber', '2.5.4.4': 'SN', '0.9.2342.19200300.100.1.25': 'DC',
  '0.9.2342.19200300.100.1.1': 'UID',
}
const PUBLIC_KEY_NAMES: Record<string, string> = {
  '1.2.840.113549.1.1.1': 'RSA', '1.2.840.10045.2.1': 'Elliptic Curve',
  '1.2.840.10040.4.1': 'DSA', '1.3.101.112': 'Ed25519', '1.3.101.113': 'Ed448',
  '1.3.101.110': 'X25519', '1.3.101.111': 'X448',
}
const CURVE_NAMES: Record<string, { name: string; bits: number }> = {
  '1.2.840.10045.3.1.7': { name: 'P-256', bits: 256 }, '1.3.132.0.34': { name: 'P-384', bits: 384 },
  '1.3.132.0.35': { name: 'P-521', bits: 521 }, '1.3.132.0.10': { name: 'secp256k1', bits: 256 },
  '1.3.132.0.33': { name: 'P-224', bits: 224 }, '1.3.132.0.1': { name: 'sect163k1', bits: 163 },
}
const SIGNATURE_NAMES: Record<string, string> = {
  '1.2.840.113549.1.1.4': 'MD5 with RSA', '1.2.840.113549.1.1.5': 'SHA-1 with RSA',
  '1.2.840.113549.1.1.11': 'SHA-256 with RSA', '1.2.840.113549.1.1.12': 'SHA-384 with RSA',
  '1.2.840.113549.1.1.13': 'SHA-512 with RSA', '1.2.840.10045.4.3.2': 'ECDSA with SHA-256',
  '1.2.840.10045.4.3.3': 'ECDSA with SHA-384', '1.2.840.10045.4.3.4': 'ECDSA with SHA-512',
  '1.3.101.112': 'Ed25519', '1.3.101.113': 'Ed448',
}
const X25519_BITS = 255

function fail(message: string): never { throw new Error(message) }
function bytesFromPem(text: string): Uint8Array {
  if (new TextEncoder().encode(text).byteLength > MAX_PEM_TEXT_BYTES) throw new RangeError('Certificate text exceeds the 256 KiB input limit.')
  if ((text.match(/-----BEGIN /g) ?? []).length !== 1 || (text.match(/-----END /g) ?? []).length !== 1) fail('Input must contain exactly one PEM CERTIFICATE block.')
  const match = /^-----BEGIN CERTIFICATE-----([\s\S]*?)-----END CERTIFICATE-----$/.exec(text.trim())
  if (!match) fail('Input must be one PEM CERTIFICATE block or binary DER bytes. Other PEM labels and extra content are not accepted.')
  const encoded = match[1].replace(/\s/g, '')
  if (!encoded || !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded) || (encoded.includes('=') && encoded.length % 4 !== 0)) fail('PEM certificate contains malformed Base64 data.')
  const unpadded = encoded.replace(/=+$/, '')
  if (unpadded.length % 4 === 1 || encoded.length - unpadded.length > 2 || encoded.length % 4 === 1) fail('PEM certificate contains malformed Base64 data.')
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  const output: number[] = []
  let accumulator = 0
  let bits = 0
  for (const character of unpadded) {
    accumulator = (accumulator << 6) | alphabet.indexOf(character)
    bits += 6
    if (bits >= 8) { bits -= 8; output.push((accumulator >> bits) & 0xff) }
  }
  if (bits > 0 && (accumulator & ((1 << bits) - 1)) !== 0) fail('PEM certificate contains non-canonical Base64 padding bits.')
  if (output.length > MAX_CERTIFICATE_BYTES) throw new RangeError('Decoded certificate exceeds the 128 KiB processing limit.')
  return Uint8Array.from(output)
}
function readTlv(bytes: Uint8Array, offset: number, limit: number): Tlv {
  if (offset >= limit || offset < 0) fail('Malformed DER certificate: unexpected end of data.')
  const start = offset
  const tag = bytes[offset++]
  if ((tag & 0x1f) === 0x1f) fail('Malformed DER certificate: high-tag-number encoding is unsupported.')
  if (offset >= limit) fail('Malformed DER certificate: missing length.')
  const firstLength = bytes[offset++]
  let length: number
  if (firstLength < 0x80) length = firstLength
  else {
    const count = firstLength & 0x7f
    if (count === 0) fail('Malformed DER certificate: indefinite lengths are not permitted.')
    if (count > 4 || offset + count > limit) fail('Malformed DER certificate: invalid length encoding.')
    if (bytes[offset] === 0) fail('Malformed DER certificate: non-minimal length encoding.')
    length = 0
    for (let index = 0; index < count; index++) length = length * 256 + bytes[offset++]
    if (length < 128 || (count > 1 && length < 256 ** (count - 1))) fail('Malformed DER certificate: non-minimal length encoding.')
  }
  const end = offset + length
  if (end > limit || end > bytes.length) fail('Malformed DER certificate: value extends beyond its container.')
  return { tag, start, contentStart: offset, end }
}
function children(bytes: Uint8Array, node: Tlv, depth: number, budget: { count: number }): Tlv[] {
  if (depth > MAX_DER_DEPTH) throw new RangeError('Certificate DER nesting exceeds the 32-level processing limit.')
  const result: Tlv[] = []
  let offset = node.contentStart
  while (offset < node.end) {
    if (++budget.count > MAX_DER_NODES) throw new RangeError('Certificate DER exceeds the 5,000-element processing limit.')
    const child = readTlv(bytes, offset, node.end)
    result.push(child)
    offset = child.end
  }
  if (offset !== node.end) fail('Malformed DER certificate: invalid container boundary.')
  return result
}
function content(bytes: Uint8Array, node: Tlv): Uint8Array { return bytes.subarray(node.contentStart, node.end) }
function expectTag(node: Tlv | undefined, tag: number, label: string): Tlv {
  if (!node || node.tag !== tag) fail(`Malformed DER certificate: expected ${label}.`)
  return node
}
function oid(bytes: Uint8Array, node: Tlv | undefined): string {
  const checked = expectTag(node, 0x06, 'an object identifier')
  const raw = content(bytes, checked)
  if (!raw.length) fail('Malformed DER certificate: empty object identifier.')
  const arcs: number[] = []
  let value = 0
  let inArc = false
  for (const part of raw) {
    if (!inArc && part === 0x80) fail('Malformed DER certificate: non-minimal object identifier.')
    value = value * 128 + (part & 0x7f)
    if (!Number.isSafeInteger(value)) fail('Malformed DER certificate: object identifier is too large.')
    inArc = (part & 0x80) !== 0
    if (!inArc) {
      if (arcs.length === 0) { arcs.push(Math.min(Math.floor(value / 40), 2)); arcs.push(value - arcs[0] * 40) }
      else arcs.push(value)
      value = 0
    }
  }
  if (inArc) fail('Malformed DER certificate: truncated object identifier.')
  return arcs.join('.')
}
function safeText(value: string): string { return value.replace(/[\u0000-\u001f\u007f-\u009f]/g, '\uFFFD').slice(0, 4096) }
function decodeString(bytes: Uint8Array, node: Tlv): string {
  const raw = content(bytes, node)
  try {
    if (node.tag === 0x1e) {
      if (raw.length % 2) fail('Malformed DER certificate: invalid BMPString length.')
      let result = ''
      for (let index = 0; index < raw.length; index += 2) result += String.fromCharCode((raw[index] << 8) | raw[index + 1])
      return safeText(result)
    }
    if (node.tag === 0x1c) {
      if (raw.length % 4) fail('Malformed DER certificate: invalid UniversalString length.')
      let result = ''
      for (let index = 0; index < raw.length; index += 4) {
        const point = raw[index] * 0x1000000 + (raw[index + 1] << 16) + (raw[index + 2] << 8) + raw[index + 3]
        result += point <= 0x10ffff ? String.fromCodePoint(point) : '\uFFFD'
      }
      return safeText(result)
    }
    if (![0x0c, 0x12, 0x13, 0x14, 0x16, 0x17, 0x18, 0x1a, 0x1b].includes(node.tag)) return `[unsupported string tag 0x${node.tag.toString(16)}]`
    return safeText(new TextDecoder('utf-8', { fatal: true }).decode(raw))
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Malformed DER')) throw error
    return `[unreadable string, ${raw.length} bytes]`
  }
}
function parseName(bytes: Uint8Array, node: Tlv, budget: { count: number }, depth = 0): DistinguishedName {
  expectTag(node, 0x30, 'a distinguished name sequence')
  const attributes: Attribute[] = []
  for (const set of children(bytes, node, depth + 1, budget)) {
    expectTag(set, 0x31, 'a distinguished-name set')
    for (const item of children(bytes, set, depth + 2, budget)) {
      expectTag(item, 0x30, 'a distinguished-name attribute')
      const pair = children(bytes, item, depth + 3, budget)
      if (!pair[1] || pair.length !== 2) fail('Malformed DER certificate: invalid distinguished-name attribute.')
      const attributeOid = oid(bytes, pair[0])
      attributes.push({ oid: attributeOid, name: OID_NAMES[attributeOid] ?? attributeOid, value: decodeString(bytes, pair[1]) })
      if (attributes.length > 200) throw new RangeError('Certificate distinguished name exceeds the 200-attribute processing limit.')
    }
  }
  return { displayName: attributes.map(attribute => `${attribute.name}=${attribute.value}`).join(', '), attributes }
}
function parseTime(bytes: Uint8Array, node: Tlv): string {
  const text = decodeString(bytes, node)
  let year: number, month: number, day: number, hour: number, minute: number, second: number, fraction = 0
  let match: RegExpExecArray | null
  if (node.tag === 0x17) {
    match = /^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})?Z$/.exec(text)
    if (!match) fail('Malformed DER certificate: invalid UTCTime validity value.')
    year = Number(match[1]); year += year >= 50 ? 1900 : 2000
    month = Number(match[2]); day = Number(match[3]); hour = Number(match[4]); minute = Number(match[5]); second = Number(match[6] ?? '0')
  } else if (node.tag === 0x18) {
    match = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(?:[.,](\d+))?Z$/.exec(text)
    if (!match) fail('Malformed DER certificate: invalid GeneralizedTime validity value.')
    year = Number(match[1]); month = Number(match[2]); day = Number(match[3]); hour = Number(match[4]); minute = Number(match[5]); second = Number(match[6]); fraction = Number(`0.${match[7] ?? '0'}`)
  } else fail('Malformed DER certificate: validity field is not a time value.')
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(hour, minute, second, Math.floor(fraction * 1000))
  if (month < 1 || month > 12 || date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day || hour > 23 || minute > 59 || second > 59) fail('Malformed DER certificate: validity contains an impossible date or time.')
  return date.toISOString()
}
function positiveInteger(bytes: Uint8Array, node: Tlv | undefined): Uint8Array {
  const checked = expectTag(node, 0x02, 'an integer')
  const raw = content(bytes, checked)
  if (!raw.length || (raw[0] & 0x80) !== 0) fail('Malformed DER certificate: expected a non-negative integer.')
  if (raw.length > 1 && raw[0] === 0 && (raw[1] & 0x80) === 0) fail('Malformed DER certificate: non-minimal integer encoding.')
  let start = raw[0] === 0 ? 1 : 0
  while (start < raw.length - 1 && raw[start] === 0) start++
  return raw.subarray(start)
}
function integerBitLength(raw: Uint8Array): number {
  if (!raw.length) return 0
  let first = raw[0], leading = 0
  while ((first & 0x80) === 0) { leading++; first <<= 1 }
  return raw.length * 8 - leading
}
function readBitString(bytes: Uint8Array, node: Tlv): Uint8Array {
  expectTag(node, 0x03, 'a bit string')
  const raw = content(bytes, node)
  if (!raw.length || raw[0] > 7 || (raw.length === 1 && raw[0] !== 0)) fail('Malformed DER certificate: invalid bit string.')
  if (raw.length > 1 && raw[0] > 0 && (raw[raw.length - 1] & ((1 << raw[0]) - 1)) !== 0) fail('Malformed DER certificate: nonzero unused bits.')
  return raw.subarray(1)
}
function parsePublicKey(bytes: Uint8Array, node: Tlv, budget: { count: number }): PublicKeyMetadata {
  expectTag(node, 0x30, 'SubjectPublicKeyInfo')
  const spki = children(bytes, node, 1, budget)
  expectTag(spki[0], 0x30, 'public-key algorithm identifier')
  if (!spki[1] || spki.length !== 2) fail('Malformed DER certificate: invalid SubjectPublicKeyInfo.')
  const algorithmParts = children(bytes, spki[0], 2, budget)
  const keyOid = oid(bytes, algorithmParts[0])
  const metadata: PublicKeyMetadata = { algorithm: PUBLIC_KEY_NAMES[keyOid] ?? `Unknown (${keyOid})`, oid: keyOid }
  const params = algorithmParts[1]
  if (keyOid === '1.2.840.10045.2.1' && params?.tag === 0x06) {
    const curveOid = oid(bytes, params)
    const curve = CURVE_NAMES[curveOid]
    metadata.curve = curve?.name ?? curveOid
    if (curve) metadata.keySizeBits = curve.bits
  }
  if (keyOid === '1.3.101.112') metadata.keySizeBits = 256
  if (keyOid === '1.3.101.113') metadata.keySizeBits = 456
  if (keyOid === '1.3.101.110') metadata.keySizeBits = X25519_BITS
  if (keyOid === '1.3.101.111') metadata.keySizeBits = 448
  const bitString = readBitString(bytes, spki[1])
  if (keyOid === '1.2.840.113549.1.1.1') {
    const keyBytes = bitString.slice()
    const keyRoot = readTlv(keyBytes, 0, keyBytes.length)
    if (keyRoot.tag !== 0x30 || keyRoot.end !== keyBytes.length) fail('Malformed DER certificate: invalid RSA public key.')
    const rsaParts = children(keyBytes, keyRoot, 3, budget)
    if (rsaParts.length !== 2) fail('Malformed DER certificate: invalid RSA public key.')
    const modulus = positiveInteger(keyBytes, rsaParts[0]), exponentBytes = positiveInteger(keyBytes, rsaParts[1])
    if (modulus.length > 16 * 1024 || exponentBytes.length > 8) fail('Malformed DER certificate: RSA public key fields exceed safe bounds.')
    metadata.keySizeBits = integerBitLength(modulus)
    let exponent = 0
    for (const byte of exponentBytes) exponent = exponent * 256 + byte
    if (Number.isSafeInteger(exponent)) metadata.exponent = exponent
  } else if (keyOid === '1.2.840.10040.4.1') metadata.keySizeBits = bitString.length * 8
  else if (keyOid !== '1.2.840.10045.2.1' && metadata.keySizeBits === undefined) metadata.keySizeBits = bitString.length * 8
  return metadata
}
function ipv4(bytes: Uint8Array): string { return Array.from(bytes).join('.') }
function ipv6(bytes: Uint8Array): string {
  const words: number[] = []
  for (let index = 0; index < 16; index += 2) words.push(bytes[index] * 256 + bytes[index + 1])
  let bestStart = -1, bestLength = 1
  for (let start = 0; start < words.length;) {
    if (words[start] !== 0) { start++; continue }
    let end = start
    while (end < words.length && words[end] === 0) end++
    if (end - start > bestLength) { bestStart = start; bestLength = end - start }
    start = end
  }
  if (bestStart < 0) return words.map(word => word.toString(16)).join(':')
  return `${words.slice(0, bestStart).map(word => word.toString(16)).join(':')}::${words.slice(bestStart + bestLength).map(word => word.toString(16)).join(':')}`
}
function parseSan(encoded: Uint8Array, budget: { count: number }): San[] {
  const outer = readTlv(encoded, 0, encoded.length)
  if (outer.tag !== 0x30 || outer.end !== encoded.length) fail('Malformed DER certificate: invalid Subject Alternative Name extension.')
  const entries = children(encoded, outer, 1, budget)
  if (entries.length > MAX_SAN_ENTRIES) throw new RangeError('Certificate contains more than 100 subject alternative names.')
  const result: San[] = []
  for (const entry of entries) {
    const raw = content(encoded, entry)
    if (entry.tag === 0x81) result.push({ type: 'email', value: safeText(new TextDecoder('ascii').decode(raw)) })
    else if (entry.tag === 0x82) result.push({ type: 'DNS', value: safeText(new TextDecoder('ascii').decode(raw)) })
    else if (entry.tag === 0x86) result.push({ type: 'URI', value: safeText(new TextDecoder('ascii').decode(raw)) })
    else if (entry.tag === 0x87 && (raw.length === 4 || raw.length === 16)) result.push({ type: 'IP', value: raw.length === 4 ? ipv4(raw) : ipv6(raw) })
    else if (entry.tag === 0xa4) result.push({ type: 'directoryName', value: parseName(encoded, readTlv(encoded, entry.contentStart, entry.end), budget, 2).displayName })
  }
  return result
}
function readExtensions(bytes: Uint8Array, node: Tlv, budget: { count: number }): San[] {
  expectTag(node, 0xa3, 'the extensions field')
  const wrapper = children(bytes, node, 1, budget)
  if (wrapper.length !== 1 || wrapper[0].tag !== 0x30) fail('Malformed DER certificate: invalid extensions container.')
  const result: San[] = []
  for (const extension of children(bytes, wrapper[0], 2, budget)) {
    expectTag(extension, 0x30, 'an extension sequence')
    const fields = children(bytes, extension, 3, budget)
    const extensionOid = oid(bytes, fields[0])
    const valueIndex = fields[1]?.tag === 0x01 ? 2 : 1
    if (fields.length !== valueIndex + 1 || fields[valueIndex]?.tag !== 0x04) fail('Malformed DER certificate: invalid extension value.')
    if (extensionOid === '2.5.29.17') result.push(...parseSan(content(bytes, fields[valueIndex]), budget))
  }
  return result
}

/** Decode a bounded PEM or DER X.509 certificate locally; this does not validate signatures or trust. */
export function decodeCertificate(input: string | Uint8Array): string {
  let bytes: Uint8Array
  if (input instanceof Uint8Array) {
    if (input.byteLength > MAX_CERTIFICATE_BYTES) throw new RangeError('DER certificate exceeds the 128 KiB processing limit.')
    bytes = input
  } else if (typeof input === 'string') {
    if (!input.trim()) fail('Paste a PEM certificate or choose a DER certificate file.')
    bytes = bytesFromPem(input)
  } else fail('Certificate input must be PEM text or DER bytes.')
  if (!bytes.length) fail('Certificate input is empty.')
  if (bytes.length > MAX_CERTIFICATE_BYTES) throw new RangeError('Certificate exceeds the 128 KiB processing limit.')
  const budget = { count: 0 }
  const certificate = readTlv(bytes, 0, bytes.length)
  if (certificate.tag !== 0x30 || certificate.end !== bytes.length) fail('Malformed DER certificate: expected one complete X.509 certificate sequence.')
  const outer = children(bytes, certificate, 0, budget)
  if (outer.length !== 3) fail('Malformed DER certificate: expected certificate, signature algorithm, and signature value.')
  expectTag(outer[0], 0x30, 'the TBSCertificate sequence')
  expectTag(outer[1], 0x30, 'the certificate signature algorithm')
  expectTag(outer[2], 0x03, 'the certificate signature bit string')
  const tbs = children(bytes, outer[0], 1, budget)
  let index = tbs[0]?.tag === 0xa0 ? 1 : 0
  const serial = positiveInteger(bytes, tbs[index++])
  const tbsSignature = children(bytes, expectTag(tbs[index++], 0x30, 'the TBSCertificate signature algorithm'), 2, budget)
  const signatureOid = oid(bytes, tbsSignature[0])
  const issuer = parseName(bytes, tbs[index++], budget, 1)
  const validity = children(bytes, expectTag(tbs[index++], 0x30, 'the validity sequence'), 2, budget)
  if (validity.length !== 2) fail('Malformed DER certificate: validity must contain two dates.')
  const notBefore = parseTime(bytes, validity[0]), notAfter = parseTime(bytes, validity[1])
  const subject = parseName(bytes, tbs[index++], budget, 1)
  const publicKey = parsePublicKey(bytes, tbs[index++], budget)
  let subjectAlternativeNames: San[] = []
  for (; index < tbs.length; index++) {
    if (tbs[index].tag === 0xa3) subjectAlternativeNames = readExtensions(bytes, tbs[index], budget)
    else if (tbs[index].tag !== 0x81 && tbs[index].tag !== 0x82) fail('Malformed DER certificate: unexpected TBSCertificate field.')
  }
  const signatureBits = readBitString(bytes, outer[2])
  if (!signatureBits.length) fail('Malformed DER certificate: certificate signature is empty.')
  const serialNumberHex = Array.from(serial, item => item.toString(16).padStart(2, '0')).join('').toUpperCase()
  const result = {
    format: 'X.509 certificate metadata', subject, issuer, serialNumberHex,
    validity: { notBefore, notAfter }, subjectAlternativeNames, publicKey,
    signatureAlgorithm: { oid: signatureOid, name: SIGNATURE_NAMES[signatureOid] ?? `Unknown (${signatureOid})` },
    security: {
      trustChainValidated: false, signatureVerified: false,
      warning: 'This tool only decodes certificate fields. It does not verify the certificate signature, build or validate a trust chain, check revocation, hostname matching, or determine whether the certificate is trustworthy. Treat decoded data as untrusted.',
    },
  }
  return JSON.stringify(result, null, 2)
}

/** Shared tool contract for PEM text. Use decodeCertificate(Uint8Array) for binary DER. */
export function run(input: string, options: ToolOptions = {}): string {
  if (!options || typeof options !== 'object' || Array.isArray(options)) fail('Certificate Decoder options must be an object.')
  const keys = Object.keys(options)
  if (keys.length) fail(`Unknown Certificate Decoder option: "${keys[0]}".`)
  return decodeCertificate(input)
}
