import type { ToolOptions } from '@/app/tools/types'

export const MAX_INPUT_CHARS = 1_000_000
export const DEFAULT_WORDS_PER_MINUTE = 200
export const MIN_WORDS_PER_MINUTE = 1
export const MAX_WORDS_PER_MINUTE = 1_000

export type TextStatistics = {
  words: number
  characters: number
  charactersWithoutWhitespace: number
  lines: number
  paragraphs: number
  readingTimeMinutes?: number
  wordsPerMinute?: number
}

const LINE_BREAK_PATTERN = /\r\n|[\n\r\u2028\u2029]/
const FALLBACK_WORD_PATTERN = /[\p{L}\p{N}][\p{L}\p{M}\p{N}]*(?:['’\-\u2010-\u2015][\p{L}\p{N}][\p{L}\p{M}\p{N}]*)*/gu

function validateInput(input: string): void {
  if (typeof input !== 'string') throw new Error('Input must be a string.')
  if (input.length > MAX_INPUT_CHARS) {
    throw new Error(`Input exceeds the ${MAX_INPUT_CHARS.toLocaleString()} character limit.`)
  }
}

function validateOptions(options: ToolOptions): { includeReadingTime: boolean; wordsPerMinute: number } {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('Options must be an object.')
  }
  const prototype = Object.getPrototypeOf(options)
  if (prototype !== Object.prototype && prototype !== null) {
    throw new Error('Options must be a plain object.')
  }
  const allowed = new Set(['includeReadingTime', 'wordsPerMinute'])
  for (const key of Object.keys(options)) {
    if (!allowed.has(key)) throw new Error(`Unsupported option: ${key}.`)
  }

  const includeValue = Object.hasOwn(options, 'includeReadingTime') ? options.includeReadingTime : 'true'
  if (includeValue !== 'true' && includeValue !== 'false') {
    throw new Error('The includeReadingTime option must be "true" or "false".')
  }

  const speedValue = Object.hasOwn(options, 'wordsPerMinute') ? options.wordsPerMinute : String(DEFAULT_WORDS_PER_MINUTE)
  if (typeof speedValue !== 'string' || !/^[1-9]\d{0,3}$/.test(speedValue)) {
    throw new Error(`The wordsPerMinute option must be an integer from ${MIN_WORDS_PER_MINUTE} to ${MAX_WORDS_PER_MINUTE}.`)
  }
  const wordsPerMinute = Number(speedValue)
  if (wordsPerMinute > MAX_WORDS_PER_MINUTE) {
    throw new Error(`The wordsPerMinute option must be an integer from ${MIN_WORDS_PER_MINUTE} to ${MAX_WORDS_PER_MINUTE}.`)
  }

  return { includeReadingTime: includeValue === 'true', wordsPerMinute }
}

function countWords(input: string): number {
  if (typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' })
    let count = 0
    for (const segment of segmenter.segment(input)) {
      if (segment.isWordLike) count += 1
    }
    return count
  }
  // Fallback for older runtimes: Unicode letters/numbers, combining marks, and
  // internal apostrophes/hyphens make a token; other punctuation separates it.
  return [...input.matchAll(FALLBACK_WORD_PATTERN)].length
}

function countCharacters(input: string): { characters: number; charactersWithoutWhitespace: number } {
  let characters = 0
  let charactersWithoutWhitespace = 0
  if (typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    for (const { segment } of segmenter.segment(input)) {
      characters += 1
      if (!/^\s+$/u.test(segment)) charactersWithoutWhitespace += 1
    }
    return { characters, charactersWithoutWhitespace }
  }

  for (const character of input) {
    characters += 1
    if (!/^\s$/u.test(character)) charactersWithoutWhitespace += 1
  }
  return { characters, charactersWithoutWhitespace }
}

function countLinesAndParagraphs(input: string): { lines: number; paragraphs: number } {
  if (input.length === 0) return { lines: 0, paragraphs: 0 }
  const lines = input.split(LINE_BREAK_PATTERN)
  let paragraphs = 0
  let inParagraph = false
  for (const line of lines) {
    if (/\S/u.test(line)) {
      if (!inParagraph) paragraphs += 1
      inParagraph = true
    } else {
      inParagraph = false
    }
  }
  return { lines: lines.length, paragraphs }
}

export function analyzeText(input: string, options: ToolOptions = {}): TextStatistics {
  validateInput(input)
  const validatedOptions = validateOptions(options)
  const { characters, charactersWithoutWhitespace } = countCharacters(input)
  const { lines, paragraphs } = countLinesAndParagraphs(input)
  const words = countWords(input)

  return {
    words,
    characters,
    charactersWithoutWhitespace,
    lines,
    paragraphs,
    ...(validatedOptions.includeReadingTime
      ? {
          readingTimeMinutes: words === 0 ? 0 : Math.ceil(words / validatedOptions.wordsPerMinute),
          wordsPerMinute: validatedOptions.wordsPerMinute,
        }
      : {}),
  }
}

export function formatStatistics(statistics: TextStatistics): string {
  const lines = [
    `Words: ${statistics.words.toLocaleString()}`,
    `Characters (grapheme clusters, including whitespace): ${statistics.characters.toLocaleString()}`,
    `Characters (excluding whitespace): ${statistics.charactersWithoutWhitespace.toLocaleString()}`,
    `Lines: ${statistics.lines.toLocaleString()}`,
    `Paragraphs: ${statistics.paragraphs.toLocaleString()}`,
  ]
  if (statistics.readingTimeMinutes !== undefined) {
    lines.push(`Estimated reading time: ${statistics.readingTimeMinutes.toLocaleString()} min at ${statistics.wordsPerMinute} words/min`)
  }
  return lines.join('\n')
}

export function run(input: string, options: ToolOptions = {}): string {
  return formatStatistics(analyzeText(input, options))
}
