
export interface SVGConversionOptions {
  format: 'background-image' | 'mask-image' | 'content' | 'url'
  addPrefix: boolean
  prefix: string
  optimize: boolean
  minify: boolean
}

export const defaultSVGOptions: SVGConversionOptions = {
  format: 'background-image',
  addPrefix: true,
  prefix: 'icon',
  optimize: true,
  minify: false,
}

export function compressSVG(svg: string): string {
  let compressed = svg
    
  // rm XML declaration
  compressed = compressed.replace(/<\?xml[^>]*\?>/g, '')
    
  // rm DOCTYPE
  compressed = compressed.replace(/<!DOCTYPE[^>]*>/g, '')
    
  // rm cmnts
  compressed = compressed.replace(/<!--[\s\S]*?-->/g, '')
    
  // rm unnecessary whitespace
  compressed = compressed.replace(/[\n\r\t]/g, ' ')
  compressed = compressed.replace(/ {2,}/g, ' ')
    
  // rm spaces between attrs
  compressed = compressed.replace(/\s*=\s*/g, '=')
    
  // rm spaces before closing
  compressed = compressed.replace(/\s+\/>/g, '/>')
    
  // rm quotes from attrs
  compressed = compressed.replace(/(\w+)=(["'])([^"'\s>]+)\2/g, '$1=$3')
    
  // rm dflt namespace
  compressed = compressed.replace(/xmlns="[^"]*"/g, '')
    
  // rm v.
  compressed = compressed.replace(/version="[^"]*"/g, '')
    
  // trm
  compressed = compressed.trim()
    
  return compressed
}

export function svgToCSS(svg: string, options: Partial<SVGConversionOptions> = {}): string {
  if (!svg || typeof svg !== 'string') return ''
    
  const opts = { ...defaultSVGOptions, ...options }
    
  let processed = svg
    
  if (opts.optimize) {
    processed = compressSVG(processed)
  }
    
  const encoded = encodeSVG(processed, opts.minify)
    
  // gen CSS
  let css = ''
  const className = opts.addPrefix ? `.${opts.prefix}` : ''
    
  switch (opts.format) {
    case 'background-image':
      css = `${className} {\n  background-image: url("data:image/svg+xml,${encoded}");\n  background-repeat: no-repeat;\n  background-size: contain;\n}`
      break
    case 'mask-image':
      css = `${className} {\n  mask-image: url("data:image/svg+xml,${encoded}");\n  mask-size: contain;\n  mask-repeat: no-repeat;\n  -webkit-mask-image: url("data:image/svg+xml,${encoded}");\n  -webkit-mask-size: contain;\n  -webkit-mask-repeat: no-repeat;\n}`
      break
    case 'content':
      css = `${className}::before {\n  content: url("data:image/svg+xml,${encoded}");\n}`
      break
    case 'url':
      css = `url("data:image/svg+xml,${encoded}")`
      break
  }
    
  return css
}

export function encodeSVG(svg: string, minify: boolean): string {
  let encoded = svg
    
  // rm nwlines
  encoded = encoded.replace(/\n/g, ' ')
    
  // rplce special characters f/ URL encoding
  const replacements: { [key: string]: string } = {
    '%': '%25',
    '#': '%23',
    '{': '%7B',
    '}': '%7D',
    '<': '%3C',
    '>': '%3E',
    '|': '%7C',
    '^': '%5E',
    '`': '%60',
    '[': '%5B',
    ']': '%5D',
    '"': '%22',
    ';': '%3B',
    '/': '%2F',
    '?': '%3F',
    ':': '%3A',
    '@': '%40',
    '&': '%26',
    '=': '%3D',
    '+': '%2B',
    '$': '%24',
    ',': '%2C',
    '!': '%21',
    "'": '%27',
    '(': '%28',
    ')': '%29',
    '*': '%2A',
  }
    
  for (const [char, code] of Object.entries(replacements)) {
    encoded = encoded.replace(new RegExp(`\\${char}`, 'g'), code)
  }
    
  // rm spaces around attrs
  if (!minify) {
    encoded = encoded.replace(/\s/g, ' ')
  }
    
  return encoded
}

export function isValidSVG(svg: string): boolean {
  if (!svg || typeof svg !== 'string') return false
    
  const trimmed = svg.trim()
    
  // SVG tag??
  if (!/<svg[\s\S]*>/i.test(trimmed)) return false
    
  // closing SVG tag??
  if (!/<\/svg>/.test(trimmed)) return false
    
  // has viewBox or width/height??
  const hasViewBox = /viewBox\s*=\s*["']([^"']*)["']/.test(trimmed)
  const hasWidth = /width\s*=\s*["']([^"']*)["']/.test(trimmed)
  const hasHeight = /height\s*=\s*["']([^"']*)["']/.test(trimmed)
    
  return hasViewBox || (hasWidth && hasHeight)
}

export const sampleSVGs = [
  {
    name: 'Star',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
</svg>`
  },
  {
    name: 'Heart',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
<path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" fill="currentColor"/>
</svg>`
  },
  {
    name: 'Check',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
<path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
</svg>`
  },
  {
    name: 'Arrow Right',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
<path d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z" fill="currentColor"/>
</svg>`
  }
]