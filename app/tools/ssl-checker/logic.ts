import type { ToolOptions } from '@/app/tools/types'
import { decodeCertificate, MAX_PEM_TEXT_BYTES as PEM_TEXT_LIMIT } from '@/app/tools/certificate-decoder/logic'

export const MAX_PEM_TEXT_BYTES = PEM_TEXT_LIMIT

export const MAX_HOSTNAME_LENGTH = 253

export type ValidityStatus = 'valid' | 'not-yet-valid' | 'expired'
export type HostnameStatus = 'not-requested' | 'matched' | 'mismatched' | 'unavailable'

type SubjectAlternativeName = { type: string; value: string }
type NormalizedHost = { kind: 'DNS' | 'IP'; value: string }

export type CertificateCheckResult = {
  decoding: { status: 'success'; message: string }
  validityCheck: {
    status: ValidityStatus
    notBefore: string
    notAfter: string
    checkedAt: string
    basis: string
  }
  hostnameCheck: {
    status: HostnameStatus
    hostname?: string
    matchedSan?: string
    message: string
  }
  subjectAlternativeNames: SubjectAlternativeName[]
  cryptographicValidation: {
    signatureVerified: false
    trustChainValidated: false
    revocationChecked: false
  }
}

function fail(message: string): never {
  throw new Error(message)
}

function ipv4Address(value: string): string | null {
  const parts = value.split('.')
  if (parts.length !== 4 || parts.some(part => !/^\d{1,3}$/.test(part))) return null
  const octets = parts.map(Number)
  if (octets.some(octet => octet < 0 || octet > 255)) return null
  return octets.join('.')
}

function ipv6Address(value: string): string | null {
  const raw = value.startsWith('[') && value.endsWith(']') ? value.slice(1, -1) : value
  if (!raw.includes(':') || /[\s/?#@\\]/.test(raw)) return null
  try {
    const parsed = new URL(`http://[${raw}]/`).hostname
    return parsed.startsWith('[') && parsed.endsWith(']') ? parsed.slice(1, -1).toLowerCase() : null
  } catch {
    return null
  }
}

function normalizeHostname(input: string): NormalizedHost {
  if (input.length > MAX_HOSTNAME_LENGTH) {
    throw new RangeError(`Hostname exceeds the ${MAX_HOSTNAME_LENGTH}-character limit.`)
  }
  const hostname = input.trim()
  if (!hostname) fail('Hostname must not be empty when supplied.')
  if (/[\u0000-\u0020\u007f/?#@\\]/.test(hostname)) {
    fail('Enter a hostname only, without a URL, path, port, or whitespace.')
  }

  const ipv6 = ipv6Address(hostname)
  if (ipv6) return { kind: 'IP', value: ipv6 }
  if (hostname.includes(':') || hostname.startsWith('[') || hostname.endsWith(']')) {
    fail('Enter a valid DNS hostname, IPv4 address, or IPv6 address.')
  }

  const ipv4 = ipv4Address(hostname)
  if (ipv4) return { kind: 'IP', value: ipv4 }

  let asciiHostname: string
  try {
    asciiHostname = new URL(`http://${hostname}`).hostname.toLowerCase()
  } catch {
    fail('Enter a valid DNS hostname, IPv4 address, or IPv6 address.')
  }
  const normalizedIpv4 = ipv4Address(asciiHostname)
  if (normalizedIpv4) return { kind: 'IP', value: normalizedIpv4 }

  const dnsName = asciiHostname.endsWith('.') ? asciiHostname.slice(0, -1) : asciiHostname
  if (!dnsName || dnsName.length > MAX_HOSTNAME_LENGTH || dnsName.includes('*')) {
    fail('Enter a valid DNS hostname, IPv4 address, or IPv6 address.')
  }
  const labels = dnsName.split('.')
  if (labels.some(label => label.length < 1 || label.length > 63 || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label))) {
    fail('Enter a valid DNS hostname, IPv4 address, or IPv6 address.')
  }
  return { kind: 'DNS', value: dnsName }
}

function normalizedDnsSan(value: string): { exact?: string; wildcardBase?: string } | null {
  const name = value.toLowerCase().replace(/\.$/, '')
  if (name.startsWith('*.')) {
    if (name.slice(2).includes('*')) return null
    try {
      const base = normalizeHostname(name.slice(2))
      return base.kind === 'DNS' ? { wildcardBase: base.value } : null
    } catch {
      return null
    }
  }
  try {
    const normalized = normalizeHostname(name)
    return normalized.kind === 'DNS' ? { exact: normalized.value } : null
  } catch {
    return null
  }
}

function dnsSanMatches(host: string, sanValue: string): boolean {
  const san = normalizedDnsSan(sanValue)
  if (!san) return false
  if (san.exact) return host === san.exact
  if (!san.wildcardBase || !host.endsWith(`.${san.wildcardBase}`)) return false
  const leftmostLabel = host.slice(0, -(san.wildcardBase.length + 1))
  return leftmostLabel.length > 0 && !leftmostLabel.includes('.')
}

function ipSanMatches(host: string, sanValue: string): boolean {
  const normalized = ipv4Address(sanValue) ?? ipv6Address(sanValue)
  return normalized !== null && host === normalized
}

function checkHostname(hostname: string | undefined, sans: SubjectAlternativeName[]): CertificateCheckResult['hostnameCheck'] {
  if (hostname === undefined || hostname.trim() === '') {
    return {
      status: 'not-requested',
      message: 'No hostname was supplied; no hostname comparison was performed.',
    }
  }

  const normalizedHost = normalizeHostname(hostname)
  if (sans.length === 0) {
    return {
      status: 'unavailable',
      hostname: hostname.trim(),
      message: 'The certificate contains no subject alternative names. No common-name fallback is performed.',
    }
  }

  const match = sans.find(san => normalizedHost.kind === 'DNS'
    ? san.type === 'DNS' && dnsSanMatches(normalizedHost.value, san.value)
    : san.type === 'IP' && ipSanMatches(normalizedHost.value, san.value))
  if (match) {
    return {
      status: 'matched',
      hostname: hostname.trim(),
      matchedSan: match.value,
      message: `Hostname matches the ${match.type} subject alternative name.`,
    }
  }
  return {
    status: 'mismatched',
    hostname: hostname.trim(),
    message: 'No subject alternative name matches this hostname. Common-name fallback is not performed.',
  }
}

/** Decode a bounded PEM certificate locally, then evaluate its dates and optional SAN hostname match. */
export function inspectCertificate(input: string, hostname?: string, checkedAt: Date = new Date()): CertificateCheckResult {
  if (typeof input !== 'string') fail('Certificate input must be PEM text.')
  if (!input.trim()) fail('Paste one PEM X.509 certificate to check.')
  if (new TextEncoder().encode(input).byteLength > MAX_PEM_TEXT_BYTES) {
    throw new RangeError('PEM certificate text exceeds the 256 KiB input limit.')
  }
  if (!(checkedAt instanceof Date) || !Number.isFinite(checkedAt.getTime())) {
    fail('Check time must be a valid date.')
  }

  const decoded = JSON.parse(decodeCertificate(input)) as {
    validity: { notBefore: string; notAfter: string }
    subjectAlternativeNames: SubjectAlternativeName[]
  }
  const notBefore = new Date(decoded.validity.notBefore)
  const notAfter = new Date(decoded.validity.notAfter)
  const checkedTime = checkedAt.getTime()
  const validityStatus: ValidityStatus = checkedTime < notBefore.getTime()
    ? 'not-yet-valid'
    : checkedTime > notAfter.getTime() ? 'expired' : 'valid'
  const sans = decoded.subjectAlternativeNames

  return {
    decoding: {
      status: 'success',
      message: 'One PEM X.509 certificate was decoded successfully.',
    },
    validityCheck: {
      status: validityStatus,
      notBefore: decoded.validity.notBefore,
      notAfter: decoded.validity.notAfter,
      checkedAt: checkedAt.toISOString(),
      basis: 'The certificate validity dates are compared with the local clock; this is not a trust decision.',
    },
    hostnameCheck: checkHostname(hostname, sans),
    subjectAlternativeNames: sans,
    cryptographicValidation: {
      signatureVerified: false,
      trustChainValidated: false,
      revocationChecked: false,
    },
  }
}

/** Shared text-tool contract. Only the optional hostname option is accepted. */
export function run(input: string, options: ToolOptions = {}): string {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    fail('SSL Checker options must be an object.')
  }
  const keys = Object.keys(options)
  if (keys.some(key => key !== 'hostname')) {
    const unknownKey = keys.find(key => key !== 'hostname')
    fail(`Unknown SSL Checker option: "${unknownKey}".`)
  }
  const hostname = options.hostname
  if (hostname !== undefined && typeof hostname !== 'string') {
    fail('Hostname option must be text.')
  }
  return JSON.stringify(inspectCertificate(input, hostname), null, 2)
}
