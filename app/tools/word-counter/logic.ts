import type { ToolOptions } from '@/app/tools/types'

export const MAX_INPUT_LENGTH = 1_000_000
const WORDS_PER_MINUTE = 200
const WHITESPACE = /^\s+$/u
const SENTENCE_ENDING = /[.!?…]+/u

export type WordCountResult = {
  words: number
  characters: number
  charactersWithoutWhitespace: number
  lines: number
  paragraphs: number
  sentences: number
  readingMinutes: number
}

function validateOptions(options: unknown): void {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('As opções devem ser um objeto vazio; esta ferramenta não aceita opções.')
  }

  const keys = Reflect.ownKeys(options)
  if (keys.length > 0) {
    const name = String(keys[0])
    throw new Error(`Opção desconhecida: "${name}". Esta ferramenta não aceita opções.`)
  }

  const prototype = Object.getPrototypeOf(options)
  if (prototype !== Object.prototype && prototype !== null) {
    throw new Error('As opções devem ser um objeto vazio; esta ferramenta não aceita opções.')
  }
}

function countWords(input: string): number {
  if (typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' })
    let count = 0
    for (const part of segmenter.segment(input)) {
      if (part.isWordLike) count += 1
    }
    return count
  }

  // Fallback para ambientes sem Intl.Segmenter: letras, marcas combinantes e números.
  const words = input.match(/[\p{L}\p{N}\p{M}]+(?:['’][\p{L}\p{N}\p{M}]+)*/gu)
  return words?.length ?? 0
}

function countCharacters(input: string): { characters: number; charactersWithoutWhitespace: number } {
  let characters = 0
  let charactersWithoutWhitespace = 0

  if (typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    for (const part of segmenter.segment(input)) {
      characters += 1
      if (!WHITESPACE.test(part.segment)) charactersWithoutWhitespace += 1
    }
    return { characters, charactersWithoutWhitespace }
  }

  for (const character of Array.from(input)) {
    characters += 1
    if (!WHITESPACE.test(character)) charactersWithoutWhitespace += 1
  }
  return { characters, charactersWithoutWhitespace }
}

function countLines(input: string): number {
  return input === '' ? 0 : input.split(/\r\n|\r|\n/u).length
}

function countParagraphs(input: string): number {
  if (input === '') return 0

  let paragraphs = 0
  let insideParagraph = false
  for (const line of input.split(/\r\n|\r|\n/u)) {
    if (line.trim().length === 0) {
      insideParagraph = false
    } else if (!insideParagraph) {
      paragraphs += 1
      insideParagraph = true
    }
  }
  return paragraphs
}

function countSentences(input: string): number {
  if (typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'sentence' })
    let count = 0
    for (const part of segmenter.segment(input)) {
      if (part.segment.trim().length > 0) count += 1
    }
    return count
  }

  // Fallback simples: separa nas sequências de pontuação final de frase.
  return input
    .split(SENTENCE_ENDING)
    .filter(part => part.trim().length > 0)
    .length
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string') {
    throw new Error('A entrada deve ser uma string.')
  }
  if (input.length > MAX_INPUT_LENGTH) {
    throw new Error(`A entrada deve ter no máximo ${MAX_INPUT_LENGTH.toLocaleString('pt-BR')} caracteres.`)
  }

  validateOptions(options)

  const words = countWords(input)
  const { characters, charactersWithoutWhitespace } = countCharacters(input)
  const result: WordCountResult = {
    words,
    characters,
    charactersWithoutWhitespace,
    lines: countLines(input),
    paragraphs: countParagraphs(input),
    sentences: countSentences(input),
    readingMinutes: words / WORDS_PER_MINUTE,
  }

  return JSON.stringify(result)
}
