import type { ToolOptions } from '@/app/tools/types'

export const MAX_INPUT_LENGTH = 45
export const MAX_RESPONSE_BYTES = 16 * 1024
export const REQUEST_TIMEOUT_MS = 8_000
export const PROVIDER_ORIGIN = 'https://ipwho.is'

export type LookupResult = {
  ip: string
  type: 'IPv4' | 'IPv6'
  continent: string | null
  country: string | null
  country_code: string | null
  region: string | null
  city: string | null
  postal: string | null
  latitude: number | null
  longitude: number | null
  connection: {
    asn: number | null
    org: string | null
    isp: string | null
    domain: string | null
  }
  timezone: {
    id: string | null
    utc: string | null
  }
}

type ParsedAddress = { version: 4; octets: number[] } | { version: 6; groups: number[] }

const RESERVED_IPV4_CIDRS = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.31.196.0', 24],
  ['192.52.193.0', 24],
  ['192.88.99.0', 24],
  ['192.168.0.0', 16],
  ['192.175.48.0', 24],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
] as const

function ipv4Number(octets: number[]): number {
  return octets.reduce((value, octet) => value * 256 + octet, 0)
}

function isInIpv4Cidr(address: number, network: string, prefix: number): boolean {
  const base = ipv4Number(network.split('.').map(Number))
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
  return (address & mask) === (base & mask)
}

function parseIPv4(text: string): number[] | null {
  const parts = text.split('.')
  if (parts.length !== 4) return null
  const octets: number[] = []
  for (const part of parts) {
    if (!/^(?:0|[1-9]\d{0,2})$/.test(part)) return null
    const value = Number(part)
    if (value > 255) return null
    octets.push(value)
  }
  return octets
}

function parseIPv6(text: string): number[] | null {
  if (!text || text.includes('%') || text.includes('[') || text.includes(']')) return null
  let normalized = text.toLowerCase()

  if (normalized.includes('.')) {
    const lastColon = normalized.lastIndexOf(':')
    if (lastColon < 0) return null
    const embedded = parseIPv4(normalized.slice(lastColon + 1))
    if (!embedded) return null
    const high = ((embedded[0] << 8) | embedded[1]).toString(16)
    const low = ((embedded[2] << 8) | embedded[3]).toString(16)
    normalized = `${normalized.slice(0, lastColon + 1)}${high}:${low}`
  }

  const compression = normalized.indexOf('::')
  if (compression !== -1 && compression !== normalized.lastIndexOf('::')) return null
  let groups: string[]
  if (compression === -1) {
    groups = normalized.split(':')
    if (groups.length !== 8 || groups.some(group => !group)) return null
  } else {
    const left = normalized.slice(0, compression) ? normalized.slice(0, compression).split(':') : []
    const right = normalized.slice(compression + 2) ? normalized.slice(compression + 2).split(':') : []
    if (left.some(group => !group) || right.some(group => !group) || left.length + right.length >= 8) return null
    groups = [...left, ...Array(8 - left.length - right.length).fill('0'), ...right]
  }

  if (groups.length !== 8 || groups.some(group => !/^[0-9a-f]{1,4}$/.test(group))) return null
  return groups.map(group => Number.parseInt(group, 16))
}

function parseAddress(input: string): ParsedAddress | null {
  if (typeof input !== 'string' || input.length === 0 || input.length > MAX_INPUT_LENGTH) return null
  if (input.includes(':')) {
    const groups = parseIPv6(input)
    return groups ? { version: 6, groups } : null
  }
  const octets = parseIPv4(input)
  return octets ? { version: 4, octets } : null
}

function isPublicAddress(address: ParsedAddress): boolean {
  if (address.version === 4) {
    const value = ipv4Number(address.octets)
    return !RESERVED_IPV4_CIDRS.some(([network, prefix]) => isInIpv4Cidr(value, network, prefix))
  }

  const groups = address.groups
  const first = groups[0]
  // Public IPv6 unicast addresses are in 2000::/3; this excludes unspecified,
  // loopback, IPv4-mapped, ULA, link-local, multicast, and other non-global ranges.
  if (first < 0x2000 || first > 0x3fff) return false
  // Exclude special-protocol assignments, documentation, 6to4, and documentation space.
  if (first === 0x2001 && (groups[1] <= 0x01ff || groups[1] === 0x0db8)) return false
  if (first === 0x2002) return false
  if (first === 0x3fff && groups[1] <= 0x000f) return false
  return true
}

export function validatePublicIp(input: string): { valid: true; version: 4 | 6 } | { valid: false; reason: string } {
  const address = parseAddress(input)
  if (!address) {
    return { valid: false, reason: `Enter one complete IPv4 or IPv6 address using only its address text (maximum ${MAX_INPUT_LENGTH} characters).` }
  }
  if (!isPublicAddress(address)) {
    return { valid: false, reason: 'This address is private, reserved, or special-use. Only public IP addresses can be looked up.' }
  }
  return { valid: true, version: address.version }
}

function validateOptions(options: ToolOptions): void {
  if (!options || typeof options !== 'object' || Array.isArray(options) || Object.keys(options).length > 0) {
    throw new Error('IP Lookup does not accept options.')
  }
}

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null
}

function safeString(value: unknown): string | null {
  return typeof value === 'string' && value.length <= 200 ? value : null
}

function safeNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function toLookupResult(value: unknown, expectedType: 'IPv4' | 'IPv6'): LookupResult {
  const data = record(value)
  if (!data || data.success !== true || (data.type !== 'IPv4' && data.type !== 'IPv6') || data.type !== expectedType) {
    const message = data ? safeString(data.message) : null
    throw new Error(message ? `The provider could not complete this lookup: ${message}` : 'The provider returned an invalid or unsuccessful lookup response.')
  }

  const connection = record(data.connection)
  const timezone = record(data.timezone)
  const ip = safeString(data.ip)
  if (!ip) throw new Error('The provider returned an invalid lookup response.')

  return {
    ip,
    type: expectedType,
    continent: safeString(data.continent),
    country: safeString(data.country),
    country_code: safeString(data.country_code),
    region: safeString(data.region),
    city: safeString(data.city),
    postal: safeString(data.postal),
    latitude: safeNumber(data.latitude),
    longitude: safeNumber(data.longitude),
    connection: {
      asn: safeNumber(connection?.asn),
      org: safeString(connection?.org),
      isp: safeString(connection?.isp),
      domain: safeString(connection?.domain),
    },
    timezone: {
      id: safeString(timezone?.id),
      utc: safeString(timezone?.utc),
    },
  }
}

async function readBoundedJson(response: Response): Promise<unknown> {
  const contentLength = response.headers.get('content-length')
  if (contentLength && /^\d+$/.test(contentLength) && Number(contentLength) > MAX_RESPONSE_BYTES) {
    throw new Error(`The provider response exceeded the ${MAX_RESPONSE_BYTES}-byte limit.`)
  }
  const contentType = response.headers.get('content-type') ?? ''
  if (!/\bapplication\/json\b/i.test(contentType)) throw new Error('The provider returned a non-JSON response.')
  if (!response.body) throw new Error('The provider returned an empty response.')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let bytes = 0
  let text = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > MAX_RESPONSE_BYTES) {
        await reader.cancel().catch(() => undefined)
        throw new Error(`The provider response exceeded the ${MAX_RESPONSE_BYTES}-byte limit.`)
      }
      text += decoder.decode(value, { stream: true })
    }
    text += decoder.decode()
  } finally {
    reader.releaseLock()
  }
  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new Error('The provider returned malformed JSON.')
  }
}

/** Look up only a user-submitted public IP. No request is made until this function is called. */
export async function lookupIpAddress(input: string): Promise<LookupResult> {
  const validation = validatePublicIp(input)
  if (!validation.valid) throw new Error(validation.reason)
  const type = validation.version === 4 ? 'IPv4' : 'IPv6'
  const url = `${PROVIDER_ORIGIN}/${input}`
  const controller = new AbortController()
  let rejectTimeout: ((reason?: unknown) => void) | undefined
  const timeout = new Promise<never>((_resolve, reject) => { rejectTimeout = reject })
  const timer = setTimeout(() => {
    controller.abort()
    rejectTimeout?.(new Error('The lookup timed out. Please try again.'))
  }, REQUEST_TIMEOUT_MS)

  const request = (async () => {
    let response: Response
    try {
      response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store',
        referrerPolicy: 'no-referrer',
        redirect: 'error',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
    } catch (error) {
      if (controller.signal.aborted) throw error
      throw new Error('The lookup request failed. Check your connection and try again.')
    }
    if (!response.ok) {
      if (response.status === 429) throw new Error('The lookup provider rate limit was reached. Try again later.')
      throw new Error(`The lookup provider returned HTTP ${response.status}. Please try again later.`)
    }
    const body = await readBoundedJson(response)
    return toLookupResult(body, type)
  })()

  try {
    return await Promise.race([request, timeout])
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('The lookup timed out')) throw error
    if (controller.signal.aborted) throw new Error('The lookup timed out. Please try again.')
    throw error
  } finally {
    clearTimeout(timer)
  }
}

/** Compatibility entry point for the tool runner. */
export async function run(input: string, options: ToolOptions = {}): Promise<string> {
  validateOptions(options)
  return JSON.stringify(await lookupIpAddress(input), null, 2)
}
