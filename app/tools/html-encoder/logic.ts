const MAX_TEXT_LENGTH = 1024 * 1024
const MAX_DECODE_INPUT_LENGTH = 3 * 1024 * 1024
const MAX_OUTPUT_LENGTH = 12 * 1024 * 1024
const MAX_ENTITY_LENGTH = 64
const ALLOWED_OPTIONS = new Set(['operation', 'mode', 'action', 'encodeNonAscii'])

// Deliberately explicit: decoding is a text substitution, never HTML parsing.
const NAMED_ENTITIES: Readonly<Record<string, string>> = Object.freeze({
  amp: '&', apos: "'", copy: '\u00a9', curren: '\u00a4', deg: '\u00b0', divide: '\u00f7',
  euro: '\u20ac', gt: '>', hellip: '\u2026', laquo: '\u00ab', ldquo: '\u201c',
  lsquo: '\u2018', lt: '<', mdash: '\u2014', micro: '\u00b5', middot: '\u00b7',
  nbsp: '\u00a0', ndash: '\u2013', not: '\u00ac', para: '\u00b6', plusmn: '\u00b1',
  pound: '\u00a3', quot: '"', raquo: '\u00bb', rdquo: '\u201d', reg: '\u00ae',
  rsquo: '\u2019', sect: '\u00a7', times: '\u00d7', trade: '\u2122', yen: '\u00a5',
  AElig: '\u00c6', Aacute: '\u00c1', Acirc: '\u00c2', Agrave: '\u00c0', Aring: '\u00c5',
  Atilde: '\u00c3', Auml: '\u00c4', Ccedil: '\u00c7', ETH: '\u00d0', Eacute: '\u00c9',
  Ecirc: '\u00ca', Egrave: '\u00c8', Euml: '\u00cb', Iacute: '\u00cd', Icirc: '\u00ce',
  Igrave: '\u00cc', Iuml: '\u00cf', Ntilde: '\u00d1', Oacute: '\u00d3', Ocirc: '\u00d4',
  Ograve: '\u00d2', Oslash: '\u00d8', Otilde: '\u00d5', Ouml: '\u00d6', THORN: '\u00de',
  Uacute: '\u00da', Ucirc: '\u00db', Ugrave: '\u00d9', Uuml: '\u00dc', Yacute: '\u00dd',
  aacute: '\u00e1', acirc: '\u00e2', aelig: '\u00e6', agrave: '\u00e0', aring: '\u00e5',
  atilde: '\u00e3', auml: '\u00e4', ccedil: '\u00e7', eacute: '\u00e9', ecirc: '\u00ea',
  egrave: '\u00e8', eth: '\u00f0', euml: '\u00eb', iacute: '\u00ed', icirc: '\u00ee',
  igrave: '\u00ec', iuml: '\u00ef', ntilde: '\u00f1', oacute: '\u00f3', ocirc: '\u00f4',
  ograve: '\u00f2', oslash: '\u00f8', otilde: '\u00f5', ouml: '\u00f6', szlig: '\u00df',
  thorn: '\u00fe', uacute: '\u00fa', ucirc: '\u00fb', ugrave: '\u00f9', uuml: '\u00fc',
  yacute: '\u00fd', yuml: '\u00ff',
})

const ENCODED_CHARACTERS: Readonly<Record<string, string>> = Object.freeze({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})

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

function getOptions(options: Record<string, string>): { operation: 'encode' | 'decode'; encodeNonAscii: boolean } {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('HTML entity options must be an object containing string values.')
  }

  for (const key of Object.keys(options)) {
    if (!ALLOWED_OPTIONS.has(key)) throw new Error(`Unknown HTML entity option: "${key}".`)
    if (typeof options[key] !== 'string') throw new Error(`HTML entity option "${key}" must be a string.`)
  }

  const aliases = ['operation', 'mode', 'action']
    .filter(key => Object.prototype.hasOwnProperty.call(options, key))
    .map(key => options[key])
  if (aliases.some(value => value !== 'encode' && value !== 'decode')) {
    throw new Error('HTML entity operation must be "encode" or "decode".')
  }
  if (aliases.some(value => value !== aliases[0])) {
    throw new Error('HTML entity operation aliases (operation, mode, action) must agree.')
  }

  const encodeNonAscii = options.encodeNonAscii ?? 'false'
  if (encodeNonAscii !== 'true' && encodeNonAscii !== 'false') {
    throw new Error('HTML entity option "encodeNonAscii" must be "true" or "false".')
  }
  const operation = (aliases[0] || 'encode') as 'encode' | 'decode'
  if (operation === 'decode' && encodeNonAscii === 'true') {
    throw new Error('HTML entity option "encodeNonAscii" applies only to encode operations.')
  }
  return { operation, encodeNonAscii: encodeNonAscii === 'true' }
}

function appendBounded(parts: string[], value: string, currentLength: number, limit: number): number {
  const nextLength = currentLength + value.length
  if (nextLength > limit) throw new RangeError(`HTML entity output exceeds the ${Math.floor(limit / (1024 * 1024))} MiB output limit.`)
  parts.push(value)
  return nextLength
}

function encode(input: string, encodeNonAscii: boolean): string {
  if (input.length > MAX_TEXT_LENGTH) throw new RangeError('HTML entity text exceeds the 1 MiB processing limit.')
  assertWellFormedUnicode(input)

  const parts: string[] = []
  let outputLength = 0
  for (const character of input) {
    const replacement = ENCODED_CHARACTERS[character]
    const codePoint = character.codePointAt(0) as number
    const encoded = replacement ?? (encodeNonAscii && codePoint > 0x7f ? `&#x${codePoint.toString(16).toUpperCase()};` : character)
    outputLength = appendBounded(parts, encoded, outputLength, MAX_OUTPUT_LENGTH)
  }
  return parts.join('')
}

function decode(input: string): string {
  if (input.length > MAX_DECODE_INPUT_LENGTH) throw new RangeError('HTML entity input exceeds the 3 MiB processing limit.')
  assertWellFormedUnicode(input)

  const parts: string[] = []
  let outputLength = 0
  let cursor = 0
  while (cursor < input.length) {
    const ampersand = input.indexOf('&', cursor)
    if (ampersand < 0) {
      outputLength = appendBounded(parts, input.slice(cursor), outputLength, MAX_DECODE_INPUT_LENGTH)
      break
    }
    if (ampersand > cursor) {
      outputLength = appendBounded(parts, input.slice(cursor, ampersand), outputLength, MAX_DECODE_INPUT_LENGTH)
    }

    const semicolon = input.indexOf(';', ampersand + 1)
    if (input[ampersand + 1] === '#' && semicolon < 0) {
      throw new Error('Numeric HTML character reference is missing its terminating semicolon.')
    }
    if (semicolon >= 0 && semicolon - ampersand > MAX_ENTITY_LENGTH && input[ampersand + 1] === '#') {
      throw new Error('Numeric HTML character reference exceeds the 64-character entity limit.')
    }
    if (semicolon < 0 || semicolon - ampersand > MAX_ENTITY_LENGTH) {
      outputLength = appendBounded(parts, '&', outputLength, MAX_DECODE_INPUT_LENGTH)
      cursor = ampersand + 1
      continue
    }

    const body = input.slice(ampersand + 1, semicolon)
    let replacement: string | undefined
    if (body.startsWith('#')) {
      const numeric = body.slice(1)
      const isHex = numeric.startsWith('x') || numeric.startsWith('X')
      const digits = isHex ? numeric.slice(1) : numeric
      const validDigits = isHex ? /^[0-9a-fA-F]+$/.test(digits) : /^[0-9]+$/.test(digits)
      if (!validDigits || digits.length > 7) {
        throw new Error(`Malformed numeric HTML character reference "&${body};".`)
      }
      const codePoint = Number.parseInt(digits, isHex ? 16 : 10)
      if (!Number.isSafeInteger(codePoint) || codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff)) {
        throw new Error(`Invalid Unicode code point in HTML character reference "&${body};".`)
      }
      replacement = String.fromCodePoint(codePoint)
    } else if (/^[A-Za-z][A-Za-z0-9]+$/.test(body) && Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, body)) {
      replacement = NAMED_ENTITIES[body]
    }

    // Unknown or syntactically unrecognized named references are preserved verbatim.
    const value = replacement === undefined ? input.slice(ampersand, semicolon + 1) : replacement
    outputLength = appendBounded(parts, value, outputLength, MAX_DECODE_INPUT_LENGTH)
    cursor = semicolon + 1
  }
  return parts.join('')
}

/** Encode/decode textual HTML character references locally; this does not parse HTML. */
export function transformHtmlEntities(input: string, options: Record<string, string>): string {
  if (typeof input !== 'string') throw new Error('HTML entity input must be text.')
  const parsed = getOptions(options)
  return parsed.operation === 'encode' ? encode(input, parsed.encodeNonAscii) : decode(input)
}

export function run(input: string, options: Record<string, string> = {}): string {
  return transformHtmlEntities(input, options)
}
