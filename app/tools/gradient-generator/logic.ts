export interface GradientStop {
  color: string
  position: number // 0-100
}

export type GradientType = 'linear' | 'radial' | 'conic'
export type RadialShape = 'circle' | 'ellipse'
export type RadialPosition =
  | 'center'
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'top left'
  | 'top right'
  | 'bottom left'
  | 'bottom right'

export interface Gradient {
  type: GradientType
  angle?: number
  shape?: RadialShape
  position?: RadialPosition
  stops: GradientStop[]
}

export const radialPositions: RadialPosition[] = [
  'center',
  'top',
  'right',
  'bottom',
  'left',
  'top left',
  'top right',
  'bottom left',
  'bottom right'
]

export const presetGradients: { name: string; gradient: Gradient }[] = [
  {
    name: 'Sunset',
    gradient: {
      type: 'linear',
      angle: 135,
      stops: [
        { color: '#f093fb', position: 0 },
        { color: '#f5576c', position: 100 }
      ]
    }
  },
  {
    name: 'Ocean',
    gradient: {
      type: 'linear',
      angle: 120,
      stops: [
        { color: '#4facfe', position: 0 },
        { color: '#00f2fe', position: 100 }
      ]
    }
  },
  {
    name: 'Forest',
    gradient: {
      type: 'linear',
      angle: 90,
      stops: [
        { color: '#11998e', position: 0 },
        { color: '#38ef7d', position: 100 }
      ]
    }
  },
  {
    name: 'Neon',
    gradient: {
      type: 'linear',
      angle: 45,
      stops: [
        { color: '#ff6b6b', position: 0 },
        { color: '#ffd93d', position: 50 },
        { color: '#6bcb77', position: 100 }
      ]
    }
  },
  {
    name: 'Aurora',
    gradient: {
      type: 'linear',
      angle: 180,
      stops: [
        { color: '#a18cd1', position: 0 },
        { color: '#fbc2eb', position: 100 }
      ]
    }
  },
  {
    name: 'Fire',
    gradient: {
      type: 'linear',
      angle: 0,
      stops: [
        { color: '#f12711', position: 0 },
        { color: '#f5af19', position: 100 }
      ]
    }
  },
  {
    name: 'Sky',
    gradient: {
      type: 'linear',
      angle: 180,
      stops: [
        { color: '#89f7fe', position: 0 },
        { color: '#66a6ff', position: 100 }
      ]
    }
  },
  {
    name: 'Twilight',
    gradient: {
      type: 'linear',
      angle: 135,
      stops: [
        { color: '#2b5876', position: 0 },
        { color: '#4e4376', position: 100 }
      ]
    }
  }
]

const namedColors = new Set([
  'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown',
  'black', 'white', 'gray', 'grey', 'cyan', 'magenta', 'lime', 'teal',
  'navy', 'maroon', 'coral', 'gold', 'silver', 'transparent'
])

export function isValidColor(color: string): boolean {
  if (typeof color !== 'string') return false
  const value = color.trim()
  if (/^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(value)) return true

  const rgb = value.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i)
  if (rgb && rgb.slice(1, 4).every(channel => Number(channel) <= 255)) return true

  const hsl = value.match(/^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/i)
  if (hsl && Number(hsl[1]) <= 360 && Number(hsl[2]) <= 100 && Number(hsl[3]) <= 100) return true

  return namedColors.has(value.toLowerCase())
}

export function validateGradient(gradient: Gradient): string | null {
  if (!gradient || !['linear', 'radial', 'conic'].includes(gradient.type)) {
    return 'Choose a supported gradient type.'
  }
  if (!Array.isArray(gradient.stops)) return 'Color stops must be a list.'
  if (gradient.stops.length < 2) return 'A gradient needs at least 2 color stops.'
  if (gradient.stops.length > 6) return 'A gradient can have at most 6 color stops.'

  if ((gradient.type === 'linear' || gradient.type === 'conic') &&
      (!Number.isFinite(gradient.angle) || gradient.angle! < 0 || gradient.angle! > 360)) {
    return 'Angle must be a number from 0 to 360 degrees.'
  }

  if (gradient.type === 'radial') {
    if (gradient.shape !== 'circle' && gradient.shape !== 'ellipse') {
      return 'Choose circle or ellipse for the radial shape.'
    }
    if (!radialPositions.includes(gradient.position as RadialPosition)) {
      return 'Choose a supported radial gradient position.'
    }
  }

  for (const [index, stop] of gradient.stops.entries()) {
    if (!stop || !isValidColor(stop.color)) {
      return `Color stop ${index + 1} has an invalid color.`
    }
    if (!Number.isFinite(stop.position) || stop.position < 0 || stop.position > 100) {
      return `Color stop ${index + 1} position must be a number from 0 to 100.`
    }
  }
  return null
}

function requireValidGradient(gradient: Gradient): void {
  const error = validateGradient(gradient)
  if (error) throw new Error(error)
}

export function generateGradientCSS(gradient: Gradient): string {
  requireValidGradient(gradient)
  const stops = [...gradient.stops]
    .sort((a, b) => a.position - b.position)
    .map(stop => `${stop.color.trim()} ${stop.position}%`)
    .join(', ')

  if (gradient.type === 'linear') {
    return `background: linear-gradient(${gradient.angle}deg, ${stops});`
  }
  if (gradient.type === 'radial') {
    return `background: radial-gradient(${gradient.shape} at ${gradient.position}, ${stops});`
  }
  return `background: conic-gradient(from ${gradient.angle}deg, ${stops});`
}

export function generatePreviewStyle(gradient: Gradient): string {
  return generateGradientCSS(gradient)
}

export function addStop(gradient: Gradient, color: string, position: number): Gradient {
  requireValidGradient(gradient)
  if (gradient.stops.length >= 6) throw new Error('A gradient can have at most 6 color stops.')
  if (!isValidColor(color)) throw new Error('Enter a valid color for the new stop.')
  if (!Number.isFinite(position) || position < 0 || position > 100) {
    throw new Error('Stop position must be a number from 0 to 100.')
  }
  return { ...gradient, stops: [...gradient.stops, { color: color.trim(), position }] }
}

export function removeStop(gradient: Gradient, index: number): Gradient {
  if (!Number.isInteger(index) || index < 0 || index >= gradient.stops.length) {
    throw new Error('Choose an existing color stop to remove.')
  }
  if (gradient.stops.length <= 2) throw new Error('A gradient needs at least 2 color stops.')
  return { ...gradient, stops: gradient.stops.filter((_, stopIndex) => stopIndex !== index) }
}

export function updateStop(gradient: Gradient, index: number, color: string, position: number): Gradient {
  if (!Number.isInteger(index) || index < 0 || index >= gradient.stops.length) {
    throw new Error('Choose an existing color stop to update.')
  }
  if (typeof color !== 'string') throw new Error('Color must be text.')
  if (!Number.isFinite(position) || position < 0 || position > 100) {
    throw new Error('Stop position must be a number from 0 to 100.')
  }
  return {
    ...gradient,
    stops: gradient.stops.map((stop, stopIndex) =>
      stopIndex === index ? { color, position } : stop
    )
  }
}

export function generateRandomGradient(): Gradient {
  const colors = [
    '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bff',
    '#00d2ff', '#ff9a9e', '#fecfef', '#a18cd1', '#fbc2eb',
    '#f12711', '#f5af19', '#11998e', '#38ef7d', '#4facfe',
    '#00f2fe', '#f093fb', '#f5576c', '#2b5876', '#4e4376'
  ]
  const numStops = Math.floor(Math.random() * 3) + 2
  const stops: GradientStop[] = []
  const usedColors = new Set<string>()

  while (stops.length < numStops) {
    const color = colors[Math.floor(Math.random() * colors.length)]
    if (usedColors.has(color)) continue
    usedColors.add(color)
    const position = Math.round((stops.length / (numStops - 1)) * 100)
    stops.push({ color, position })
  }

  return { type: 'linear', angle: Math.floor(Math.random() * 360), stops }
}
