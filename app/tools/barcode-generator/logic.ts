import type { ToolOptions } from '@/app/tools/types'
import bwipjs from 'bwip-js/browser'

const FORMATS = new Set(['code128', 'code39', 'ean13', 'ean8', 'upca', 'itf14'])

function parseInteger(value: string | undefined, name: string, fallback: number, min: number, max: number): number {
  const candidate = value ?? String(fallback)
  if (typeof candidate !== 'string' || !/^\d+$/.test(candidate)) throw new Error(`${name} must be a whole number from ${min} to ${max}.`)
  const number = Number(candidate)
  if (!Number.isSafeInteger(number) || number < min || number > max) throw new Error(`${name} must be a whole number from ${min} to ${max}.`)
  return number
}

export function run(input: string, options: ToolOptions = {}): string {
  if (typeof input !== 'string' || input.trim() === '') throw new Error('Enter text or digits to encode as a barcode.')
  if (new TextEncoder().encode(input).length > 256) throw new Error('Barcode input must be no more than 256 UTF-8 bytes.')
  if (/[\u0000-\u001f\u007f]/.test(input)) throw new Error('Barcode input cannot contain control characters or line breaks.')
  if (!options || typeof options !== 'object' || Array.isArray(options)) throw new Error('Options must be an object.')
  const allowed = new Set(['format', 'scale', 'height', 'includeText'])
  const unknown = Object.keys(options).find(key => !allowed.has(key))
  if (unknown) throw new Error(`Unknown option: ${unknown}.`)
  for (const [key, value] of Object.entries(options)) if (typeof value !== 'string') throw new Error(`${key} must be a string.`)

  const format = options.format ?? 'code128'
  if (!FORMATS.has(format)) throw new Error('format must be one of code128, code39, ean13, ean8, upca, or itf14.')
  const scale = parseInteger(options.scale, 'scale', 3, 1, 8)
  const height = parseInteger(options.height, 'height', 12, 5, 40)
  const includeText = options.includeText ?? 'true'
  if (!['true', 'false'].includes(includeText)) throw new Error('includeText must be true or false.')

  const digits = input.trim()
  const digitLengths: Record<string, number[]> = { ean13: [12, 13], ean8: [7, 8], upca: [11, 12], itf14: [13, 14] }
  if (digitLengths[format] && (!/^\d+$/.test(digits) || !digitLengths[format].includes(digits.length))) {
    throw new Error(`${format} requires ${digitLengths[format].join(' or ')} numeric digits.`)
  }

  try {
    const svg = bwipjs.toSVG({
      bcid: format,
      text: digits,
      scale,
      height,
      includetext: includeText === 'true',
    })
    if (svg.length > 500_000 || !svg.startsWith('<svg') || !svg.trimEnd().endsWith('</svg>')) {
      throw new Error('Barcode encoder returned invalid or oversized SVG output.')
    }
    return svg
  } catch (cause) {
    if (cause instanceof Error && /invalid or oversized SVG/.test(cause.message)) throw cause
    throw new Error(`Could not encode this value as ${format}. Check that the data matches the selected barcode format.`)
  }
}
