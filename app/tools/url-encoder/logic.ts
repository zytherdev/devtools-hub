const MAX_TEXT_LENGTH = 1024 * 1024
const MAX_ENCODED_LENGTH = 6 * MAX_TEXT_LENGTH
const MAX_DECODE_INPUT_LENGTH = 3 * 1024 * 1024
const ALLOWED_OPTIONS = new Set(['operation', 'mode', 'action'])

function assertWellFormedUnicode(value: string): void {
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index)
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1)
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        throw new Error('Input contains an unpaired UTF-16 high surrogate; provide valid Unicode text.')
      }
      index++
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      throw new Error('Input contains an unpaired UTF-16 low surrogate; provide valid Unicode text.')
    }
  }
}

function getOperation(options: Record<string, string>): 'encode' | 'decode' {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('URL options must be an object containing string values.')
  }

  for (const key of Object.keys(options)) {
    if (!ALLOWED_OPTIONS.has(key)) throw new Error(`Unknown URL option: "${key}".`)
    if (typeof options[key] !== 'string') throw new Error(`URL option "${key}" must be a string.`)
  }

  const selected = ['operation', 'mode', 'action']
    .filter(key => Object.prototype.hasOwnProperty.call(options, key))
    .map(key => options[key])

  if (selected.some(value => value !== 'encode' && value !== 'decode')) {
    throw new Error('URL operation must be "encode" or "decode".')
  }
  if (selected.some(value => value !== selected[0])) {
    throw new Error('URL operation aliases (operation, mode, action) must agree.')
  }
  return (selected[0] || 'encode') as 'encode' | 'decode'
}

/** Encode/decode a URL component locally; this does not parse or normalize a full URL. */
export function transformUrl(input: string, options: Record<string, string>): string {
  if (typeof input !== 'string') throw new Error('URL input must be text.')
  const operation = getOperation(options)

  if (operation === 'encode') {
    if (input.length > MAX_TEXT_LENGTH) throw new RangeError('URL text exceeds the 1 MiB processing limit.')
    assertWellFormedUnicode(input)
    const encoded = encodeURIComponent(input)
    if (encoded.length > MAX_ENCODED_LENGTH) throw new RangeError('Encoded URL component exceeds the 6 MiB output limit.')
    return encoded
  }

  if (input.length > MAX_DECODE_INPUT_LENGTH) throw new RangeError('Encoded URL component exceeds the 3 MiB processing limit.')
  try {
    const decoded = decodeURIComponent(input)
    if (decoded.length > MAX_TEXT_LENGTH) throw new RangeError('Decoded URL text exceeds the 1 MiB output limit.')
    return decoded
  } catch (cause) {
    if (cause instanceof RangeError) throw cause
    throw new Error('Malformed percent-encoding or invalid UTF-8 in URL component; check every percent escape and byte sequence.')
  }
}

export function run(input: string, options: Record<string, string> = {}): string {
  return transformUrl(input, options)
}
