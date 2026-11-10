import type { ToolOptions } from '@/app/tools/types'

const VOCABULARY = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure reprehenderit voluptate velit esse cillum fugiat nulla pariatur'.split(' ')
const MAX_OUTPUT_CHARACTERS = 500_000

function boundedInteger(value: string | undefined, name: string, fallback: number, minimum: number, maximum: number): number {
  const candidate = value ?? String(fallback)
  if (typeof candidate !== 'string' || !/^\d+$/.test(candidate)) throw new Error(`${name} must be a whole number from ${minimum} to ${maximum}.`)
  const number = Number(candidate)
  if (!Number.isSafeInteger(number) || number < minimum || number > maximum) throw new Error(`${name} must be a whole number from ${minimum} to ${maximum}.`)
  return number
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string' || input.length !== 0) throw new Error('This tool does not accept input text.')
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('Options must be an object.')
  const allowed = new Set(['paragraphs', 'sentencesPerParagraph', 'wordsPerSentence', 'format'])
  const unknown = Object.keys(options).find(key => !allowed.has(key))
  if (unknown) throw new Error(`Unknown option: ${unknown}.`)
  for (const [key, value] of Object.entries(options)) if (typeof value !== 'string') throw new Error(`${key} must be a string.`)

  const paragraphs = boundedInteger(options.paragraphs, 'paragraphs', 3, 1, 50)
  const sentences = boundedInteger(options.sentencesPerParagraph, 'sentencesPerParagraph', 3, 1, 20)
  const words = boundedInteger(options.wordsPerSentence, 'wordsPerSentence', 12, 3, 50)
  const format = options.format ?? 'paragraphs'
  if (!['paragraphs', 'single'].includes(format)) throw new Error('format must be paragraphs or single.')

  let wordIndex = 0
  const blocks = Array.from({ length: paragraphs }, () => {
    const sentencesInBlock = Array.from({ length: sentences }, () => {
      const sentenceWords = Array.from({ length: words }, () => VOCABULARY[wordIndex++ % VOCABULARY.length])
      sentenceWords[0] = sentenceWords[0][0].toUpperCase() + sentenceWords[0].slice(1)
      return `${sentenceWords.join(' ')}.`
    })
    return sentencesInBlock.join(' ')
  })
  const output = blocks.join(format === 'paragraphs' ? '\n\n' : ' ')
  if (output.length > MAX_OUTPUT_CHARACTERS) throw new Error('Generated text exceeds the 500,000-character output limit.')
  return output
}
