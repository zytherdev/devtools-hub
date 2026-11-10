import type { ToolOptions } from '@/app/tools/types'

type MimeEntry = { mime: string; extensions: string[] }
type Target = 'auto' | 'extension' | 'mime'
type Mode = 'lookup' | 'validate'

/** Curated local reference data; deliberately not a complete IANA registry. */
const MIME_ENTRIES: MimeEntry[] = [
  { mime: 'application/json', extensions: ['json', 'map'] },
  { mime: 'application/ld+json', extensions: ['jsonld'] },
  { mime: 'application/xml', extensions: ['xml', 'xsl', 'xslt'] },
  { mime: 'application/pdf', extensions: ['pdf'] },
  { mime: 'application/zip', extensions: ['zip'] },
  { mime: 'application/gzip', extensions: ['gz', 'tar.gz'] },
  { mime: 'application/x-tar', extensions: ['tar'] },
  { mime: 'application/x-7z-compressed', extensions: ['7z'] },
  { mime: 'application/vnd.rar', extensions: ['rar'] },
  { mime: 'application/octet-stream', extensions: ['bin', 'exe', 'dll', 'so'] },
  { mime: 'application/wasm', extensions: ['wasm'] },
  { mime: 'application/rtf', extensions: ['rtf'] },
  { mime: 'application/epub+zip', extensions: ['epub'] },
  { mime: 'application/vnd.ms-excel', extensions: ['xls'] },
  { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extensions: ['xlsx'] },
  { mime: 'application/msword', extensions: ['doc'] },
  { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extensions: ['docx'] },
  { mime: 'application/vnd.ms-powerpoint', extensions: ['ppt'] },
  { mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', extensions: ['pptx'] },
  { mime: 'application/vnd.apple.mpegurl', extensions: ['m3u8'] },
  { mime: 'application/x-sh', extensions: ['sh'] },
  { mime: 'application/x-httpd-php', extensions: ['php'] },
  { mime: 'application/x-sql', extensions: ['sql'] },
  { mime: 'application/javascript', extensions: ['js', 'mjs', 'cjs'] },
  { mime: 'text/typescript', extensions: ['ts', 'tsx'] },
  { mime: 'text/html', extensions: ['html', 'htm'] },
  { mime: 'text/css', extensions: ['css'] },
  { mime: 'text/csv', extensions: ['csv'] },
  { mime: 'text/plain', extensions: ['txt', 'text', 'log'] },
  { mime: 'text/markdown', extensions: ['md', 'markdown'] },
  { mime: 'text/xml', extensions: ['xml'] },
  { mime: 'text/yaml', extensions: ['yaml', 'yml'] },
  { mime: 'image/avif', extensions: ['avif'] },
  { mime: 'image/bmp', extensions: ['bmp'] },
  { mime: 'image/gif', extensions: ['gif'] },
  { mime: 'image/jpeg', extensions: ['jpg', 'jpeg'] },
  { mime: 'image/png', extensions: ['png'] },
  { mime: 'image/svg+xml', extensions: ['svg'] },
  { mime: 'image/webp', extensions: ['webp'] },
  { mime: 'image/x-icon', extensions: ['ico'] },
  { mime: 'audio/aac', extensions: ['aac'] },
  { mime: 'audio/midi', extensions: ['mid', 'midi'] },
  { mime: 'audio/mpeg', extensions: ['mp3'] },
  { mime: 'audio/ogg', extensions: ['oga', 'ogg', 'opus'] },
  { mime: 'audio/wav', extensions: ['wav'] },
  { mime: 'audio/webm', extensions: ['weba'] },
  { mime: 'video/mp4', extensions: ['mp4', 'm4v'] },
  { mime: 'video/mpeg', extensions: ['mpeg', 'mpg'] },
  { mime: 'video/ogg', extensions: ['ogv'] },
  { mime: 'video/webm', extensions: ['webm'] },
  { mime: 'font/otf', extensions: ['otf'] },
  { mime: 'font/ttf', extensions: ['ttf'] },
  { mime: 'font/woff', extensions: ['woff'] },
  { mime: 'font/woff2', extensions: ['woff2'] },
]

const MIME_BY_TYPE = new Map(MIME_ENTRIES.map(entry => [entry.mime, entry]))
const EXTENSION_TO_MIME = new Map<string, string>()
for (const entry of MIME_ENTRIES) {
  for (const extension of entry.extensions) {
    // Keep the first curated association when a suffix has multiple conventions (e.g. .xml).
    if (!EXTENSION_TO_MIME.has(extension)) EXTENSION_TO_MIME.set(extension, entry.mime)
  }
}
const KNOWN_SUFFIXES = [...EXTENSION_TO_MIME.keys()].sort((a, b) => b.length - a.length)
const MAX_INPUT_LENGTH = 512
const MAX_OUTPUT_LENGTH = 8192
const TOKEN = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/
const EXTENSION = /^[a-z0-9][a-z0-9._+-]{0,63}$/i

function validateOptions(options: ToolOptions): { mode: Mode; target: Target } {
  const allowed = new Set(['mode', 'target'])
  for (const key of Object.keys(options)) {
    if (!allowed.has(key)) throw new Error(`Unknown option "${key}". Use mode or target.`)
  }
  const mode = options.mode ?? 'lookup'
  const target = options.target ?? 'auto'
  if (mode !== 'lookup' && mode !== 'validate') throw new Error('mode must be "lookup" or "validate".')
  if (target !== 'auto' && target !== 'extension' && target !== 'mime') {
    throw new Error('target must be "auto", "extension", or "mime".')
  }
  return { mode, target }
}

function parseMime(value: string): { canonical: string; base: string } | null {
  if (/[\x00-\x08\x0a-\x1f\x7f]/.test(value)) return null
  const input = value.trim()
  const firstSemicolon = input.indexOf(';')
  const rawBase = (firstSemicolon === -1 ? input : input.slice(0, firstSemicolon)).trim()
  const slash = rawBase.indexOf('/')
  if (slash < 1 || slash !== rawBase.lastIndexOf('/')) return null
  const type = rawBase.slice(0, slash)
  const subtype = rawBase.slice(slash + 1)
  if (!TOKEN.test(type) || !TOKEN.test(subtype) || type === '*' || subtype === '*') return null
  const base = `${type.toLowerCase()}/${subtype.toLowerCase()}`
  const parameters: string[] = []
  let cursor = firstSemicolon === -1 ? input.length : firstSemicolon
  const seen = new Set<string>()

  while (cursor < input.length) {
    while (cursor < input.length && /\s/.test(input[cursor])) cursor += 1
    if (cursor === input.length) break
    if (input[cursor] !== ';') return null
    cursor += 1
    while (cursor < input.length && /\s/.test(input[cursor])) cursor += 1
    const nameStart = cursor
    while (cursor < input.length && /[!#$%&'*+.^_`|~0-9A-Za-z-]/.test(input[cursor])) cursor += 1
    const name = input.slice(nameStart, cursor)
    if (!name || !TOKEN.test(name) || seen.has(name.toLowerCase())) return null
    seen.add(name.toLowerCase())
    while (cursor < input.length && /\s/.test(input[cursor])) cursor += 1
    if (input[cursor] !== '=') return null
    cursor += 1
    while (cursor < input.length && /\s/.test(input[cursor])) cursor += 1

    let parameterValue = ''
    if (input[cursor] === '"') {
      const start = cursor
      cursor += 1
      let closed = false
      while (cursor < input.length) {
        const char = input[cursor]
        if (char === '\\') {
          cursor += 1
          if (cursor >= input.length || /[\r\n\x00-\x1f\x7f]/.test(input[cursor])) return null
          cursor += 1
        } else if (char === '"') {
          cursor += 1
          closed = true
          break
        } else if (/[\r\n\x00-\x1f\x7f]/.test(char)) {
          return null
        } else {
          cursor += 1
        }
      }
      if (!closed) return null
      parameterValue = input.slice(start, cursor)
    } else {
      const start = cursor
      while (cursor < input.length && input[cursor] !== ';' && !/\s/.test(input[cursor])) cursor += 1
      parameterValue = input.slice(start, cursor)
      if (!parameterValue || !TOKEN.test(parameterValue)) return null
    }
    parameters.push(`${name.toLowerCase()}=${parameterValue}`)
    while (cursor < input.length && /\s/.test(input[cursor])) cursor += 1
    if (cursor < input.length && input[cursor] !== ';') return null
  }

  return { base, canonical: parameters.length ? `${base}; ${parameters.join('; ')}` : base }
}

function getExtension(value: string): { extension: string; filename: string } | null {
  if (/[\x00-\x1f\x7f]/.test(value)) return null
  let basename = value.trim().replace(/\\/g, '/').split('/').pop() ?? ''
  if (basename.startsWith('.')) basename = basename.slice(1)
  const lowered = basename.toLowerCase()
  for (const suffix of KNOWN_SUFFIXES) {
    if (lowered === suffix || lowered.endsWith(`.${suffix}`)) {
      return { extension: suffix, filename: value.trim() }
    }
  }
  const lastDot = lowered.lastIndexOf('.')
  const candidate = lastDot >= 0 ? lowered.slice(lastDot + 1) : lowered
  if (!EXTENSION.test(candidate)) return null
  return { extension: candidate, filename: value.trim() }
}

function serialize(result: Record<string, unknown>): string {
  const output = JSON.stringify(result, null, 2)
  if (output.length > MAX_OUTPUT_LENGTH) throw new Error('The result exceeded the output limit.')
  return output
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string') throw new Error('Input must be text.')
  if (input.length > MAX_INPUT_LENGTH) throw new Error(`Input must be ${MAX_INPUT_LENGTH} characters or fewer.`)
  if (!input.trim()) throw new Error('Enter a filename extension or MIME type.')
  const { mode, target } = validateOptions(options)
  const trimmed = input.trim()
  const looksLikeMime = /^[^\s/;]+\/[^\s/;]+/.test(trimmed)
  const resolvedTarget = target === 'auto' ? (looksLikeMime ? 'mime' : 'extension') : target

  if (resolvedTarget === 'mime') {
    const parsed = parseMime(input)
    if (!parsed) throw new Error('Invalid MIME type syntax. Use type/subtype with optional valid parameters.')
    const knownEntry = MIME_BY_TYPE.get(parsed.base)
    if (mode === 'validate') {
      return serialize({
        mode,
        target: 'mime',
        input: trimmed,
        valid: true,
        known: Boolean(knownEntry),
        mimeType: parsed.canonical,
        extensions: knownEntry?.extensions ?? [],
        message: knownEntry ? 'Valid MIME syntax; this base type is in the local reference map.' : 'Valid MIME syntax; this type is not in the curated local map.',
      })
    }
    return serialize({
      mode,
      target: 'mime',
      input: trimmed,
      valid: true,
      known: Boolean(knownEntry),
      mimeType: parsed.base,
      extensions: knownEntry?.extensions ?? [],
      message: knownEntry ? 'Found in the curated local map.' : 'Valid MIME type, but absent from the curated local map.',
    })
  }

  const parsedExtension = getExtension(input)
  if (!parsedExtension) throw new Error('Invalid extension syntax. Enter an extension or filename with a valid extension.')
  const mimeType = EXTENSION_TO_MIME.get(parsedExtension.extension)
  if (mode === 'validate') {
    return serialize({
      mode,
      target: 'extension',
      input: trimmed,
      valid: true,
      known: Boolean(mimeType),
      extension: parsedExtension.extension,
      mimeType: mimeType ?? null,
      message: mimeType ? 'Valid extension syntax; this extension is in the local reference map.' : 'Valid extension syntax; this extension is not in the curated local map.',
    })
  }
  return serialize({
    mode,
    target: 'extension',
    input: trimmed,
    valid: true,
    known: Boolean(mimeType),
    extension: parsedExtension.extension,
    mimeType: mimeType ?? null,
    message: mimeType ? 'Found in the curated local map.' : 'Valid extension, but absent from the curated local map.',
  })
}
