
export interface GradientStop {
  color: string
  position: number // 0-100
}

export interface Gradient {
  type: 'linear' | 'radial' | 'conic'
  angle?: number // f/ linear
  shape?: 'circle' | 'ellipse' // f/ radial
  position?: string // f/ radial
  stops: GradientStop[]
}

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

export function generateGradientCSS(gradient: Gradient): string {
  const stops = gradient.stops
    .sort((a, b) => a.position - b.position)
    .map(stop => `${stop.color} ${stop.position}%`)
    .join(', ')

  if (gradient.type === 'linear') {
    const angle = gradient.angle || 90
    return `background: linear-gradient(${angle}deg, ${stops})`
  }

  if (gradient.type === 'radial') {
    const shape = gradient.shape || 'circle'
    const position = gradient.position || 'center'
    return `background: radial-gradient(${shape} at ${position}, ${stops})`
  }

  // conic
  const angle = gradient.angle || 0
  return `background: conic-gradient(from ${angle}deg, ${stops})`
}

export function generatePreviewStyle(gradient: Gradient): string {
  return generateGradientCSS(gradient)
}

export function isValidColor(color: string): boolean {
  // hex
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color)) return true
  // RGB
  if (/^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/.test(color)) return true
  // HSL
  if (/^hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)$/.test(color)) return true
  // nmd colors
  const namedColors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'cyan', 'magenta', 'lime', 'teal', 'navy', 'maroon', 'coral', 'gold', 'silver']
  if (namedColors.includes(color.toLowerCase())) return true
  return false
}

export function addStop(gradient: Gradient, color: string, position: number): Gradient {
  const newStops = [...gradient.stops, { color, position }]
  return { ...gradient, stops: newStops }
}

export function removeStop(gradient: Gradient, index: number): Gradient {
  if (gradient.stops.length <= 2) return gradient
  const newStops = gradient.stops.filter((_, i) => i !== index)
  return { ...gradient, stops: newStops }
}

export function updateStop(gradient: Gradient, index: number, color: string, position: number): Gradient {
  const newStops = gradient.stops.map((stop, i) => 
    i === index ? { color, position } : stop
  )
  return { ...gradient, stops: newStops }
}

export function generateRandomGradient(): Gradient {
  const colors = [
    '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6bff',
    '#00d2ff', '#ff9a9e', '#fecfef', '#a18cd1', '#fbc2eb',
    '#f12711', '#f5af19', '#11998e', '#38ef7d', '#4facfe',
    '#00f2fe', '#f093fb', '#f5576c', '#2b5876', '#4e4376'
  ]
  
  const numStops = Math.floor(Math.random() * 3) + 2 // 2-4 stops
  const stops: GradientStop[] = []
  const usedColors: string[] = []
  
  for (let i = 0; i < numStops; i++) {
    let color
    do {
      color = colors[Math.floor(Math.random() * colors.length)]
    } while (usedColors.includes(color))
    usedColors.push(color)
    
    const position = Math.round((i / (numStops - 1)) * 100)
    stops.push({ color, position })
  }
  
  return {
    type: 'linear',
    angle: Math.floor(Math.random() * 360),
    stops
  }
}