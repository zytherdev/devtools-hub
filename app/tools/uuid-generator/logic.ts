import type { ToolOptions } from '@/app/tools/types'

const MAX_UUIDS = 1_000
const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function parseCount(value: string | undefined): number {
  if (value === undefined) return 1
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new Error('Option "count" must be a whole number from 1 to 1000.')
  }

  const count = Number(value)
  if (!Number.isSafeInteger(count) || count < 1 || count > MAX_UUIDS) {
    throw new Error('Option "count" must be a whole number from 1 to 1000.')
  }
  return count
}

function getV4Uuid(): string {
  const webCrypto = globalThis.crypto
  if (!webCrypto || typeof webCrypto.getRandomValues !== 'function') {
    throw new Error('Secure UUID generation is unavailable because Web Crypto is not supported in this environment.')
  }

  const bytes = new Uint8Array(16)
  try {
    webCrypto.getRandomValues(bytes)
  } catch {
    throw new Error('Secure UUID generation failed because Web Crypto could not provide random bytes.')
  }

  // RFC 4122/9562 UUID v4: reserve the version and variant bits; all remaining
  // bits come directly from the uniform cryptographic random-byte source.
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
  const uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  if (!UUID_V4_PATTERN.test(uuid)) {
    throw new Error('Secure UUID generation produced an invalid UUID.')
  }
  return uuid
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string' || input.trim().length > 0) {
    throw new Error('UUID Generator does not accept input text; configure generation in the options instead.')
  }
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('Options must be an object containing supported UUID settings.')
  }

  for (const key of Object.keys(options)) {
    if (key === 'namespace' || key === 'name') {
      throw new Error(`Option "${key}" is only used by UUID v5, which this tool does not support.`)
    }
    if (key !== 'version' && key !== 'count') {
      throw new Error(`Unknown option "${key}". Supported options are "version" and "count".`)
    }
  }

  const version = options.version ?? '4'
  if (version !== '4') {
    throw new Error('Option "version" must be "4"; this tool supports UUID v4 only.')
  }
  const count = parseCount(options.count)
  const uuids: string[] = []
  for (let index = 0; index < count; index += 1) {
    uuids.push(getV4Uuid())
  }
  return uuids.join('\n')
}
