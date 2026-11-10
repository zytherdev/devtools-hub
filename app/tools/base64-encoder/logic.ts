import { decodeBase64, encodeBase64 } from '@/app/lib/tools/base64'

const MAX_BYTES = 64 * 1024 * 1024

function assertUtf8SizeWithinLimit(input: string): void {
  let byteLength = 0
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i)
    if (code <= 0x7f) byteLength++
    else if (code <= 0x7ff) byteLength += 2
    else if (code >= 0xd800 && code <= 0xdbff && i + 1 < input.length) {
      const next = input.charCodeAt(i + 1)
      if (next >= 0xdc00 && next <= 0xdfff) {
        byteLength += 4
        i++
      } else byteLength += 3
    } else byteLength += 3
    if (byteLength > MAX_BYTES) throw new RangeError('Text exceeds the 64 MiB Base64 processing limit.')
  }
}

/** Encode or decode Unicode text as UTF-8 Base64, using fatal UTF-8 decoding. */
export function transformBase64(input: string, options: Record<string, string>): string {
  const operation = options.operation ?? options.mode ?? options.action ?? 'encode'
  if (operation === 'encode') {
    assertUtf8SizeWithinLimit(input)
    return encodeBase64(new TextEncoder().encode(input), {
      urlSafe: options.urlSafe === 'true',
      padding: options.padding !== 'false',
    })
  }
  if (operation === 'decode') {
    const bytes = decodeBase64(input, {
      urlSafe: options.urlSafe === 'true',
      allowWhitespace: options.allowWhitespace === 'true',
      allowUnpadded: options.allowUnpadded === 'true',
    })
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  }
  throw new Error('Base64 operation must be "encode" or "decode".')
}

export function run(input: string, options: Record<string, string> = {}): string {
  return transformBase64(input, options)
}
