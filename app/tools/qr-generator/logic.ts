import QRCode from 'qrcode'
import type { ToolOptions } from '@/app/tools/types'

const MAX_PAYLOAD_BYTES = 1_200
const MAX_SVG_CHARACTERS = 512_000
const ERROR_CORRECTION_LEVELS = ['L', 'M', 'Q', 'H'] as const

type ErrorCorrectionLevel = (typeof ERROR_CORRECTION_LEVELS)[number]

function parseBoundedInteger(
  value: string | undefined,
  optionName: string,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  if (value === undefined) return fallback
  if (!/^\d+$/.test(value)) {
    throw new Error(`${optionName} must be a whole number from ${minimum} to ${maximum}.`)
  }

  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${optionName} must be a whole number from ${minimum} to ${maximum}.`)
  }
  return parsed
}

function validateOptions(options: ToolOptions): {
  errorCorrectionLevel: ErrorCorrectionLevel
  margin: number
  scale: number
} {
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw new Error('Options must be an object.')
  }

  const supportedOptions = new Set(['errorCorrection', 'margin', 'scale'])
  const unknownOption = Object.keys(options).find(key => !supportedOptions.has(key))
  if (unknownOption) throw new Error(`Unknown option: ${unknownOption}.`)

  const errorCorrection = options.errorCorrection ?? 'M'
  if (!ERROR_CORRECTION_LEVELS.includes(errorCorrection as ErrorCorrectionLevel)) {
    throw new Error('errorCorrection must be one of L, M, Q, or H.')
  }

  return {
    errorCorrectionLevel: errorCorrection as ErrorCorrectionLevel,
    margin: parseBoundedInteger(options.margin, 'margin', 4, 0, 16),
    scale: parseBoundedInteger(options.scale, 'scale', 4, 1, 16),
  }
}

export async function run(input: string, options: ToolOptions = {}): Promise<string> {
  if (typeof input !== 'string' || input.length === 0) {
    throw new Error('Enter text or a URL to encode as a QR Code.')
  }

  if (new TextEncoder().encode(input).length > MAX_PAYLOAD_BYTES) {
    throw new Error(`Payload must be no more than ${MAX_PAYLOAD_BYTES.toLocaleString('en-US')} UTF-8 bytes.`)
  }

  const validated = validateOptions(options)
  let svg: string
  try {
    svg = await QRCode.toString(input, {
      type: 'svg',
      errorCorrectionLevel: validated.errorCorrectionLevel,
      margin: validated.margin,
      scale: validated.scale,
    })
  } catch {
    throw new Error('This payload cannot be encoded at the selected error-correction level. Shorten it or choose a lower level.')
  }

  if (svg.length > MAX_SVG_CHARACTERS) {
    throw new Error('Generated SVG exceeded the output size limit.')
  }
  if (!svg.startsWith('<svg xmlns=') || !svg.trimEnd().endsWith('</svg>')) {
    throw new Error('QR Code encoder returned invalid SVG output.')
  }

  return svg
}
