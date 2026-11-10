export interface RGBColor {
    r: number
    g: number
    b: number
}

export interface HSLColor {
    h: number
    s: number
    l: number
}

export interface HSVColor {
    h: number
    s: number
    v: number
}

export interface CMYKColor {
    c: number
    m: number
    y: number
    k: number
}

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsv' | 'cmyk' | 'name'
export const COLOR_FORMATS: readonly ColorFormat[] = ['hex', 'rgb', 'hsl', 'hsv', 'cmyk', 'name']
export const MAX_COLOR_INPUT_LENGTH = 128

const namedColors = new Map<string, RGBColor>([
    ['black', { r: 0, g: 0, b: 0 }],
    ['white', { r: 255, g: 255, b: 255 }],
    ['red', { r: 255, g: 0, b: 0 }],
    ['green', { r: 0, g: 128, b: 0 }],
    ['blue', { r: 0, g: 0, b: 255 }],
    ['yellow', { r: 255, g: 255, b: 0 }],
    ['cyan', { r: 0, g: 255, b: 255 }],
    ['magenta', { r: 255, g: 0, b: 255 }],
    ['orange', { r: 255, g: 165, b: 0 }],
    ['purple', { r: 128, g: 0, b: 128 }],
    ['pink', { r: 255, g: 192, b: 203 }],
    ['brown', { r: 165, g: 42, b: 42 }],
    ['gray', { r: 128, g: 128, b: 128 }],
    ['lightgray', { r: 211, g: 211, b: 211 }],
    ['darkgray', { r: 169, g: 169, b: 169 }],
    ['olive', { r: 128, g: 128, b: 0 }],
    ['lime', { r: 0, g: 255, b: 0 }],
    ['teal', { r: 0, g: 128, b: 128 }],
    ['navy', { r: 0, g: 0, b: 128 }],
    ['maroon', { r: 128, g: 0, b: 0 }],
    ['coral', { r: 255, g: 127, b: 80 }],
    ['gold', { r: 255, g: 215, b: 0 }],
    ['silver', { r: 192, g: 192, b: 192 }],
])

export function isValidHex(hex: string): boolean {
    return /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex.trim())
}

export function isValidRGB(value: string): boolean {
    return parseRGBString(value) !== null
}

export function isValidHSL(value: string): boolean {
    return parseHSLString(value) !== null
}

export function hexToRGB(hex: string): RGBColor {
    let cleanHex = hex.trim().replace(/^#/, '')
    if (!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(cleanHex)) {
        throw new Error('Expected a 3- or 6-digit hexadecimal color.')
    }
    if (cleanHex.length === 3) cleanHex = cleanHex.split('').map((character) => character + character).join('')
    return {
        r: Number.parseInt(cleanHex.slice(0, 2), 16),
        g: Number.parseInt(cleanHex.slice(2, 4), 16),
        b: Number.parseInt(cleanHex.slice(4, 6), 16),
    }
}

export function rgbToHex(rgb: RGBColor): string {
    const channel = (value: number) => Math.round(Math.max(0, Math.min(255, Number.isFinite(value) ? value : 0)))
        .toString(16).padStart(2, '0')
    return `#${[rgb.r, rgb.g, rgb.b].map(channel).join('')}`
}

export function rgbToHSL(rgb: RGBColor): HSLColor {
    const r = rgb.r / 255
    const g = rgb.g / 255
    const b = rgb.b / 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const delta = max - min
    const l = (max + min) / 2
    let h = 0
    let s = 0

    if (delta !== 0) {
        s = delta / (1 - Math.abs(2 * l - 1))
        if (max === r) h = ((g - b) / delta) % 6
        else if (max === g) h = (b - r) / delta + 2
        else h = (r - g) / delta + 4
        h *= 60
        if (h < 0) h += 360
    }
    return { h: Math.round(h) % 360, s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function hslToRGB(hsl: HSLColor): RGBColor {
    const h = (((hsl.h % 360) + 360) % 360) / 360
    const s = Math.max(0, Math.min(100, hsl.s)) / 100
    const l = Math.max(0, Math.min(100, hsl.l)) / 100
    if (s === 0) {
        const gray = Math.round(l * 255)
        return { r: gray, g: gray, b: gray }
    }
    const hueToChannel = (offset: number) => {
        let t = h + offset
        if (t < 0) t += 1
        if (t > 1) t -= 1
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
    }
    return {
        r: Math.round(hueToChannel(1 / 3) * 255),
        g: Math.round(hueToChannel(0) * 255),
        b: Math.round(hueToChannel(-1 / 3) * 255),
    }
}

export function rgbToHSV(rgb: RGBColor): HSVColor {
    const r = rgb.r / 255
    const g = rgb.g / 255
    const b = rgb.b / 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const delta = max - min
    let h = 0
    if (delta !== 0) {
        if (max === r) h = ((g - b) / delta) % 6
        else if (max === g) h = (b - r) / delta + 2
        else h = (r - g) / delta + 4
        h *= 60
        if (h < 0) h += 360
    }
    return {
        h: Math.round(h) % 360,
        s: max === 0 ? 0 : Math.round((delta / max) * 100),
        v: Math.round(max * 100),
    }
}

export function hsvToRGB(hsv: HSVColor): RGBColor {
    const h = (((hsv.h % 360) + 360) % 360) / 60
    const s = Math.max(0, Math.min(100, hsv.s)) / 100
    const v = Math.max(0, Math.min(100, hsv.v)) / 100
    const chroma = v * s
    const x = chroma * (1 - Math.abs((h % 2) - 1))
    const m = v - chroma
    let channels: [number, number, number]
    if (h < 1) channels = [chroma, x, 0]
    else if (h < 2) channels = [x, chroma, 0]
    else if (h < 3) channels = [0, chroma, x]
    else if (h < 4) channels = [0, x, chroma]
    else if (h < 5) channels = [x, 0, chroma]
    else channels = [chroma, 0, x]
    return {
        r: Math.round((channels[0] + m) * 255),
        g: Math.round((channels[1] + m) * 255),
        b: Math.round((channels[2] + m) * 255),
    }
}

export function rgbToCMYK(rgb: RGBColor): CMYKColor {
    const r = rgb.r / 255
    const g = rgb.g / 255
    const b = rgb.b / 255
    const k = 1 - Math.max(r, g, b)
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 }
    return {
        c: Math.round(((1 - r - k) / (1 - k)) * 100),
        m: Math.round(((1 - g - k) / (1 - k)) * 100),
        y: Math.round(((1 - b - k) / (1 - k)) * 100),
        k: Math.round(k * 100),
    }
}

export function cmykToRGB(cmyk: CMYKColor): RGBColor {
    const c = Math.max(0, Math.min(100, cmyk.c)) / 100
    const m = Math.max(0, Math.min(100, cmyk.m)) / 100
    const y = Math.max(0, Math.min(100, cmyk.y)) / 100
    const k = Math.max(0, Math.min(100, cmyk.k)) / 100
    return {
        r: Math.round(255 * (1 - c) * (1 - k)),
        g: Math.round(255 * (1 - m) * (1 - k)),
        b: Math.round(255 * (1 - y) * (1 - k)),
    }
}

export function parseRGBString(value: string): RGBColor | null {
    const match = value.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i)
    if (!match) return null
    const channels = match.slice(1).map(Number)
    if (channels.some((channel) => channel > 255)) return null
    return { r: channels[0], g: channels[1], b: channels[2] }
}

export function parseHSLString(value: string): HSLColor | null {
    const match = value.match(/^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/i)
    if (!match) return null
    const [h, s, l] = match.slice(1).map(Number)
    if (h > 360 || s > 100 || l > 100) return null
    return { h, s, l }
}

export function parseHSVString(value: string): HSVColor | null {
    const match = value.match(/^hsv\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/i)
    if (!match) return null
    const [h, s, v] = match.slice(1).map(Number)
    if (h > 360 || s > 100 || v > 100) return null
    return { h, s, v }
}

export function parseCMYKString(value: string): CMYKColor | null {
    const match = value.match(/^cmyk\(\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/i)
    if (!match) return null
    const [c, m, y, k] = match.slice(1).map(Number)
    if ([c, m, y, k].some((channel) => channel > 100)) return null
    return { c, m, y, k }
}

export function parseColorString(value: string): RGBColor | null {
    if (typeof value !== 'string' || value.length > MAX_COLOR_INPUT_LENGTH) return null
    const input = value.trim()
    if (!input) return null
    if (input.startsWith('#')) return isValidHex(input) ? hexToRGB(input) : null

    const normalized = input.toLowerCase()
    if (/^rgb\s*\(/.test(normalized)) return parseRGBString(normalized)
    if (/^hsl\s*\(/.test(normalized)) {
        const hsl = parseHSLString(normalized)
        return hsl ? hslToRGB(hsl) : null
    }
    if (/^hsv\s*\(/.test(normalized)) {
        const hsv = parseHSVString(normalized)
        return hsv ? hsvToRGB(hsv) : null
    }
    if (/^cmyk\s*\(/.test(normalized)) {
        const cmyk = parseCMYKString(normalized)
        return cmyk ? cmykToRGB(cmyk) : null
    }

    // Map.has / Map.get avoid treating inherited object properties as named colors.
    const namedColor = namedColors.get(normalized)
    return namedColor ? { ...namedColor } : null
}

export function getColorName(rgb: RGBColor): string {
    const { h, s, l } = rgbToHSL(rgb)
    if (l < 10) return 'Black'
    if (l > 90) return 'White'
    if (s < 15) return l < 50 ? 'Dark Gray' : 'Gray'
    if (h < 15 || h >= 345) return 'Red'
    if (h < 45) return 'Orange'
    if (h < 75) return 'Yellow'
    if (h < 150) return 'Green'
    if (h < 195) return 'Teal'
    if (h < 255) return 'Blue'
    if (h < 300) return 'Purple'
    return 'Pink'
}

export function getHueComplementaryColor(rgb: RGBColor): RGBColor {
    const hsl = rgbToHSL(rgb)
    return hslToRGB({ ...hsl, h: (hsl.h + 180) % 360 })
}

export function getAnalogousColors(rgb: RGBColor): RGBColor[] {
    const { h, s, l } = rgbToHSL(rgb)
    return [-30, 0, 30].map((offset) => hslToRGB({ h: (h + offset + 360) % 360, s, l }))
}

export function getTriadicColors(rgb: RGBColor): RGBColor[] {
    const { h, s, l } = rgbToHSL(rgb)
    return [0, 120, 240].map((offset) => hslToRGB({ h: (h + offset) % 360, s, l }))
}

export function getColorBrightness(rgb: RGBColor): number {
    return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
}

function linearizeChannel(value: number): number {
    const normalized = Math.max(0, Math.min(255, value)) / 255
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
}

export function getRelativeLuminance(rgb: RGBColor): number {
    return 0.2126 * linearizeChannel(rgb.r) + 0.7152 * linearizeChannel(rgb.g) + 0.0722 * linearizeChannel(rgb.b)
}

export function getContrastRatio(first: RGBColor, second: RGBColor): number {
    const firstLuminance = getRelativeLuminance(first)
    const secondLuminance = getRelativeLuminance(second)
    const lighter = Math.max(firstLuminance, secondLuminance)
    const darker = Math.min(firstLuminance, secondLuminance)
    return (lighter + 0.05) / (darker + 0.05)
}

export function isLightColor(rgb: RGBColor): boolean {
    return getRelativeLuminance(rgb) > 0.179
}

export function getContrastColor(rgb: RGBColor): RGBColor {
    const black = { r: 0, g: 0, b: 0 }
    const white = { r: 255, g: 255, b: 255 }
    return getContrastRatio(rgb, black) >= getContrastRatio(rgb, white) ? black : white
}

export function formatColor(rgb: RGBColor, format: ColorFormat): string {
    switch (format) {
        case 'hex':
            return rgbToHex(rgb)
        case 'rgb':
            return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
        case 'hsl': {
            const hsl = rgbToHSL(rgb)
            return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
        }
        case 'hsv': {
            const hsv = rgbToHSV(rgb)
            return `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`
        }
        case 'cmyk': {
            const cmyk = rgbToCMYK(rgb)
            return `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`
        }
        case 'name':
            return getColorName(rgb)
    }
}

export function run(input: string, options: Record<string, unknown> = {}): string {
    for (const key of Object.keys(options)) {
        if (key !== 'format') throw new Error(`Unsupported option: ${key}`)
    }
    const format = options.format ?? 'hex'
    if (typeof format !== 'string' || !COLOR_FORMATS.includes(format as ColorFormat)) {
        throw new Error(`Unsupported color format: ${String(format)}`)
    }
    const rgb = parseColorString(input)
    if (!rgb) throw new Error(`Invalid color. Enter HEX, RGB, HSL, HSV, CMYK, or a supported color name (up to ${MAX_COLOR_INPUT_LENGTH} characters).`)
    return formatColor(rgb, format as ColorFormat)
}
