import type { ToolOptions } from '@/app/tools/types'

export const MAX_INPUT_LENGTH = 100_000

export const CASE_MODES = [
  'camel',
  'pascal',
  'snake',
  'kebab',
  'constant',
  'title',
  'sentence',
  'lower',
  'upper',
] as const

export type CaseMode = (typeof CASE_MODES)[number]

const TOKEN_PATTERN = /[\p{L}\p{N}][\p{L}\p{M}\p{N}]*/gu
const MARK_PATTERN = /^\p{M}$/u
const NUMBER_PATTERN = /^\p{N}$/u
const UPPER_PATTERN = /^[\p{Lu}\p{Lt}]$/u
const LOWER_PATTERN = /^\p{Ll}$/u

function isNumber(character: string): boolean {
  return NUMBER_PATTERN.test(character)
}

function isUpper(character: string): boolean {
  return UPPER_PATTERN.test(character)
}

function isLower(character: string): boolean {
  return LOWER_PATTERN.test(character)
}

function splitWordBoundaries(word: string): string[] {
  const characters = [...word]
  const nextBaseCharacters = new Array<string | undefined>(characters.length)
  let nextBaseCharacter: string | undefined

  for (let index = characters.length - 1; index >= 0; index -= 1) {
    nextBaseCharacters[index] = nextBaseCharacter
    if (!MARK_PATTERN.test(characters[index])) nextBaseCharacter = characters[index]
  }

  const parts: string[] = []
  let current = ''
  let previousBase: string | undefined

  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index]
    const isMark = MARK_PATTERN.test(character)
    const next = nextBaseCharacters[index]
    const letterNumberBoundary = !isMark
      && previousBase !== undefined
      && isNumber(previousBase) !== isNumber(character)
    const lowerToUpperBoundary = !isMark
      && previousBase !== undefined
      && isLower(previousBase)
      && isUpper(character)
    const acronymBoundary = !isMark
      && previousBase !== undefined
      && isUpper(previousBase)
      && isUpper(character)
      && next !== undefined
      && isLower(next)

    if (current && (letterNumberBoundary || lowerToUpperBoundary || acronymBoundary)) {
      parts.push(current)
      current = character
    } else {
      current += character
    }

    if (!isMark) previousBase = character
  }

  if (current) parts.push(current)
  return parts
}

function tokenize(input: string): string[] {
  const tokens = input.match(TOKEN_PATTERN) ?? []
  return tokens.flatMap(splitWordBoundaries)
}

function lowercaseFirstCharacter(value: string): string {
  const [first, ...rest] = [...value]
  return first === undefined ? '' : first.toLowerCase() + rest.join('').toLowerCase()
}

function uppercaseFirstCharacter(value: string): string {
  const [first, ...rest] = [...value]
  return first === undefined ? '' : first.toUpperCase() + rest.join('').toLowerCase()
}

function validateOptions(options: ToolOptions): CaseMode {
  if (options === null || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('Options must be an object containing only the mode option.')
  }

  const unknownOptions = Object.keys(options).filter(key => key !== 'mode')
  if (unknownOptions.length > 0) {
    throw new Error(`Unknown option${unknownOptions.length > 1 ? 's' : ''}: ${unknownOptions.join(', ')}.`)
  }

  const mode = options.mode ?? 'camel'
  if (!CASE_MODES.some(validMode => validMode === mode)) {
    throw new Error(`Invalid mode. Choose one of: ${CASE_MODES.join(', ')}.`)
  }

  return mode as CaseMode
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string') throw new Error('Input must be a string.')
  if (input.length > MAX_INPUT_LENGTH) {
    throw new Error(`Input exceeds the ${MAX_INPUT_LENGTH.toLocaleString('en-US')}-character limit.`)
  }

  const mode = validateOptions(options)
  if (mode === 'lower') return input.toLowerCase()
  if (mode === 'upper') return input.toUpperCase()
  if (mode === 'sentence') {
    return input.toLowerCase().replace(/\p{L}/u, character => character.toUpperCase())
  }

  const words = tokenize(input)
  switch (mode) {
    case 'camel':
      return words.map((word, index) => index === 0
        ? lowercaseFirstCharacter(word)
        : uppercaseFirstCharacter(word)).join('')
    case 'pascal':
      return words.map(uppercaseFirstCharacter).join('')
    case 'snake':
      return words.map(word => word.toLowerCase()).join('_')
    case 'kebab':
      return words.map(word => word.toLowerCase()).join('-')
    case 'constant':
      return words.map(word => word.toUpperCase()).join('_')
    case 'title':
      return words.map(uppercaseFirstCharacter).join(' ')
    default:
      throw new Error('Unsupported case mode.')
  }
}
