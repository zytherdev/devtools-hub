import type { ToolOptions } from '@/app/tools/types'

export const MACVENDORS_ENDPOINT = 'https://api.macvendors.com/'
export const REQUEST_TIMEOUT_MS = 5_000
export const MAX_RESPONSE_BYTES = 2_048
export const MAX_INPUT_CHARS = 32

type LookupErrorCode = 'invalid' | 'not-found' | 'rate-limit' | 'timeout' | 'network' | 'response-too-large' | 'provider' | 'invalid-response'

export class MacLookupError extends Error {
  readonly code: LookupErrorCode

  constructor(code: LookupErrorCode, message: string) {
    super(message)
    this.name = 'MacLookupError'
    this.code = code
  }
}

export interface MacLookupResult {
  oui: string
  vendor: string
}

/** Normalize a complete 48-bit MAC address or a 24-bit OUI to six uppercase hex digits. */
export function normalizeOui(input: string): string {
  if (typeof input !== 'string' || input.length > MAX_INPUT_CHARS) {
    throw new MacLookupError('invalid', 'Enter a 6- or 12-digit hexadecimal MAC address or OUI.')
  }

  const value = input.trim()
  const acceptedFormat =
    /^[0-9a-f]{6}$/i.test(value) ||
    /^[0-9a-f]{12}$/i.test(value) ||
    /^[0-9a-f]{2}(?::[0-9a-f]{2}){2,5}$/i.test(value) ||
    /^[0-9a-f]{2}(?:-[0-9a-f]{2}){2,5}$/i.test(value) ||
    /^[0-9a-f]{2}(?:\.[0-9a-f]{2}){2,5}$/i.test(value) ||
    /^[0-9a-f]{4}(?:\.[0-9a-f]{4}){1,2}$/i.test(value)

  if (!acceptedFormat) {
    throw new MacLookupError('invalid', 'Enter a valid 24-bit OUI or 48-bit MAC using hexadecimal digits, colons, dashes, or Cisco-style dots.')
  }

  return value.replace(/[:.\-]/g, '').slice(0, 6).toUpperCase()
}

function errorFromStatus(status: number): MacLookupError {
  if (status === 404) {
    return new MacLookupError('not-found', 'No vendor entry was found for this OUI.')
  }
  if (status === 429) {
    return new MacLookupError('rate-limit', 'MACVendors rate-limited this request. Try again later; its free API is limited to 1 request per second and 1,000 requests per day.')
  }
  return new MacLookupError('provider', `MACVendors returned HTTP ${status}. The lookup could not be completed.`)
}

async function readBoundedText(response: Response): Promise<string> {
  const declaredLength = response.headers.get('content-length')
  if (declaredLength && /^\d+$/.test(declaredLength) && Number(declaredLength) > MAX_RESPONSE_BYTES) {
    throw new MacLookupError('response-too-large', 'The provider response exceeded the 2 KB safety limit.')
  }
  if (!response.body) {
    throw new MacLookupError('invalid-response', 'The provider returned an empty response.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let bytesRead = 0
  let text = ''
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      bytesRead += value.byteLength
      if (bytesRead > MAX_RESPONSE_BYTES) {
        void reader.cancel().catch(() => undefined)
        throw new MacLookupError('response-too-large', 'The provider response exceeded the 2 KB safety limit.')
      }
      text += decoder.decode(value, { stream: true })
    }
    text += decoder.decode()
  } finally {
    reader.releaseLock()
  }
  return text.trim()
}

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

/**
 * Contact MACVendors only when explicitly called. The request path contains exactly
 * the normalized first 24-bit OUI; device-specific bytes are never transmitted.
 * fetchImpl exists for deterministic native tests and cannot alter the endpoint.
 */
export async function lookupVendor(input: string, fetchImpl: FetchLike = fetch): Promise<MacLookupResult> {
  const oui = normalizeOui(input)
  const controller = new AbortController()
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  let timedOut = false

  const operation = (async () => {
    const response = await fetchImpl(`${MACVENDORS_ENDPOINT}${oui}`, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      redirect: 'error',
      referrerPolicy: 'no-referrer',
      headers: { Accept: 'text/plain' },
      signal: controller.signal,
    })
    if (!response.ok) throw errorFromStatus(response.status)

    const vendor = await readBoundedText(response)
    if (!vendor || vendor.length > MAX_RESPONSE_BYTES || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(vendor)) {
      throw new MacLookupError('invalid-response', 'MACVendors returned an empty or invalid vendor response.')
    }
    return { oui, vendor }
  })()

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      timedOut = true
      controller.abort()
      reject(new MacLookupError('timeout', 'The MACVendors request timed out after 5 seconds.'))
    }, REQUEST_TIMEOUT_MS)
  })

  try {
    return await Promise.race([operation, timeout])
  } catch (cause) {
    if (cause instanceof MacLookupError) throw cause
    if (timedOut) throw new MacLookupError('timeout', 'The MACVendors request timed out after 5 seconds.')
    throw new MacLookupError('network', 'Could not reach MACVendors. Check your connection; a browser CORS restriction may also block this request.')
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId)
  }
}

/** Shared tool-runner contract; output is JSON and no lookup happens until this is called. */
export async function run(input: string, options: ToolOptions = {}): Promise<string> {
  if (!options || typeof options !== 'object' || Array.isArray(options) || Object.keys(options).length > 0) {
    throw new MacLookupError('invalid', 'MAC Lookup does not accept options.')
  }
  const result = await lookupVendor(input)
  return JSON.stringify(result, null, 2)
}
