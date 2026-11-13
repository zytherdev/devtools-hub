import type { ToolOptions } from '@/app/tools/types'

const MAX_INPUT_LENGTH = 64
const IPV4_MAX = (BigInt(1) << BigInt(32)) - BigInt(1)
const IPV6_MAX = (BigInt(1) << BigInt(128)) - BigInt(1)

type IPv4Result = {
  version: 4
  input: string
  prefixLength: number
  networkAddress: string
  broadcastAddress: string
  subnetMask: string
  wildcardMask: string
  firstUsableAddress: string
  lastUsableAddress: string
  totalAddresses: string
  usableHostCount: string
  isNetworkAddress: boolean
  isBroadcastAddress: boolean
}

type IPv6Result = {
  version: 6
  input: string
  prefixLength: number
  networkAddress: string
  lastAddress: string
  totalAddresses: string
  isNetworkAddress: boolean
}

export type SubnetResult = IPv4Result | IPv6Result

function validateOptions(options: unknown): void {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('Options must be an empty object; this tool does not accept options.')
  }
  if (Object.keys(options).length > 0) {
    throw new Error('This tool does not accept options.')
  }
}

function parseIPv4(address: string): bigint {
  const parts = address.split('.')
  if (parts.length !== 4) {
    throw new Error('Invalid IPv4 address. Enter exactly four decimal octets from 0 to 255.')
  }
  let value = BigInt(0)
  for (const part of parts) {
    if (!/^(0|[1-9]\d{0,2})$/.test(part)) {
      throw new Error('Invalid IPv4 address. Octets must be decimal digits without leading zeroes.')
    }
    const octet = Number(part)
    if (octet > 255) {
      throw new Error('Invalid IPv4 address. Each octet must be from 0 to 255.')
    }
    value = (value << BigInt(8)) | BigInt(octet)
  }
  return value
}

function ipv4Text(value: bigint): string {
  const octets: string[] = []
  for (let shift = BigInt(24); shift >= BigInt(0); shift -= BigInt(8)) {
    octets.push(String((value >> shift) & BigInt(255)))
  }
  return octets.join('.')
}

function parseIPv6Side(side: string): number[] {
  if (!side) return []
  const tokens = side.split(':')
  const groups: number[] = []
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]
    if (token.includes('.')) {
      if (index !== tokens.length - 1) {
        throw new Error('Invalid IPv6 address. An embedded IPv4 address must be the final component.')
      }
      const ipv4 = parseIPv4(token)
      groups.push(Number((ipv4 >> BigInt(16)) & BigInt(65535)), Number(ipv4 & BigInt(65535)))
    } else {
      if (!/^[0-9a-fA-F]{1,4}$/.test(token)) {
        throw new Error('Invalid IPv6 address. Enter hexadecimal groups separated by colons.')
      }
      groups.push(Number.parseInt(token, 16))
    }
  }
  return groups
}

function parseIPv6(address: string): bigint {
  const firstDot = address.indexOf('.')
  const finalComponent = address.slice(address.lastIndexOf(':') + 1)
  if (firstDot >= 0 && (!finalComponent.includes('.') || address.indexOf(':', firstDot) >= 0)) {
    throw new Error('Invalid IPv6 address. An embedded IPv4 address must be the final component.')
  }
  if (address.includes('%')) {
    throw new Error('IPv6 zone identifiers are not supported; enter an address without a zone suffix.')
  }
  const compressionParts = address.split('::')
  if (compressionParts.length > 2) {
    throw new Error('Invalid IPv6 address. Use at most one :: compression marker.')
  }

  let groups: number[]
  if (compressionParts.length === 2) {
    const left = parseIPv6Side(compressionParts[0])
    const right = parseIPv6Side(compressionParts[1])
    const missing = 8 - left.length - right.length
    if (missing < 1) {
      throw new Error('Invalid IPv6 address. :: must compress at least one group.')
    }
    groups = [...left, ...Array<number>(missing).fill(0), ...right]
  } else {
    groups = parseIPv6Side(address)
    if (groups.length !== 8) {
      throw new Error('Invalid IPv6 address. Enter eight groups, or use :: to compress one or more groups.')
    }
  }
  if (groups.length !== 8) {
    throw new Error('Invalid IPv6 address. An address must contain exactly 128 bits.')
  }
  let value = BigInt(0)
  for (const group of groups) value = (value << BigInt(16)) | BigInt(group)
  return value
}

function ipv6Text(value: bigint): string {
  const groups: number[] = []
  for (let shift = BigInt(112); shift >= BigInt(0); shift -= BigInt(16)) {
    groups.push(Number((value >> shift) & BigInt(65535)))
  }
  let bestStart = -1
  let bestLength = 1
  for (let index = 0; index < groups.length;) {
    if (groups[index] !== 0) {
      index += 1
      continue
    }
    let end = index + 1
    while (end < groups.length && groups[end] === 0) end += 1
    if (end - index > bestLength) {
      bestStart = index
      bestLength = end - index
    }
    index = end
  }
  if (bestStart < 0) return groups.map(group => group.toString(16)).join(':')
  const left = groups.slice(0, bestStart).map(group => group.toString(16)).join(':')
  const right = groups.slice(bestStart + bestLength).map(group => group.toString(16)).join(':')
  return `${left}::${right}`
}

function parseCIDR(input: string): { address: string; prefixLength: number; version: 4 | 6 } {
  if (typeof input !== 'string') {
    throw new Error('Input must be an IPv4 or IPv6 address followed by a CIDR prefix, such as 192.168.1.10/24.')
  }
  if (input.length > MAX_INPUT_LENGTH) {
    throw new Error(`Input must contain ${MAX_INPUT_LENGTH} characters or fewer.`)
  }
  const slash = input.indexOf('/')
  if (slash <= 0 || slash !== input.lastIndexOf('/') || slash === input.length - 1) {
    throw new Error('Enter one IPv4 or IPv6 address and one CIDR prefix, separated by a single slash.')
  }
  const address = input.slice(0, slash)
  const prefixText = input.slice(slash + 1)
  if (!/^(0|[1-9]\d{0,2})$/.test(prefixText)) {
    throw new Error('CIDR prefix must be a decimal integer without signs, spaces, or leading zeroes.')
  }
  const version: 4 | 6 = address.includes(':') ? 6 : 4
  const prefixLength = Number(prefixText)
  const maxPrefix = version === 4 ? 32 : 128
  if (prefixLength > maxPrefix) {
    throw new Error(`IPv${version} prefix must be from 0 to ${maxPrefix}.`)
  }
  return { address, prefixLength, version }
}

export function calculate(input: string): SubnetResult {
  const { address, prefixLength, version } = parseCIDR(input)
  if (version === 4) {
    const addressValue = parseIPv4(address)
    const hostBits = 32 - prefixLength
    const total = BigInt(1) << BigInt(hostBits)
    const hostMask = total - BigInt(1)
    const subnetMaskValue = IPV4_MAX ^ hostMask
    const network = addressValue & subnetMaskValue
    const broadcast = network | hostMask
    const usable = prefixLength === 32 ? BigInt(1) : prefixLength === 31 ? BigInt(2) : total - BigInt(2)
    const firstUsable = prefixLength >= 31 ? network : network + BigInt(1)
    const lastUsable = prefixLength >= 31 ? broadcast : broadcast - BigInt(1)
    return {
      version: 4,
      input,
      prefixLength,
      networkAddress: ipv4Text(network),
      broadcastAddress: ipv4Text(broadcast),
      subnetMask: ipv4Text(subnetMaskValue),
      wildcardMask: ipv4Text(hostMask),
      firstUsableAddress: ipv4Text(firstUsable),
      lastUsableAddress: ipv4Text(lastUsable),
      totalAddresses: total.toString(),
      usableHostCount: usable.toString(),
      isNetworkAddress: addressValue === network,
      isBroadcastAddress: addressValue === broadcast,
    }
  }

  const addressValue = parseIPv6(address)
  const hostBits = 128 - prefixLength
  const total = BigInt(1) << BigInt(hostBits)
  const hostMask = total - BigInt(1)
  const network = addressValue & (IPV6_MAX ^ hostMask)
  const lastAddress = network | hostMask
  return {
    version: 6,
    input,
    prefixLength,
    networkAddress: ipv6Text(network),
    lastAddress: ipv6Text(lastAddress),
    totalAddresses: total.toString(),
    isNetworkAddress: addressValue === network,
  }
}

export function run(input: string, options: ToolOptions = {}): string {
  validateOptions(options)
  return JSON.stringify(calculate(input), null, 2)
}
