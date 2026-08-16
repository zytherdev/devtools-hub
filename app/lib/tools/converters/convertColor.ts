/* eslint-disable prefer-const */

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

// ===== validar =====
export function isValidHex(hex: string): boolean {
    return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex)
}

export function isValidRGB(rgb: string): boolean {
    return /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/.test(rgb)
}

export function isValidHSL(hsl: string): boolean {
    return /^hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)$/.test(hsl)
}

// ===== hex =====
export function hexToRGB(hex: string): RGBColor {
    let cleanHex = hex.replace('#', '')
    
    // #fff -> #ffffff
    if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map(c => c + c).join('')
    }
    
    // 8-digit hex with alpha
    if (cleanHex.length === 8) {
        return {
            r: parseInt(cleanHex.substring(0, 2), 16),
            g: parseInt(cleanHex.substring(2, 4), 16),
            b: parseInt(cleanHex.substring(4, 6), 16)
        }
    }
    
    return {
        r: parseInt(cleanHex.substring(0, 2), 16),
        g: parseInt(cleanHex.substring(2, 4), 16),
        b: parseInt(cleanHex.substring(4, 6), 16)
    }
}

export function rgbToHex(rgb: RGBColor): string {
    const { r, g, b } = rgb
    return `#${[r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')}`
}

// ===== rgb =====
export function rgbToHSL(rgb: RGBColor): HSLColor {
    let { r, g, b } = rgb
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2

    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6
                break
            case g:
                h = ((b - r) / d + 2) / 6
                break
            case b:
                h = ((r - g) / d + 4) / 6
                break
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    }
}

export function hslToRGB(hsl: HSLColor): RGBColor {
    let { h, s, l } = hsl
    h /= 360
    s /= 100
    l /= 100

    let r, g, b
    if (s === 0) {
        r = g = b = l
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1/6) return p + (q - p) * 6 * t
            if (t < 1/2) return q
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
            return p
        }
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        r = hue2rgb(p, q, h + 1/3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1/3)
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    }
}

// ===== hsv =====
export function rgbToHSV(rgb: RGBColor): HSVColor {
    let { r, g, b } = rgb
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min
    let h = 0
    const s = max === 0 ? 0 : d / max
    const v = max

    if (max !== min) {
        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6
                break
            case g:
                h = ((b - r) / d + 2) / 6
                break
            case b:
                h = ((r - g) / d + 4) / 6
                break
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    }
}

export function hsvToRGB(hsv: HSVColor): RGBColor {
    let { h, s, v } = hsv
    h /= 360
    s /= 100
    v /= 100

    const i = Math.floor(h * 6)
    const f = h * 6 - i
    const p = v * (1 - s)
    const q = v * (1 - f * s)
    const t = v * (1 - (1 - f) * s)

    let r, g, b
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break
        case 1: r = q; g = v; b = p; break
        case 2: r = p; g = v; b = t; break
        case 3: r = p; g = q; b = v; break
        case 4: r = t; g = p; b = v; break
        case 5: r = v; g = p; b = q; break
        default: r = v; g = t; b = p; break
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    }
}

// ===== cmyk =====
export function rgbToCMYK(rgb: RGBColor): CMYKColor {
    let { r, g, b } = rgb
    r /= 255
    g /= 255
    b /= 255

    const k = 1 - Math.max(r, g, b)
    if (k === 1) {
        return { c: 0, m: 0, y: 0, k: 100 }
    }
    const c = (1 - r - k) / (1 - k)
    const m = (1 - g - k) / (1 - k)
    const y = (1 - b - k) / (1 - k)

    return {
        c: Math.round(c * 100),
        m: Math.round(m * 100),
        y: Math.round(y * 100),
        k: Math.round(k * 100)
    }
}

export function cmykToRGB(cmyk: CMYKColor): RGBColor {
    let { c, m, y, k } = cmyk
    c /= 100
    m /= 100
    y /= 100
    k /= 100

    return {
        r: Math.round(255 * (1 - c) * (1 - k)),
        g: Math.round(255 * (1 - m) * (1 - k)),
        b: Math.round(255 * (1 - y) * (1 - k))
    }
}

// ===== str parsers  =====
export function parseRGBString(str: string): RGBColor | null {
    const match = str.match(/rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/)
    if (!match) return null
    return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) }
}

export function parseHSLString(str: string): HSLColor | null {
    const match = str.match(/hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)/)
    if (!match) return null
    return { h: parseInt(match[1]), s: parseInt(match[2]), l: parseInt(match[3]) }
}

export function parseColorString(str: string): RGBColor | null {
    str = str.trim().toLowerCase()
    
    // hex
    if (str.startsWith('#')) {
        try {
            return hexToRGB(str)
        } catch {
            return null
        }
    }
    
    // rgb
    if (str.startsWith('rgb')) {
        return parseRGBString(str)
    }
    
    // hsl
    if (str.startsWith('hsl')) {
        const hsl = parseHSLString(str)
        if (hsl) return hslToRGB(hsl)
        return null
    }
    
    // named - básicos
    const namedColors: Record<string, RGBColor> = {
        black: { r: 0, g: 0, b: 0 },
        white: { r: 255, g: 255, b: 255 },
        red: { r: 255, g: 0, b: 0 },
        green: { r: 0, g: 128, b: 0 },
        blue: { r: 0, g: 0, b: 255 },
        yellow: { r: 255, g: 255, b: 0 },
        cyan: { r: 0, g: 255, b: 255 },
        magenta: { r: 255, g: 0, b: 255 },
        orange: { r: 255, g: 165, b: 0 },
        purple: { r: 128, g: 0, b: 128 },
        pink: { r: 255, g: 192, b: 203 },
        brown: { r: 165, g: 42, b: 42 },
        gray: { r: 128, g: 128, b: 128 },
        lightgray: { r: 211, g: 211, b: 211 },
        darkgray: { r: 169, g: 169, b: 169 },
        olive: { r: 128, g: 128, b: 0 },
        lime: { r: 0, g: 255, b: 0 },
        teal: { r: 0, g: 128, b: 128 },
        navy: { r: 0, g: 0, b: 128 },
        maroon: { r: 128, g: 0, b: 0 },
        coral: { r: 255, g: 127, b: 80 },
        gold: { r: 255, g: 215, b: 0 },
        silver: { r: 192, g: 192, b: 192 },
    }
    
    if (str in namedColors) {
        return namedColors[str]
    }
    
    return null
}

// ===== utils =====
export function getColorName(rgb: RGBColor): string {
    // Simple color naming based on HSL
    const hsl = rgbToHSL(rgb)
    const { h, s, l } = hsl
    
    if (l < 10) return 'Black'
    if (l > 90) return 'White'
    if (s < 15) return l < 50 ? 'Dark Gray' : 'Gray'
    
    if (h < 15 || h >= 345) return 'Red'
    if (h >= 15 && h < 45) return 'Orange'
    if (h >= 45 && h < 75) return 'Yellow'
    if (h >= 75 && h < 150) return 'Green'
    if (h >= 150 && h < 195) return 'Teal'
    if (h >= 195 && h < 255) return 'Blue'
    if (h >= 255 && h < 300) return 'Purple'
    if (h >= 300 && h < 345) return 'Pink'
    
    return 'Unknown'
}

export function getComplementaryColor(rgb: RGBColor): RGBColor {
    return {
        r: 255 - rgb.r,
        g: 255 - rgb.g,
        b: 255 - rgb.b
    }
}

export function getAnalogousColors(rgb: RGBColor): RGBColor[] {
    const hsl = rgbToHSL(rgb)
    const colors: RGBColor[] = []
    
    for (let i = -30; i <= 30; i += 30) {
        const newHsl = {
            h: (hsl.h + i + 360) % 360,
            s: hsl.s,
            l: hsl.l
        }
        colors.push(hslToRGB(newHsl))
    }
    
    return colors
}

export function getTriadicColors(rgb: RGBColor): RGBColor[] {
    const hsl = rgbToHSL(rgb)
    const colors: RGBColor[] = []
    
    for (let i = 0; i < 3; i++) {
        const newHsl = {
            h: (hsl.h + i * 120) % 360,
            s: hsl.s,
            l: hsl.l
        }
        colors.push(hslToRGB(newHsl))
    }
    
    return colors
}

export function getColorBrightness(rgb: RGBColor): number {
    // std luminance fml
    return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
}

export function isLightColor(rgb: RGBColor): boolean {
    return getColorBrightness(rgb) > 0.5
}

export function getContrastColor(rgb: RGBColor): RGBColor {
    return isLightColor(rgb) ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 }
}