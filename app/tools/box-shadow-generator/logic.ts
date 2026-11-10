export interface BoxShadow {
  inset: boolean
  offsetX: number
  offsetY: number
  blur: number
  spread: number
  color: string
}

export interface BoxShadowResult {
  shadows: BoxShadow[]
  css: string
}

export const MAX_SHADOWS = 5

export const presetShadows: { name: string; shadows: BoxShadow[] }[] = [
  {
    name: 'Subtle',
    shadows: [
      { inset: false, offsetX: 0, offsetY: 2, blur: 4, spread: 0, color: 'rgba(0,0,0,0.1)' }
    ]
  },
  {
    name: 'Medium',
    shadows: [
      { inset: false, offsetX: 0, offsetY: 4, blur: 6, spread: 0, color: 'rgba(0,0,0,0.15)' }
    ]
  },
  {
    name: 'Large',
    shadows: [
      { inset: false, offsetX: 0, offsetY: 10, blur: 20, spread: 0, color: 'rgba(0,0,0,0.2)' }
    ]
  },
  {
    name: 'Elevated',
    shadows: [
      { inset: false, offsetX: 0, offsetY: 20, blur: 30, spread: -8, color: 'rgba(0,0,0,0.15)' }
    ]
  },
  {
    name: 'Inner',
    shadows: [
      { inset: true, offsetX: 0, offsetY: 4, blur: 6, spread: 0, color: 'rgba(0,0,0,0.1)' }
    ]
  },
  {
    name: 'Glow',
    shadows: [
      { inset: false, offsetX: 0, offsetY: 0, blur: 20, spread: 0, color: 'rgba(59,130,246,0.4)' }
    ]
  },
  {
    name: 'Neumorphism',
    shadows: [
      { inset: false, offsetX: 4, offsetY: 4, blur: 8, spread: 0, color: 'rgba(0,0,0,0.15)' },
      { inset: false, offsetX: -4, offsetY: -4, blur: 8, spread: 0, color: 'rgba(255,255,255,0.8)' }
    ]
  },
  {
    name: 'Depth',
    shadows: [
      { inset: false, offsetX: 0, offsetY: 1, blur: 2, spread: 0, color: 'rgba(0,0,0,0.07)' },
      { inset: false, offsetX: 0, offsetY: 2, blur: 4, spread: 0, color: 'rgba(0,0,0,0.07)' },
      { inset: false, offsetX: 0, offsetY: 4, blur: 8, spread: 0, color: 'rgba(0,0,0,0.07)' }
    ]
  }
]

const namedColorHex: Record<string, string> = {
  red: '#ff0000', blue: '#0000ff', green: '#008000', yellow: '#ffff00',
  orange: '#ffa500', purple: '#800080', pink: '#ffc0cb', brown: '#a52a2a',
  black: '#000000', white: '#ffffff', gray: '#808080', cyan: '#00ffff',
  magenta: '#ff00ff', lime: '#00ff00', teal: '#008080', navy: '#000080',
  maroon: '#800000', coral: '#ff7f50', gold: '#ffd700', silver: '#c0c0c0',
  transparent: '#000000'
}

const namedColors = new Set(Object.keys(namedColorHex))
const numericBounds = {
  offsetX: [-50, 50],
  offsetY: [-50, 50],
  blur: [0, 100],
  spread: [-50, 50]
} as const

type ShadowField = keyof BoxShadow

export function isValidColor(color: unknown): color is string {
  if (typeof color !== 'string') return false
  const value = color.trim()
  if (/^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(value)) return true

  const rgb = value.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|1|0?\.\d+))?\s*\)$/i)
  if (rgb && rgb.slice(1, 4).every(channel => Number(channel) <= 255)) return true

  const hsl = value.match(/^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%(?:\s*,\s*(0|1|0?\.\d+))?\s*\)$/i)
  if (hsl && Number(hsl[1]) <= 360 && Number(hsl[2]) <= 100 && Number(hsl[3]) <= 100) return true

  return namedColors.has(value.toLowerCase())
}

function validateShadow(shadow: unknown, index: number): asserts shadow is BoxShadow {
  if (!shadow || typeof shadow !== 'object') {
    throw new Error(`Shadow ${index + 1} must be an object.`)
  }

  const candidate = shadow as Partial<BoxShadow>
  if (typeof candidate.inset !== 'boolean') {
    throw new Error(`Shadow ${index + 1} inset must be a boolean.`)
  }

  for (const field of Object.keys(numericBounds) as (keyof typeof numericBounds)[]) {
    const value = candidate[field]
    const [min, max] = numericBounds[field]
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
      throw new Error(`Shadow ${index + 1} ${field} must be a finite number from ${min} to ${max}.`)
    }
  }

  if (!isValidColor(candidate.color)) {
    throw new Error(`Shadow ${index + 1} has an invalid color.`)
  }
}

function validateShadowList(shadows: unknown): asserts shadows is BoxShadow[] {
  if (!Array.isArray(shadows)) throw new Error('Shadows must be a list.')
  if (shadows.length > MAX_SHADOWS) throw new Error(`A maximum of ${MAX_SHADOWS} shadows is allowed.`)
  shadows.forEach(validateShadow)
}

export function generateBoxShadowCSS(shadows: BoxShadow[]): string {
  validateShadowList(shadows)
  if (shadows.length === 0) return 'none'

  return shadows.map(shadow => {
    const parts: string[] = []
    if (shadow.inset) parts.push('inset')
    parts.push(`${shadow.offsetX}px`, `${shadow.offsetY}px`, `${shadow.blur}px`)
    if (shadow.spread !== 0) parts.push(`${shadow.spread}px`)
    parts.push(shadow.color.trim())
    return parts.join(' ')
  }).join(', ')
}

export function addShadow(shadows: BoxShadow[]): BoxShadow[] {
  validateShadowList(shadows)
  if (shadows.length >= MAX_SHADOWS) throw new Error(`A maximum of ${MAX_SHADOWS} shadows is allowed.`)
  return [...shadows, { inset: false, offsetX: 0, offsetY: 4, blur: 6, spread: 0, color: 'rgba(0,0,0,0.15)' }]
}

export function removeShadow(shadows: BoxShadow[], index: number): BoxShadow[] {
  validateShadowList(shadows)
  if (!Number.isInteger(index) || index < 0 || index >= shadows.length) {
    throw new Error('Choose a shadow that exists to remove it.')
  }
  return shadows.filter((_, shadowIndex) => shadowIndex !== index)
}

export function updateShadow(shadows: BoxShadow[], index: number, field: ShadowField, value: unknown): BoxShadow[] {
  validateShadowList(shadows)
  if (!Number.isInteger(index) || index < 0 || index >= shadows.length) {
    throw new Error('Choose a shadow that exists before editing it.')
  }
  if (!['inset', 'offsetX', 'offsetY', 'blur', 'spread', 'color'].includes(field)) {
    throw new Error('Choose a supported shadow property to edit.')
  }

  if (field === 'inset' && typeof value !== 'boolean') {
    throw new Error('Inset must be a boolean.')
  }
  if (field === 'color' && !isValidColor(value)) {
    throw new Error('Enter a supported CSS color.')
  }
  if (field in numericBounds) {
    const [min, max] = numericBounds[field as keyof typeof numericBounds]
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
      throw new Error(`${field} must be a finite number from ${min} to ${max}.`)
    }
  }

  return shadows.map((shadow, shadowIndex) => shadowIndex === index
    ? { ...shadow, [field]: field === 'color' ? (value as string).trim() : value }
    : shadow)
}

function channelToHex(channel: number): string {
  return Math.round(channel).toString(16).padStart(2, '0')
}

function hslToHex(hue: number, saturationPercent: number, lightnessPercent: number): string {
  const saturation = saturationPercent / 100
  const lightness = lightnessPercent / 100
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const segment = hue / 60
  const secondary = chroma * (1 - Math.abs((segment % 2) - 1))
  const [red, green, blue] = segment < 1 ? [chroma, secondary, 0]
    : segment < 2 ? [secondary, chroma, 0]
      : segment < 3 ? [0, chroma, secondary]
        : segment < 4 ? [0, secondary, chroma]
          : segment < 5 ? [secondary, 0, chroma]
            : [chroma, 0, secondary]
  const match = lightness - chroma / 2
  return `#${channelToHex((red + match) * 255)}${channelToHex((green + match) * 255)}${channelToHex((blue + match) * 255)}`
}

/** Convert accepted CSS colors to the opaque RGB value shown by HTML's color input. */
export function colorToPickerHex(color: string): string {
  if (!isValidColor(color)) throw new Error('Enter a supported CSS color.')
  const value = color.trim().toLowerCase()

  if (value.startsWith('#')) {
    const hex = value.slice(1)
    if (hex.length === 3 || hex.length === 4) {
      return `#${hex.slice(0, 3).split('').map(channel => channel.repeat(2)).join('')}`
    }
    return `#${hex.slice(0, 6)}`
  }

  const rgb = value.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/)
  if (rgb) return `#${rgb.slice(1, 4).map(channel => channelToHex(Number(channel))).join('')}`

  const hsl = value.match(/^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%/)
  if (hsl) return hslToHex(Number(hsl[1]), Number(hsl[2]), Number(hsl[3]))

  return namedColorHex[value]
}
