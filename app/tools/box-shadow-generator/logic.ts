
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

export function generateBoxShadowCSS(shadows: BoxShadow[]): string {
  if (!shadows || shadows.length === 0) return 'none'
  
  return shadows.map(shadow => {
    const finite = (value: number, min: number, max: number) => Math.max(min, Math.min(max, Number.isFinite(value) ? value : 0))
    const parts: string[] = []
    
    if (shadow.inset) parts.push('inset')
    parts.push(`${finite(shadow.offsetX, -1000, 1000)}px`)
    parts.push(`${finite(shadow.offsetY, -1000, 1000)}px`)
    parts.push(`${finite(shadow.blur, 0, 1000)}px`)
    const spread = finite(shadow.spread, -1000, 1000)
    if (spread !== 0) parts.push(`${spread}px`)
    parts.push(isValidColor(shadow.color) ? shadow.color.trim() : 'rgba(0, 0, 0, 0.15)')
    
    return parts.join(' ')
  }).join(', ')
}

export function addShadow(shadows: BoxShadow[]): BoxShadow[] {
  return [...shadows, { inset: false, offsetX: 0, offsetY: 4, blur: 6, spread: 0, color: 'rgba(0,0,0,0.15)' }]
}

export function removeShadow(shadows: BoxShadow[], index: number): BoxShadow[] {
  if (shadows.length <= 1) return shadows
  return shadows.filter((_, i) => i !== index)
}

export function updateShadow(shadows: BoxShadow[], index: number, field: keyof BoxShadow, value: unknown): BoxShadow[] {
  if (index < 0 || index >= shadows.length) return shadows
  if (['offsetX', 'offsetY', 'blur', 'spread'].includes(field) && (typeof value !== 'number' || !Number.isFinite(value))) return shadows
  return shadows.map((shadow, i) => i === index ? { ...shadow, [field]: value } : shadow)
}

export function isValidColor(color: string): boolean {
  if (typeof color !== 'string') return false
  color = color.trim()
  // hex
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color)) return true
  // RGB
  const rgb = color.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i)
  if (rgb && rgb.slice(1).every(value => Number(value) <= 255)) return true
  // RGBA
  const rgba = color.match(/^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/i)
  if (rgba && rgba.slice(1, 4).every(value => Number(value) <= 255) && Number(rgba[4]) <= 1) return true
  // HSL
  const hsl = color.match(/^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/i)
  if (hsl && Number(hsl[1]) <= 360 && Number(hsl[2]) <= 100 && Number(hsl[3]) <= 100) return true
  // nmd colors
  const namedColors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'cyan', 'magenta', 'lime', 'teal', 'navy', 'maroon', 'coral', 'gold', 'silver']
  if (namedColors.includes(color.toLowerCase())) return true
  // trsprt
  if (color.toLowerCase() === 'transparent') return true
  return false
}