export interface RegexMatch {
  match: string
  index: number
  groups?: Record<string, string>
}

export type RegexMode = 'test' | 'replace' | 'split'

export interface RegexOptions {
  pattern?: string
  flags?: string
  mode?: RegexMode
  replacement?: string
}

export interface RegexRequest {
  pattern: string
  flags: string
  text: string
  mode: RegexMode
  replacement: string
}

export interface RegexResult {
  matches: RegexMatch[]
  count: number
  error?: string
  flags: string
  pattern: string
  display?: string
  parts?: string[]
}

export const MAX_PATTERN_CHARS = 500
export const MAX_INPUT_CHARS = 200_000
export const MAX_REPLACEMENT_CHARS = 200_000
export const MAX_MATCHES = 5_000
export const MAX_SPLIT_PARTS = 10_001
export const MAX_OUTPUT_CHARS = 500_000
export const WORKER_TIMEOUT_MS = 500

/** Self-contained so its exact implementation can be embedded in a Blob Worker. */
function processRegexRequest(data: RegexRequest): RegexResult {
  const MAX_PATTERN_CHARS = 500
  const MAX_INPUT_CHARS = 200_000
  const MAX_REPLACEMENT_CHARS = 200_000
  const MAX_MATCHES = 5_000
  const MAX_SPLIT_PARTS = 10_001
  const MAX_OUTPUT_CHARS = 500_000
  const JOINER = '\n\n─────\n\n'

  const { pattern, flags, text, mode, replacement } = data
  const emptyResult = (): RegexResult => ({ matches: [], count: 0, flags, pattern })
  try {
    if (typeof pattern !== 'string' || pattern.length > MAX_PATTERN_CHARS) {
      throw new Error('Pattern limit: 500 characters.')
    }
    if (typeof text !== 'string' || text.length > MAX_INPUT_CHARS) {
      throw new Error('Input limit: 200,000 characters.')
    }
    if (typeof flags !== 'string') throw new Error('Invalid regex flags.')
    if (!['test', 'replace', 'split'].includes(mode)) throw new Error('Choose test, replace, or split mode.')
    if (typeof replacement !== 'string' || replacement.length > MAX_REPLACEMENT_CHARS) {
      throw new Error('Replacement limit: 200,000 characters.')
    }

    const regex = new RegExp(pattern, flags)
    if (mode === 'replace') {
      let count = 0
      let outputLength = 0
      let lastEnd = 0
      const display = text.replace(regex, (...args: unknown[]) => {
        count += 1
        if (count > MAX_MATCHES) throw new Error('More than 5,000 matches. Refine the pattern or shorten the input.')

        const namedGroups = args[args.length - 1]
        const hasNamedGroups = typeof namedGroups === 'object' && namedGroups !== null
        const offsetArgIndex = args.length - (hasNamedGroups ? 3 : 2)
        const match = String(args[0])
        const offset = Number(args[offsetArgIndex])
        const captures = args.slice(1, offsetArgIndex).map(value => value === undefined ? undefined : String(value))
        const groups = hasNamedGroups ? namedGroups as Record<string, string | undefined> : undefined
        const gapLength = offset - lastEnd
        if (gapLength < 0) throw new Error('Regex produced an invalid match range.')
        let substitutionLength = 0
        const chunks: string[] = []
        const remaining = MAX_OUTPUT_CHARS - outputLength - gapLength
        const append = (chunk: string) => {
          substitutionLength += chunk.length
          if (substitutionLength > remaining) throw new Error('Replacement output exceeds 500,000 characters.')
          chunks.push(chunk)
        }

        for (let i = 0; i < replacement.length;) {
          if (replacement[i] !== '$' || i + 1 >= replacement.length) {
            append(replacement[i])
            i += 1
            continue
          }
          const next = replacement[i + 1]
          if (next === '$') {
            append('$')
            i += 2
          } else if (next === '&') {
            append(match)
            i += 2
          } else if (next === '`') {
            append(text.slice(0, offset))
            i += 2
          } else if (next === "'") {
            append(text.slice(offset + match.length))
            i += 2
          } else if (next === '<' && groups) {
            const close = replacement.indexOf('>', i + 2)
            if (close < 0) {
              append('$')
              i += 1
            } else {
              const key = replacement.slice(i + 2, close)
              append(Object.hasOwn(groups, key) ? groups[key] ?? '' : '')
              i = close + 1
            }
          } else if (next >= '0' && next <= '9' && next !== '0') {
            const first = Number(next)
            const secondCharacter = replacement[i + 2]
            const twoDigit = secondCharacter !== undefined && secondCharacter >= '0' && secondCharacter <= '9'
              ? Number(`${first}${secondCharacter}`)
              : 0
            if (twoDigit > 0 && twoDigit <= captures.length) {
              append(captures[twoDigit - 1] ?? '')
              i += 3
            } else if (first <= captures.length) {
              append(captures[first - 1] ?? '')
              i += 2
            } else {
              append('$')
              i += 1
            }
          } else {
            append('$')
            i += 1
          }
        }
        outputLength += gapLength + substitutionLength
        lastEnd = offset + match.length
        return chunks.join('')
      })
      if (display.length > MAX_OUTPUT_CHARS) throw new Error('Replacement output exceeds 500,000 characters.')
      return { matches: [], count, flags, pattern, display }
    }

    if (mode === 'split') {
      const splitFlags = `${flags.replace(/[gy]/g, '')}y`
      const splitter = new RegExp(pattern, splitFlags)
      const parts: string[] = []
      let displayLength = 0
      let delimiterCount = 0
      let start = 0
      let search = 0
      const pushPart = (part: string) => {
        if (parts.length >= MAX_SPLIT_PARTS) throw new Error('Split produced more than 10,001 parts.')
        const nextLength = displayLength + (parts.length ? JOINER.length : 0) + part.length
        if (nextLength > MAX_OUTPUT_CHARS) throw new Error('Split output exceeds 500,000 characters.')
        displayLength = nextLength
        parts.push(part)
      }
      const advanceStringIndex = (index: number) => {
        const codePoint = text.codePointAt(index)
        return index + (flags.includes('u') && codePoint !== undefined && codePoint > 0xFFFF ? 2 : 1)
      }

      if (text.length === 0) {
        splitter.lastIndex = 0
        if (splitter.exec(text) === null) pushPart('')
      } else {
        while (search < text.length) {
          splitter.lastIndex = search
          const match = splitter.exec(text)
          if (match === null) {
            search = advanceStringIndex(search)
            continue
          }
          const end = Math.min(splitter.lastIndex, text.length)
          if (end === start) {
            search = advanceStringIndex(search)
            continue
          }
          pushPart(text.slice(start, search))
          delimiterCount += 1
          start = end
          search = start
        }
        pushPart(text.slice(start))
      }
      return { matches: [], count: delimiterCount, flags, pattern, display: parts.join(JOINER), parts }
    }

    const matches: RegexMatch[] = []
    let match: RegExpExecArray | null
    while ((match = regex.exec(text)) !== null) {
      const groups: Record<string, string> = Object.create(null) as Record<string, string>
      if (match.groups) Object.assign(groups, match.groups)
      for (let i = 1; i < match.length; i++) {
        const key = String(i)
        if (match[i] !== undefined && !Object.hasOwn(groups, key)) groups[key] = match[i]
      }
      matches.push({
        match: match[0],
        index: match.index,
        groups: Object.keys(groups).length ? groups : undefined,
      })
      if (matches.length > MAX_MATCHES) throw new Error('More than 5,000 matches. Refine the pattern or shorten the input.')
      if (!flags.includes('g')) break
      if (match[0].length === 0) {
        const codePoint = text.codePointAt(regex.lastIndex)
        regex.lastIndex += flags.includes('u') && codePoint !== undefined && codePoint > 0xFFFF ? 2 : 1
      }
    }
    return { matches, count: matches.length, flags, pattern }
  } catch (cause) {
    return {
      ...emptyResult(),
      error: cause instanceof Error ? cause.message : 'Regex failed.',
    }
  }
}

export function executeRegex(request: RegexRequest): RegexResult {
  return processRegexRequest(request)
}

export function createRegexWorkerSource(): string {
  return `const processRegexRequest = ${processRegexRequest.toString()};\nself.onmessage = ({ data }) => { self.postMessage(processRegexRequest(data)); };`
}

export function runRegexInWorker(
  request: RegexRequest,
  timeoutMs = WORKER_TIMEOUT_MS,
): Promise<RegexResult> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([createRegexWorkerSource()], { type: 'text/javascript' }))
    let worker: Worker
    try {
      worker = new Worker(url)
    } catch {
      URL.revokeObjectURL(url)
      reject(new Error('The isolated regex worker failed.'))
      return
    }
    let settled = false
    const cleanup = () => {
      clearTimeout(timer)
      worker.terminate()
      URL.revokeObjectURL(url)
    }
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      cleanup()
      reject(new Error('Pattern timed out after 500 ms. Check for catastrophic backtracking.'))
    }, timeoutMs)
    worker.onmessage = event => {
      if (settled) return
      settled = true
      cleanup()
      resolve(event.data as RegexResult)
    }
    worker.onerror = () => {
      if (settled) return
      settled = true
      cleanup()
      reject(new Error('The isolated regex worker failed.'))
    }
    worker.postMessage(request)
  })
}

export function isValidRegex(pattern: string): boolean {
  try {
    new RegExp(pattern)
    return true
  } catch {
    return false
  }
}

export function testRegex(pattern: string, flags: string, text: string): RegexResult {
  return executeRegex({ pattern, flags, text, mode: 'test', replacement: '' })
}

export function replaceRegex(pattern: string, flags: string, text: string, replacement: string): string {
  const result = executeRegex({ pattern, flags, text, mode: 'replace', replacement })
  if (result.error) throw new Error(result.error)
  return result.display ?? ''
}

export function splitRegex(pattern: string, flags: string, text: string): string[] {
  const result = executeRegex({ pattern, flags, text, mode: 'split', replacement: '' })
  if (result.error) throw new Error(result.error)
  return result.parts ?? []
}

export function run(input: string, options: RegexOptions = {}): string {
  if (typeof input !== 'string') throw new Error('Input must be a string.')
  const result = executeRegex({
    pattern: options.pattern ?? '',
    flags: options.flags ?? 'g',
    text: input,
    mode: options.mode ?? 'test',
    replacement: options.replacement ?? '',
  })
  if (result.error) throw new Error(result.error)
  if (result.display !== undefined) return result.display
  if (!result.matches.length) return 'No matches.'
  const lines = result.matches.map(item => `${item.index}: ${item.match || '∅'}${item.groups ? ` (${Object.entries(item.groups).map(([key, value]) => `$${key}=${value}`).join(', ')})` : ''}`)
  const output = lines.join('\n')
  if (output.length > MAX_OUTPUT_CHARS) throw new Error('Match output exceeds 500,000 characters.')
  return output
}

export const commonPatterns: { name: string; pattern: string; flags: string; description: string }[] = [
  { name: 'Email', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', flags: 'i', description: 'Validates email addresses' },
  { name: 'URL', pattern: '^https?://[\\w\\-]+(\\.[\\w\\-]+)+[/#?]?.*$', flags: 'i', description: 'Matches URLs (http/https)' },
  { name: 'Phone (US)', pattern: '^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$', flags: '', description: 'US phone number format' },
  { name: 'IP Address', pattern: '^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$', flags: '', description: 'IPv4 address' },
  { name: 'Date (YYYY-MM-DD)', pattern: '^\\d{4}-\\d{2}-\\d{2}$', flags: '', description: 'Date in YYYY-MM-DD format' },
  { name: 'Hex Color', pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$', flags: '', description: 'Hex color codes (#fff, #ffffff)' },
  { name: 'Username', pattern: '^[a-zA-Z0-9_]{3,16}$', flags: '', description: 'Username (3-16 chars, letters, numbers, underscore)' },
  { name: 'Password', pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$', flags: '', description: 'Strong password' },
  { name: 'HTML Tag', pattern: '<[^>]+>', flags: 'g', description: 'Matches HTML tags' },
  { name: 'JSON', pattern: '^\\s*(\\{.*\\}|\\[.*\\])\\s*$', flags: 's', description: 'Validates JSON structure' },
  { name: 'Slug', pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$', flags: '', description: 'URL slug' },
  { name: 'Credit Card', pattern: '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9][0-9])[0-9]{12})$', flags: '', description: 'Credit card numbers' },
]

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export const flagOptions = [
  { value: 'g', label: 'Global (g)', description: 'Find all matches' },
  { value: 'i', label: 'Case Insensitive (i)', description: 'Ignore case' },
  { value: 'm', label: 'Multiline (m)', description: '^ and $ match start/end of lines' },
  { value: 's', label: 'Dot All (s)', description: '. matches newlines' },
  { value: 'u', label: 'Unicode (u)', description: 'Unicode support' },
  { value: 'y', label: 'Sticky (y)', description: 'Matches only from lastIndex' },
]

export function getFlagString(selectedFlags: string[]): string {
  return [...selectedFlags].sort().join('')
}
